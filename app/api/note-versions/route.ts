import { NextRequest, NextResponse } from 'next/server'
import { NoteVersionService } from '../../lib/noteVersionService'

// POST /api/note-versions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { noteId, userId, title, content, format, isProcessed, processingMetadata } = body
    
    if (!noteId || !userId || !title || !content || !format) {
      return NextResponse.json(
        { error: 'noteId, userId, title, content, and format are required' },
        { status: 400 }
      )
    }
    
    const versionService = NoteVersionService.getInstance()
    const version = await versionService.createVersion({
      noteId, userId, title, content, format, isProcessed, processingMetadata
    })
    
    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    console.error('Error creating note version:', error)
    return NextResponse.json({ error: 'Failed to create note version' }, { status: 500 })
  }
}
