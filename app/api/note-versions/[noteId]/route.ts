import { NextRequest, NextResponse } from 'next/server'
import { NoteVersionService } from '../../../lib/noteVersionService'

// GET /api/note-versions/[noteId]
export async function GET(
  request: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const { noteId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = searchParams.get('limit')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    
    const versionService = NoteVersionService.getInstance()
    const versions = limit
      ? await versionService.getLatestVersions(noteId, userId, parseInt(limit))
      : await versionService.getVersionsByNoteId(noteId, userId)
    
    return NextResponse.json(versions)
  } catch (error) {
    console.error('Error fetching note versions:', error)
    return NextResponse.json({ error: 'Failed to fetch note versions' }, { status: 500 })
  }
}
