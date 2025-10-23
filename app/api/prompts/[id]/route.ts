import { NextRequest, NextResponse } from 'next/server';
import { PromptService } from '../../../lib/promptService';
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

// PUT /api/prompts/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, promptText, isActive } = body;

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });

    // Check if we're using a mock client (missing env vars)
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn(
        'Supabase not configured - returning mock response for local development'
      );
      return NextResponse.json(
        { error: 'Supabase not configured for local development' },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update prompt directly with server-side client
    const { data: prompt, error } = await supabase
      .from('prompts')
      .update({
        name,
        prompt_text: promptText,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the prompt
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating prompt:', error);
      return NextResponse.json(
        { error: 'Failed to update prompt', details: error },
        { status: 500 }
      );
    }

    // Normalize the updated prompt before returning
    const normalizedPrompt = normalizePromptFields(prompt);
    return NextResponse.json(normalizedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });

    // Check if we're using a mock client (missing env vars)
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn(
        'Supabase not configured - returning mock response for local development'
      );
      return NextResponse.json(
        { error: 'Supabase not configured for local development' },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete prompt directly with server-side client
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns the prompt

    if (error) {
      console.error('Supabase error deleting prompt:', error);
      return NextResponse.json(
        { error: 'Failed to delete prompt', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}

// GET /api/prompts/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });

    // Check if we're using a mock client (missing env vars)
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn(
        'Supabase not configured - returning mock response for local development'
      );
      return NextResponse.json(
        { error: 'Supabase not configured for local development' },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get prompt directly with server-side client
    const { data: prompt, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the prompt
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Prompt not found' },
          { status: 404 }
        );
      }
      console.error('Supabase error fetching prompt:', error);
      return NextResponse.json(
        { error: 'Failed to fetch prompt', details: error },
        { status: 500 }
      );
    }

    // Normalize the prompt before returning
    const normalizedPrompt = normalizePromptFields(prompt);
    return NextResponse.json(normalizedPrompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}
