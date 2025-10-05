import { NextRequest, NextResponse } from 'next/server'
import { storage } from '../../lib/storage'
import { z } from 'zod'

const insertTaskSchema = z.object({
  userId: z.number(),
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean().optional()
})

// GET /api/tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const tasks = await storage.getTasks(userId ? parseInt(userId) : undefined)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = insertTaskSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid task data', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    const task = await storage.createTask(validation.data)
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
