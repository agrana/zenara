import { create } from 'zustand';
import { createClient } from '../lib/supabase';

export interface Bookmark {
  id: number;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  tags: string[];
  created_at: string;
}

export interface BookmarkComment {
  id: number;
  bookmark_id: number;
  user_id: string;
  body: string;
  created_at: string;
}

interface BookmarkState {
  bookmarks: Bookmark[];
  commentsByBookmark: Record<number, BookmarkComment[]>;
  isLoading: boolean;
  error: string | null;

  fetchBookmarks: () => Promise<void>;
  addBookmark: (payload: {
    url: string;
    title?: string;
    tags?: string[];
  }) => Promise<Bookmark>;
  deleteBookmark: (id: number) => Promise<void>;
  fetchComments: (bookmarkId: number) => Promise<void>;
  addComment: (bookmarkId: number, body: string) => Promise<BookmarkComment>;
}

const normalizeUrl = (rawUrl: string) => {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
};

export const useBookmarkStore = create<BookmarkState>()((set, get) => ({
  bookmarks: [],
  commentsByBookmark: {},
  isLoading: false,
  error: null,

  fetchBookmarks: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ bookmarks: data || [], isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch bookmarks',
        isLoading: false,
      });
    }
  },

  addBookmark: async ({ url, title, tags }) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const normalizedUrl = normalizeUrl(url);
      if (!normalizedUrl) {
        throw new Error('URL is required');
      }

      let resolvedTitle = title?.trim();
      let resolvedDescription: string | null = null;

      if (!resolvedTitle) {
        try {
          const response = await fetch(
            `/api/bookmark-metadata?url=${encodeURIComponent(normalizedUrl)}`
          );
          if (response.ok) {
            const data = await response.json();
            resolvedTitle = data.title || resolvedTitle;
            resolvedDescription = data.description || resolvedDescription;
          }
        } catch (metadataError) {
          console.warn('Failed to fetch metadata', metadataError);
        }
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          url: normalizedUrl,
          title: resolvedTitle || normalizedUrl,
          description: resolvedDescription,
          tags: tags || [],
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        bookmarks: [data, ...state.bookmarks],
        isLoading: false,
      }));

      return data;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to add bookmark',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteBookmark: async id => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const { error } = await supabase.from('bookmarks').delete().eq('id', id);

      if (error) throw error;

      set(state => {
        const nextComments = { ...state.commentsByBookmark };
        delete nextComments[id];
        return {
          bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== id),
          commentsByBookmark: nextComments,
          isLoading: false,
        };
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete bookmark',
        isLoading: false,
      });
    }
  },

  fetchComments: async bookmarkId => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bookmark_comments')
        .select('*')
        .eq('bookmark_id', bookmarkId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set(state => ({
        commentsByBookmark: {
          ...state.commentsByBookmark,
          [bookmarkId]: data || [],
        },
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch comments',
        isLoading: false,
      });
    }
  },

  addComment: async (bookmarkId, body) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('bookmark_comments')
        .insert({
          bookmark_id: bookmarkId,
          user_id: user.id,
          body: body.trim(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        commentsByBookmark: {
          ...state.commentsByBookmark,
          [bookmarkId]: [data, ...(state.commentsByBookmark[bookmarkId] || [])],
        },
        isLoading: false,
      }));

      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add comment',
        isLoading: false,
      });
      throw error;
    }
  },
}));
