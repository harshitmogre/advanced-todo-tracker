'use client';

import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { format } from 'date-fns';

export default function Header({ onMenuClick, title }: { onMenuClick: () => void; title: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/70 bg-surface-light/80 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-surface-dark/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
          <p className="text-xs text-slate-400">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400 dark:hover:text-brand-300"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </header>
  );
}
