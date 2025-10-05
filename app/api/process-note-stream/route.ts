import { NextRequest } from 'next/server'
import { ProcessingService } from '../../lib/processingService'

// POST /api/process-note-stream
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, promptId, promptType, customPrompt, userId } = body
    
    if (!content || typeof content !== 'string') {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const processingService = ProcessingService.getInstance()
    const stream = await processingService.processNoteStream(content, {
      promptId,
      promptType: promptType || 'default',
      customPrompt,
      userId
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })
  } catch (error) {
    console.error('Error in streaming processing:', error)
    return new Response(JSON.stringify({ error: 'Failed to process note' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
