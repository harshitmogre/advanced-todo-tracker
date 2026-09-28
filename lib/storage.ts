import { AppSettings, Task } from './types';

const TASKS_KEY = 'pt_tasks_v1';
const SETTINGS_KEY = 'pt_settings_v1';
const SEEDED_KEY = 'pt_seeded_v1';

const DEFAULT_SETTINGS: AppSettings = {
  dailyTaskGoal: 5,
  theme: 'light',
  categories: ['Study', 'Work', 'Personal', 'Health', 'Errands']
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Every function here is async on purpose, even though localStorage is
 * synchronous. It keeps the calling code (hooks/components) identical to
 * what it would look like calling a real API, so swapping this file for a
 * fetch()-based client later doesn't require touching the rest of the app.
 */
export const repo = {
  async getTasks(): Promise<Task[]> {
    return readJSON<Task[]>(TASKS_KEY, []);
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    writeJSON(TASKS_KEY, tasks);
  },

  async createTask(task: Task): Promise<Task[]> {
    const tasks = await repo.getTasks();
    const next = [task, ...tasks];
    await repo.saveTasks(next);
    return next;
  },

  async updateTask(id: string, patch: Partial<Task>): Promise<Task[]> {
    const tasks = await repo.getTasks();
    const next = tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
    await repo.saveTasks(next);
    return next;
  },

  async deleteTask(id: string): Promise<Task[]> {
    const tasks = await repo.getTasks();
    const next = tasks.filter((t) => t.id !== id);
    await repo.saveTasks(next);
    return next;
  },

  async getSettings(): Promise<AppSettings> {
    return readJSON<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    writeJSON(SETTINGS_KEY, settings);
  },

  async hasSeeded(): Promise<boolean> {
    return readJSON<boolean>(SEEDED_KEY, false);
  },

  async markSeeded(): Promise<void> {
    writeJSON(SEEDED_KEY, true);
  },

  async clearAll(): Promise<void> {
    if (!isBrowser()) return;
    window.localStorage.removeItem(TASKS_KEY);
    window.localStorage.removeItem(SETTINGS_KEY);
    window.localStorage.removeItem(SEEDED_KEY);
  }
};
