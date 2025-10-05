import { NextRequest, NextResponse } from 'next/server'
import { PromptService } from '../../lib/promptService'

// GET /api/prompts
export async function GET(request: NextRequest) {
  try {
    const promptService = PromptService.getInstance()
    const prompts = await promptService.getUserPrompts()
    return NextResponse.json(prompts)
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}

// POST /api/prompts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, templateType, promptText, isDefault } = body
    
    if (!name || !templateType || !promptText) {
      return NextResponse.json(
        { error: 'Name, templateType, and promptText are required' },
        { status: 400 }
      )
    }
    
    const promptService = PromptService.getInstance()
    const prompt = await promptService.createPrompt({
      userId, name, templateType, promptText, isDefault
    })
    
    return NextResponse.json(prompt, { status: 201 })
  } catch (error) {
    console.error('Error creating prompt:', error)
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 })
  }
}
