'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bookmark, useBookmarkStore } from '../store/bookmarkStore';
import { formatDateRelative } from '../lib/formatDate';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Plus,
  Trash2,
} from 'lucide-react';

const parseTags = (value: string) =>
  value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);

export default function BookmarksCard() {
  const [isOpen, setIsOpen] = useState(true);
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [tags, setTags] = useState('');
  const [expandedComments, setExpandedComments] = useState<
    Record<number, boolean>
  >({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>(
    {}
  );

  const {
    bookmarks,
    commentsByBookmark,
    fetchBookmarks,
    addBookmark,
    deleteBookmark,
    fetchComments,
    addComment,
    isLoading,
    error,
  } = useBookmarkStore();

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const sortedBookmarks = useMemo(() => {
    return [...bookmarks].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [bookmarks]);

  const handleAddBookmark = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim()) return;

    await addBookmark({
      url: url.trim(),
      title: label.trim() || undefined,
      tags: parseTags(tags),
    });

    setUrl('');
    setLabel('');
    setTags('');
  };

  const handleToggleComments = async (bookmark: Bookmark) => {
    setExpandedComments(prev => {
      const next = { ...prev, [bookmark.id]: !prev[bookmark.id] };
      return next;
    });

    if (!commentsByBookmark[bookmark.id]) {
      await fetchComments(bookmark.id);
    }
  };

  const handleAddComment = async (bookmarkId: number) => {
    const body = commentDrafts[bookmarkId]?.trim();
    if (!body) return;

    await addComment(bookmarkId, body);
    setCommentDrafts(prev => ({ ...prev, [bookmarkId]: '' }));
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className='glass rounded-xl shadow-xl overflow-hidden transition-all duration-300'
    >
      <CollapsibleTrigger className='w-full'>
        <CardHeader className='p-4 bg-white/20 dark:bg-slate-800/20 cursor-pointer'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-white'>
              Bookmarks
            </h2>
            {isOpen ? (
              <ChevronUp className='h-5 w-5 text-slate-800 dark:text-white' />
            ) : (
              <ChevronDown className='h-5 w-5 text-slate-800 dark:text-white' />
            )}
          </div>
        </CardHeader>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <CardContent className='bg-white/80 dark:bg-slate-800/80 p-6'>
          <form onSubmit={handleAddBookmark} className='space-y-3 mb-6'>
            <div className='flex flex-col gap-3'>
              <Input
                type='url'
                placeholder='https://example.com'
                value={url}
                onChange={event => setUrl(event.target.value)}
                className='w-full bg-white dark:bg-slate-700'
              />
              <Input
                type='text'
                placeholder='Label (optional)'
                value={label}
                onChange={event => setLabel(event.target.value)}
                className='w-full bg-white dark:bg-slate-700'
              />
              <Input
                type='text'
                placeholder='Tags (comma-separated)'
                value={tags}
                onChange={event => setTags(event.target.value)}
                className='w-full bg-white dark:bg-slate-700'
              />
            </div>
            <Button type='submit' className='w-full' disabled={isLoading}>
              <Plus className='h-4 w-4 mr-2' />
              Save bookmark
            </Button>
          </form>

          {error && <div className='mb-4 text-sm text-red-500'>{error}</div>}

          <div className='space-y-4 max-h-[420px] overflow-y-auto pr-2'>
            {sortedBookmarks.length === 0 ? (
              <div className='text-center py-6 text-slate-500 dark:text-slate-400'>
                No bookmarks yet. Save your first link above.
              </div>
            ) : (
              sortedBookmarks.map(bookmark => (
                <div
                  key={bookmark.id}
                  className='rounded-lg border border-white/40 bg-white/70 dark:bg-slate-700/70 p-4 shadow-sm'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='space-y-1'>
                      <p className='text-base font-semibold text-slate-900 dark:text-white'>
                        {bookmark.title || bookmark.url}
                      </p>
                      <a
                        href={bookmark.url}
                        target='_blank'
                        rel='noreferrer'
                        className='text-sm text-primary hover:underline break-all'
                      >
                        {bookmark.url}
                      </a>
                      <div className='text-xs text-slate-500 dark:text-slate-300'>
                        Saved{' '}
                        {formatDateRelative(new Date(bookmark.created_at))}
                      </div>
                      {bookmark.description && (
                        <p className='text-sm text-slate-600 dark:text-slate-200'>
                          {bookmark.description}
                        </p>
                      )}
                      {bookmark.tags?.length > 0 && (
                        <div className='flex flex-wrap gap-2 pt-2'>
                          {bookmark.tags.map(tag => (
                            <Badge key={tag} variant='secondary'>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleToggleComments(bookmark)}
                        className='text-slate-500 hover:text-primary dark:text-slate-300'
                      >
                        <MessageSquare className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => deleteBookmark(bookmark.id)}
                        className='text-slate-500 hover:text-red-500 dark:text-slate-300'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>

                  {expandedComments[bookmark.id] && (
                    <div className='mt-4 border-t border-slate-200/60 dark:border-slate-600/60 pt-4 space-y-3'>
                      <div className='space-y-3'>
                        {(commentsByBookmark[bookmark.id] || []).length ===
                        0 ? (
                          <p className='text-sm text-slate-500 dark:text-slate-400'>
                            No comments yet. Start a thread below.
                          </p>
                        ) : (
                          (commentsByBookmark[bookmark.id] || []).map(
                            comment => (
                              <div
                                key={comment.id}
                                className='text-sm text-slate-700 dark:text-slate-200'
                              >
                                <div className='font-medium'>
                                  {comment.body}
                                </div>
                                <div className='text-xs text-slate-500 dark:text-slate-400'>
                                  {formatDateRelative(
                                    new Date(comment.created_at)
                                  )}
                                </div>
                              </div>
                            )
                          )
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Textarea
                          placeholder='Add a comment...'
                          value={commentDrafts[bookmark.id] || ''}
                          onChange={event =>
                            setCommentDrafts(prev => ({
                              ...prev,
                              [bookmark.id]: event.target.value,
                            }))
                          }
                          className='bg-white dark:bg-slate-700'
                        />
                        <Button
                          onClick={() => handleAddComment(bookmark.id)}
                          size='sm'
                        >
                          Post comment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  );
}
