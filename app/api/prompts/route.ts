import { NextRequest, NextResponse } from 'next/server';
import { PromptService } from '../../lib/promptService';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/prompts
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's custom prompts
    const { data: userPrompts, error: userError } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (userError) {
      console.error('Error fetching user prompts:', userError);
      // Don't throw, just log and continue with defaults
    }

    // Get default prompts from PromptService
    const promptService = PromptService.getInstance();
    const defaultPrompts = await promptService.getUserPrompts(); // This returns defaults when no userId

    // Combine user prompts with defaults
    const allPrompts = [...(userPrompts || []), ...defaultPrompts];

    return NextResponse.json(allPrompts);
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
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('Auth check:', { user: user?.id, authError });

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create prompt directly with server-side client (bypasses RLS issues)
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
      return NextResponse.json(
        { error: 'Failed to create prompt', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(prompt, { status: 201 });
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
