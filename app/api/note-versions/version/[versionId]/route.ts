import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NoteVersionService } from '../../../../lib/noteVersionService';

// GET /api/note-versions/version/[versionId]
export async function GET(
  request: NextRequest,
  { params }: { params: { versionId: string } }
) {
  try {
    const { versionId } = params;

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
    const version = await versionService.getVersionById(versionId, user.id);

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    return NextResponse.json(version);
  } catch (error) {
    console.error('Error fetching note version:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note version' },
      { status: 500 }
    );
  }
}

// DELETE /api/note-versions/version/[versionId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { versionId: string } }
) {
  try {
    const { versionId } = params;

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
    await versionService.deleteVersion(versionId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note version:', error);
    return NextResponse.json(
      { error: 'Failed to delete note version' },
      { status: 500 }
    );
  }
}
