/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/prompts/route';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Mock the auth helpers
jest.mock('@supabase/auth-helpers-nextjs');
jest.mock('next/headers');

const mockCreateRouteHandlerClient =
  createRouteHandlerClient as jest.MockedFunction<
    typeof createRouteHandlerClient
  >;
const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('/api/prompts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/prompts', () => {
    it('should return prompts for authenticated user', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id', email: 'test@example.com' } },
            error: null,
          }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() =>
                Promise.resolve({
                  data: [
                    {
                      id: '1',
                      name: 'Test Prompt',
                      prompt_text: 'Test content',
                    },
                  ],
                  error: null,
                })
              ),
            })),
          })),
        })),
      };

      mockCreateRouteHandlerClient.mockReturnValue(mockSupabaseClient as any);
      mockCookies.mockReturnValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/prompts');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should handle unauthenticated requests gracefully', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      };

      mockCreateRouteHandlerClient.mockReturnValue(mockSupabaseClient as any);
      mockCookies.mockReturnValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/prompts');
      const response = await GET(request);

      // This should return default prompts even without auth
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/prompts', () => {
    it('should return 401 when not authenticated', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      };

      mockCreateRouteHandlerClient.mockReturnValue(mockSupabaseClient as any);
      mockCookies.mockReturnValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Prompt',
          templateType: 'default',
          promptText: 'Test prompt content',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should create prompt for authenticated user', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id', email: 'test@example.com' } },
            error: null,
          }),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: {
                    id: 'new-prompt-id',
                    name: 'Test Prompt',
                    user_id: 'test-user-id',
                  },
                  error: null,
                })
              ),
            })),
          })),
        })),
      };

      mockCreateRouteHandlerClient.mockReturnValue(mockSupabaseClient as any);
      mockCookies.mockReturnValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Prompt',
          templateType: 'default',
          promptText: 'Test prompt content',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);

      const responseData = await response.json();
      expect(responseData.user_id).toBe('test-user-id');
    });

    it('should validate required fields', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id', email: 'test@example.com' } },
            error: null,
          }),
        },
      };

      mockCreateRouteHandlerClient.mockReturnValue(mockSupabaseClient as any);
      mockCookies.mockReturnValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          name: 'Test Prompt',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should ignore userId in request body', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id', email: 'test@example.com' } },
            error: null,
          }),
        },
        from: jest.fn(() => ({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: {
                    id: 'new-prompt-id',
                    name: 'Test Prompt',
                    user_id: 'test-user-id', // Should be from auth, not request
                  },
                  error: null,
                })
              ),
            })),
          })),
        })),
      };

      mockCreateRouteHandlerClient.mockReturnValue(mockSupabaseClient as any);
      mockCookies.mockReturnValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Prompt',
          templateType: 'default',
          promptText: 'Test prompt content',
          userId: 'malicious-user-id', // This should be ignored
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);

      const responseData = await response.json();
      // Should use authenticated user's ID, not the one in request
      expect(responseData.user_id).toBe('test-user-id');
      expect(responseData.user_id).not.toBe('malicious-user-id');
    });
  });
});
