'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { useAppStore } from '../store/appStore';
import { Sun, Moon, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const backgroundRotation = useAppStore(state => state.backgroundRotation);
  const selectedCategory = useAppStore(state => state.selectedCategory);
  const setBackgroundRotation = useAppStore(
    state => state.setBackgroundRotation
  );
  const refreshBackground = useAppStore(state => state.refreshBackground);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && theme) {
      // Set dark mode in app store based on theme
      const darkMode = theme === 'dark';
      useAppStore.getState().setDarkMode(darkMode);
    }
  }, [theme, mounted]);

  return (
    <header className='w-full pt-6 pb-2 px-4 flex justify-between items-center'>
      <div className='text-3xl font-bold text-white drop-shadow-lg'>
        Nature Motivator
      </div>

      <div className='flex space-x-4 items-center'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className='p-2 text-white rounded-full hover:bg-white/10 transition-colors'
          suppressHydrationWarning
        >
          {mounted && theme === 'dark' ? (
            <Sun className='h-6 w-6' />
          ) : (
            <Moon className='h-6 w-6' />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='p-2 text-white rounded-full hover:bg-white/10 transition-colors'
            >
              <Settings className='h-6 w-6' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56'>
            <DropdownMenuLabel>Background Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setBackgroundRotation('daily')}
              className={backgroundRotation === 'daily' ? 'bg-primary/10' : ''}
            >
              Change Daily
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setBackgroundRotation('hourly')}
              className={backgroundRotation === 'hourly' ? 'bg-primary/10' : ''}
            >
              Change Hourly
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setBackgroundRotation('random')}
              className={backgroundRotation === 'random' ? 'bg-primary/10' : ''}
            >
              Random
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Categorized Backgrounds</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setBackgroundRotation('category', 'landscape')}
              className={
                backgroundRotation === 'category' &&
                selectedCategory === 'landscape'
                  ? 'bg-primary/10'
                  : ''
              }
            >
              Landscapes
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setBackgroundRotation('category', 'forest')}
              className={
                backgroundRotation === 'category' &&
                selectedCategory === 'forest'
                  ? 'bg-primary/10'
                  : ''
              }
            >
              Forests
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setBackgroundRotation('category', 'ocean')}
              className={
                backgroundRotation === 'category' &&
                selectedCategory === 'ocean'
                  ? 'bg-primary/10'
                  : ''
              }
            >
              Ocean
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setBackgroundRotation('category', 'mountain')}
              className={
                backgroundRotation === 'category' &&
                selectedCategory === 'mountain'
                  ? 'bg-primary/10'
                  : ''
              }
            >
              Mountains
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={refreshBackground}>
              Refresh Background
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
