import { NextResponse } from 'next/server'
import { PromptService } from '../../../../lib/promptService'

// GET /api/prompts/templates/types
export async function GET() {
  try {
    const promptService = PromptService.getInstance()
    const templateTypes = promptService.getTemplateTypes()
    return NextResponse.json(templateTypes)
  } catch (error) {
    console.error('Error fetching template types:', error)
    return NextResponse.json({ error: 'Failed to fetch template types' }, { status: 500 })
  }
}
