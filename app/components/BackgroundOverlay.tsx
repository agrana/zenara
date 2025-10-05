'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';

export default function BackgroundOverlay() {
  const [hydrated, setHydrated] = useState(false);
  const background = useAppStore(state => state.background);
  const refreshBackground = useAppStore(state => state.refreshBackground);

  useEffect(() => {
    // Hydrate the store on mount
    useAppStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Refresh background on initial load after hydration
    if (hydrated && !background) {
      refreshBackground();
    }
  }, [hydrated, background, refreshBackground]);

  if (!hydrated) {
    return null;
  }

  return (
    <div
      className='fixed inset-0 z-[-1] transition-opacity duration-1000 opacity-100 bg-cover bg-center bg-no-repeat'
      style={{
        backgroundImage: background?.url ? `url(${background.url})` : undefined,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      {/* Overlay for better text visibility */}
      <div className='absolute inset-0 bg-black/20'></div>
    </div>
  );
}
