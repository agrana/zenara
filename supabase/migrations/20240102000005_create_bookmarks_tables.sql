-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for bookmarks table
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON public.bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON public.bookmarks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON public.bookmarks USING GIN(tags);

-- Create bookmark comments table
CREATE TABLE IF NOT EXISTS public.bookmark_comments (
    id SERIAL PRIMARY KEY,
    bookmark_id INTEGER REFERENCES public.bookmarks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.bookmark_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for bookmark comments table
CREATE POLICY "Users can view their own bookmark comments" ON public.bookmark_comments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmark comments" ON public.bookmark_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmark comments" ON public.bookmark_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmark comments" ON public.bookmark_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookmark_comments_bookmark_id ON public.bookmark_comments(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_comments_user_id ON public.bookmark_comments(user_id);
