import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const insertTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

// GET /api/tasks
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('Tasks GET Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    });

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch tasks for authenticated user
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }

    return NextResponse.json(tasks || []);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = insertTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid task data', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('Tasks POST Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    });

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create task for authenticated user
    const { data: task, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: user.id,
          title: validation.data.title,
          description: validation.data.description,
          completed: validation.data.completed || false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
