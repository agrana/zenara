import { NextRequest, NextResponse } from 'next/server';
import { PromptService } from '../../lib/promptService';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/prompts
export async function GET(request: NextRequest) {
  try {
    const promptService = PromptService.getInstance();
    const prompts = await promptService.getUserPrompts();
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
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
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
