import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NoteVersionService } from '../../../lib/noteVersionService';

// GET /api/note-versions/[noteId]
export async function GET(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const { noteId } = params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const versionService = NoteVersionService.getInstance();
    const versions = limit
      ? await versionService.getLatestVersions(noteId, user.id, parseInt(limit))
      : await versionService.getVersionsByNoteId(noteId, user.id);

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching note versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note versions' },
      { status: 500 }
    );
  }
}
