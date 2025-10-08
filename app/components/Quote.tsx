'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export default function Quote() {
  const [mounted, setMounted] = useState(false);
  const quote = useAppStore(state => state.quote);
  const refreshQuote = useAppStore(state => state.refreshQuote);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Set a new random quote if the component mounts and there's no quote
    if (mounted && !quote) {
      refreshQuote();
    }
  }, [mounted, quote, refreshQuote]);

  return (
    <div
      className='w-full max-w-3xl mx-auto mb-4 px-6 text-center relative group'
      suppressHydrationWarning
    >
      <blockquote className='font-serif text-lg md:text-xl font-medium italic text-white drop-shadow-lg'>
        {mounted && quote ? `"${quote.text}"` : '""'}
      </blockquote>
      <p className='mt-2 text-sm font-medium text-white/90 drop-shadow-md'>
        {mounted && quote ? `— ${quote.author}` : '—'}
      </p>
      <Button
        variant='ghost'
        size='icon'
        onClick={refreshQuote}
        className='absolute -right-2 top-1/2 transform -translate-y-1/2 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10'
      >
        <RefreshCw className='h-3 w-3' />
      </Button>
    </div>
  );
}
