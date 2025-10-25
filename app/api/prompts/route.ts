import { NextRequest, NextResponse } from 'next/server';
import { PromptService } from '../../lib/promptService';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Utility function to normalize Supabase fields to camelCase
function normalizePromptFields(prompt: any) {
  return {
    id: prompt.id,
    userId: prompt.user_id,
    name: prompt.name,
    templateType: prompt.template_type,
    promptText: prompt.prompt_text,
    isDefault: prompt.is_default,
    isActive: prompt.is_active,
    createdAt: prompt.created_at,
    updatedAt: prompt.updated_at,
  };
}

// GET /api/prompts
export async function GET(request: NextRequest) {
  try {
    // Try to get user from auth for user-specific prompts
    let userId = null;
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      console.log('GET Auth result:', {
        hasUser: !!user,
        userId: user?.id,
        authError: authError?.message,
      });

      userId = user?.id;
    } catch (authError) {
      console.warn('GET Auth failed:', authError);
    }

    const promptService = PromptService.getInstance();
    const prompts = await promptService.getUserPrompts(userId || undefined);
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST /api/prompts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, templateType, promptText, isDefault } = body;

    console.log('Creating prompt with data:', {
      name,
      templateType,
      promptText: promptText?.substring(0, 50) + '...',
    });

    if (!name || !templateType || !promptText) {
      return NextResponse.json(
        { error: 'Name, templateType, and promptText are required' },
        { status: 400 }
      );
    }

    // Get authenticated user from server-side Supabase client
    let user = null;
    let authError = null;
    let supabase = null;

    // Always try to get authenticated user first
    try {
      supabase = createRouteHandlerClient({ cookies });
      const authResult = await supabase.auth.getUser();
      user = authResult.data?.user;
      authError = authResult.error;

      console.log('Auth result:', {
        hasUser: !!user,
        userId: user?.id,
        authError: authError?.message,
      });
    } catch (error) {
      console.warn('Supabase auth failed:', error);
      authError = error;
    }

    console.log('Auth check:', { user: user?.id, authError });

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create prompt directly with server-side client (bypasses RLS issues)
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data: prompt, error } = await supabase
        .from('prompts')
        .insert([
          {
            user_id: user.id,
            name,
            template_type: templateType,
            prompt_text: promptText,
            is_default: isDefault || false,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating prompt:', error);

        // If it's a development environment without proper Supabase setup, return a mock response
        if (
          error.message?.includes('relation "prompts" does not exist') ||
          error.message?.includes('Invalid API key') ||
          error.code === 'PGRST301'
        ) {
          console.warn(
            'Database not available, returning mock prompt for development'
          );
          const mockPrompt = {
            id: `mock-${Date.now()}`,
            user_id: user.id,
            name,
            template_type: templateType,
            prompt_text: promptText,
            is_default: isDefault || false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return NextResponse.json(mockPrompt, { status: 201 });
        }

        return NextResponse.json(
          { error: 'Failed to create prompt', details: error },
          { status: 500 }
        );
      }

      return NextResponse.json(prompt, { status: 201 });
    } catch (dbError) {
      console.error('Database connection error:', dbError);

      // Return mock response for development
      console.warn(
        'Database connection failed, returning mock prompt for development'
      );
      const mockPrompt = {
        id: `mock-${Date.now()}`,
        user_id: user.id,
        name,
        template_type: templateType,
        prompt_text: promptText,
        is_default: isDefault || false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json(mockPrompt, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating prompt:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create prompt';
    return NextResponse.json(
      {
        error: errorMessage,
        details: error,
      },
      { status: 500 }
    );
  }
}
