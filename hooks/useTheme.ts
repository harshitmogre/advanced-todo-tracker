'use client';

import { useCallback, useEffect, useState } from 'react';

const THEME_KEY = 'pt_theme_v1';

function applyThemeClass(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && (window.localStorage.getItem(THEME_KEY) as 'light' | 'dark')) || 'light';
    setTheme(saved);
    applyThemeClass(saved);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      window.localStorage.setItem(THEME_KEY, next);
      applyThemeClass(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
