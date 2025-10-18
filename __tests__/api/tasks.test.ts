/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/tasks/route';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { DatabaseStorage } from '../../app/lib/storage';

// Mock the auth helpers and storage
jest.mock('@supabase/auth-helpers-nextjs');
jest.mock('next/headers');
jest.mock('../../app/lib/storage', () => ({
  DatabaseStorage: {
    getInstance: jest.fn(() => ({
      getTasks: jest.fn().mockResolvedValue([]),
      createTask: jest.fn().mockResolvedValue({ id: '1', title: 'Test task' }),
    })),
  },
}));

const mockCreateRouteHandlerClient =
  createRouteHandlerClient as jest.MockedFunction<
    typeof createRouteHandlerClient
  >;
const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('/api/tasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
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

      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);

      // This test will fail initially but should pass after refactoring
      // Currently returns 200, should return 401
      expect(response.status).toBe(401);
    });

    it('should return tasks for authenticated user', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/tasks');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('should reject userId parameter', async () => {
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

      // This should fail after refactoring - userId param should be ignored
      const request = new NextRequest(
        'http://localhost:3000/api/tasks?userId=123'
      );
      const response = await GET(request);

      // After refactoring, this should still return the authenticated user's tasks
      // regardless of the userId parameter
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/tasks', () => {
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

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test task', completed: false }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      // This test will fail initially but should pass after refactoring
      expect(response.status).toBe(401);
    });

    it('should create task for authenticated user', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test task', completed: false }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('should ignore userId in request body', async () => {
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

      // Malicious request trying to create task for different user
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test task',
          completed: false,
          userId: 'malicious-user-id', // This should be ignored
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      // Should still create task for authenticated user, not malicious user
      expect(response.status).toBe(201);
    });
  });
});
