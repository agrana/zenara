import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NoteVersionService } from '../../lib/noteVersionService';

// POST /api/note-versions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { noteId, title, content, format, isProcessed, processingMetadata } =
      body;

    if (!noteId || !title || !content || !format) {
      return NextResponse.json(
        { error: 'noteId, title, content, and format are required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('Note Versions POST Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    });

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const versionService = NoteVersionService.getInstance();
    const version = await versionService.createVersion({
      noteId,
      userId: user.id,
      title,
      content,
      format,
      isProcessed,
      processingMetadata,
    });

    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    console.error('Error creating note version:', error);
    return NextResponse.json(
      { error: 'Failed to create note version' },
      { status: 500 }
    );
  }
}
