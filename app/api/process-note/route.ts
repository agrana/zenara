import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ProcessingService } from '../../lib/processingService';

const processingService = new ProcessingService();

// POST /api/process-note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { note } = body;

    if (!note) {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('Process Note POST Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    });

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await processingService.processNote(
      note,
      {
        userId: user.id,
      },
      supabase
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing note:', error);
    return NextResponse.json(
      { error: 'Failed to process note' },
      { status: 500 }
    );
  }
}
