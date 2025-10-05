import { NextRequest, NextResponse } from 'next/server'
import { ProcessingService } from '../../lib/processingService'

const processingService = new ProcessingService()

// POST /api/process-note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { note, userId } = body
    
    if (!note || !userId) {
      return NextResponse.json(
        { error: 'Note content and userId are required' },
        { status: 400 }
      )
    }
    
    const result = await processingService.processNote(note, userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing note:', error)
    return NextResponse.json({ error: 'Failed to process note' }, { status: 500 })
  }
}
