# Database Migration Guide

## Apply Migrations to Supabase

You need to apply these migrations to create the required database tables for Zenara.

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):

```bash
npm install -g supabase
```

2. **Link to your Supabase project**:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

3. **Apply all migrations**:

```bash
supabase db push
```

### Option 2: Manual Application via Supabase Dashboard

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Apply each migration file in order:

   a. **20240102000001_create_prompts_table.sql**
   b. **20240102000002_create_notes_tables.sql**
   c. **20240102000003_create_tasks_table.sql**
   d. **20240102000004_create_pomodoro_sessions_table.sql**

5. Copy and paste the contents of each file and click "Run"

### Option 3: Using Makefile

```bash
make db-push
```

## Tables Created

After running migrations, you'll have these tables:

1. **prompts** - Custom AI prompts for note processing
2. **notes** - User notes/scratchpad entries
3. **note_versions** - Version history for notes
4. **tasks** - Task list items
5. **pomodoro_sessions** - Pomodoro timer sessions
6. **todos** - (Already exists from initial migration)

## Verify Migrations

To verify all tables were created:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see all the tables listed above

## Troubleshooting

### "Function handle_updated_at does not exist"

This means the initial migration wasn't run. Run `20240101000001_initial_schema.sql` first.

### "Row Level Security policy error"

Make sure you're logged in with a valid user. RLS policies require authentication.

### "Table already exists"

Skip that migration - the table is already created.
