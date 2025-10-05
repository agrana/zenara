import { NextRequest, NextResponse } from 'next/server'
import { NoteVersionService } from '../../../../lib/noteVersionService'

// GET /api/note-versions/version/[versionId]
export async function GET(
  request: NextRequest,
  { params }: { params: { versionId: string } }
) {
  try {
    const { versionId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    
    const versionService = NoteVersionService.getInstance()
    const version = await versionService.getVersionById(versionId, userId)
    
    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }
    
    return NextResponse.json(version)
  } catch (error) {
    console.error('Error fetching note version:', error)
    return NextResponse.json({ error: 'Failed to fetch note version' }, { status: 500 })
  }
}

// DELETE /api/note-versions/version/[versionId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { versionId: string } }
) {
  try {
    const { versionId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    
    const versionService = NoteVersionService.getInstance()
    await versionService.deleteVersion(versionId, userId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note version:', error)
    return NextResponse.json({ error: 'Failed to delete note version' }, { status: 500 })
  }
}
