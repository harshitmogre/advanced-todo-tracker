export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'pending' | 'completed' | 'overdue';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  notes: string;
  category: string;
  priority: Priority;
  deadline: string; // ISO date string, e.g. 2026-09-27
  estimatedMinutes: number | null;
  recurrence: Recurrence;
  completed: boolean;
  createdAt: string; // ISO datetime
  completedAt: string | null; // ISO datetime
}

export interface AppSettings {
  dailyTaskGoal: number;
  theme: 'light' | 'dark';
  categories: string[];
}

/** Aggregated stats for a single calendar day, derived from tasks. */
export interface DayStat {
  date: string; // ISO date (yyyy-MM-dd)
  total: number;
  completed: number;
  overdue: number;
  completionRate: number; // 0-100
  score: number; // weighted productivity score, 0-100
}

export type ComparisonGranularity = 'day' | 'week' | 'month' | 'year';

export interface PeriodStat {
  label: string; // display label, e.g. "Mon 22", "Week 38", "Sep 2026", "2026"
  key: string; // sortable key
  created: number;
  completed: number;
  overdue: number;
  completionRate: number;
  streakActive: boolean; // was this period a "successful" day/week/etc.
}
