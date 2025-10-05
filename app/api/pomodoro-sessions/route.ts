import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../lib/storage'
import { z } from 'zod'

const insertPomodoroSessionSchema = z.object({
  userId: z.number(),
  taskId: z.number().optional(),
  duration: z.number(),
  completed: z.boolean().optional()
})

// GET /api/pomodoro-sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const sessions = await storage.getPomodoroSessions(userId ? parseInt(userId) : undefined)
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

// POST /api/pomodoro-sessions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = insertPomodoroSessionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid session data', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    const session = await storage.createPomodoroSession(validation.data)
    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error creating pomodoro session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
