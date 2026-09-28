'use client';

import { useCallback, useEffect, useState } from 'react';
import { repo } from '@/lib/storage';
import { AppSettings } from '@/lib/types';

const DEFAULT_SETTINGS: AppSettings = {
  dailyTaskGoal: 5,
  theme: 'light',
  categories: ['Study', 'Work', 'Personal', 'Health', 'Errands']
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loaded = await repo.getSettings();
      setSettings(loaded);
      setLoading(false);
    })();
  }, []);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      repo.saveSettings(next);
      return next;
    });
  }, []);

  return { settings, loading, updateSettings };
}
