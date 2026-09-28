import { addDays, addMonths, addWeeks, addYears, endOfMonth, endOfWeek, endOfYear, format, getDay, parseISO, startOfMonth, startOfWeek, startOfYear } from 'date-fns';
import { ComparisonGranularity, DayStat, PeriodStat, Task } from './types';
import { priorityWeight, toISODate, todayISO } from './utils';

export function deriveTaskStatus(task: Task, today: string = todayISO()): 'pending' | 'completed' | 'overdue' {
  if (task.completed) return 'completed';
  return task.deadline < today ? 'overdue' : 'pending';
}

/** Stats for a single ISO date (yyyy-MM-dd), based on tasks due that day. */
export function computeDayStat(tasks: Task[], date: string, today: string = todayISO()): DayStat {
  const dueThatDay = tasks.filter((t) => t.deadline === date);
  const total = dueThatDay.length;
  const completed = dueThatDay.filter((t) => t.completed).length;
  const overdue = dueThatDay.filter((t) => !t.completed && date < today).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 1000) / 10;

  const totalWeight = dueThatDay.reduce((sum, t) => sum + priorityWeight(t.priority), 0);
  const doneWeight = dueThatDay.filter((t) => t.completed).reduce((sum, t) => sum + priorityWeight(t.priority), 0);
  const score = totalWeight === 0 ? 0 : Math.round((doneWeight / totalWeight) * 100);

  return { date, total, completed, overdue, completionRate, score };
}

/** Builds a DayStat for every date in [fromDate, toDate] inclusive. */
export function buildDailyStats(tasks: Task[], fromDate: Date, toDate: Date): DayStat[] {
  const stats: DayStat[] = [];
  let cursor = new Date(fromDate);
  const today = todayISO();
  while (cursor <= toDate) {
    stats.push(computeDayStat(tasks, toISODate(cursor), today));
    cursor = addDays(cursor, 1);
  }
  return stats;
}

function isDaySuccessful(stat: DayStat): boolean {
  return stat.total > 0 && stat.completionRate === 100;
}

/**
 * Current streak of consecutive successful days ending today (or yesterday,
 * if today isn't finished yet). Days with zero tasks are skipped rather than
 * breaking the streak — an empty day isn't a failed day.
 */
export function computeCurrentStreak(tasks: Task[], maxLookbackDays = 400): number {
  const today = todayISO();
  let streak = 0;
  let cursor = new Date();

  for (let i = 0; i < maxLookbackDays; i++) {
    const iso = toISODate(cursor);
    const stat = computeDayStat(tasks, iso, today);

    if (stat.total === 0) {
      cursor = addDays(cursor, -1);
      continue; // empty day, neither extends nor breaks the streak
    }

    if (iso === today) {
      if (isDaySuccessful(stat)) {
        streak += 1;
      }
      // today not finished yet — don't break the streak either way
      cursor = addDays(cursor, -1);
      continue;
    }

    if (isDaySuccessful(stat)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}

/** Longest streak ever achieved, scanning from the earliest task to today. */
export function computeLongestStreak(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const earliest = tasks.reduce((min, t) => (t.deadline < min ? t.deadline : min), tasks[0].deadline);
  const from = parseISO(earliest);
  const to = new Date();
  const daily = buildDailyStats(tasks, from, to);

  let longest = 0;
  let running = 0;
  for (const stat of daily) {
    if (stat.total === 0) continue; // neutral day
    if (isDaySuccessful(stat)) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }
  return longest;
}

/** Overall today snapshot used by the dashboard. */
export function computeTodaySnapshot(tasks: Task[]) {
  const today = todayISO();
  const stat = computeDayStat(tasks, today, today);
  const allOverdue = tasks.filter((t) => !t.completed && t.deadline < today).length;
  const pendingToday = stat.total - stat.completed;

  return {
    ...stat,
    pending: pendingToday,
    overdueAllTime: allOverdue
  };
}

// ---- Period comparisons (day/week/month/year) ----

function periodBounds(date: Date, granularity: ComparisonGranularity): { start: Date; end: Date; key: string; label: string } {
  switch (granularity) {
    case 'day':
      return { start: date, end: date, key: toISODate(date), label: format(date, 'EEE d MMM') };
    case 'week': {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      return { start, end, key: format(start, 'yyyy-ww'), label: `${format(start, 'd MMM')} – ${format(end, 'd MMM')}` };
    }
    case 'month': {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      return { start, end, key: format(start, 'yyyy-MM'), label: format(start, 'MMM yyyy') };
    }
    case 'year': {
      const start = startOfYear(date);
      const end = endOfYear(date);
      return { start, end, key: format(start, 'yyyy'), label: format(start, 'yyyy') };
    }
  }
}

function stepDate(date: Date, granularity: ComparisonGranularity, amount: number): Date {
  switch (granularity) {
    case 'day':
      return addDays(date, amount);
    case 'week':
      return addWeeks(date, amount);
    case 'month':
      return addMonths(date, amount);
    case 'year':
      return addYears(date, amount);
  }
}

/** Builds the last `count` periods (oldest first) ending with the current one. */
export function buildPeriodStats(tasks: Task[], granularity: ComparisonGranularity, count: number): PeriodStat[] {
  const today = todayISO();
  const results: PeriodStat[] = [];
  let cursor = stepDate(new Date(), granularity, -(count - 1));

  for (let i = 0; i < count; i++) {
    const { start, end, key, label } = periodBounds(cursor, granularity);
    const startISO = toISODate(start);
    const endISO = toISODate(end);

    const due = tasks.filter((t) => t.deadline >= startISO && t.deadline <= endISO);
    const created = tasks.filter((t) => toISODate(parseISO(t.createdAt)) >= startISO && toISODate(parseISO(t.createdAt)) <= endISO);

    const completed = due.filter((t) => t.completed).length;
    const overdue = due.filter((t) => !t.completed && t.deadline < today).length;
    const total = due.length;
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 1000) / 10;

    results.push({
      label,
      key,
      created: created.length,
      completed,
      overdue,
      completionRate,
      streakActive: total > 0 && completionRate === 100
    });

    cursor = stepDate(cursor, granularity, 1);
  }

  return results;
}

// ---- Insights ----

export function computeInsights(tasks: Task[]) {
  const today = todayISO();
  const completedTasks = tasks.filter((t) => t.completed);
  const overdueTasks = tasks.filter((t) => !t.completed && t.deadline < today);

  // Most productive day of week, by total completed tasks.
  const dowTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun..Sat to match date-fns getDay
  completedTasks.forEach((t) => {
    const d = t.completedAt ? parseISO(t.completedAt) : parseISO(t.deadline);
    dowTotals[getDay(d)] += 1;
  });
  const dowNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const maxDowIndex = dowTotals.indexOf(Math.max(...dowTotals));
  const mostProductiveDay = dowTotals.some((v) => v > 0) ? dowNames[maxDowIndex] : '—';

  // Most productive month (specific calendar month with highest completion rate, min 2 tasks due).
  const monthStats = buildPeriodStats(tasks, 'month', 12).filter((m) => m.completed + m.overdue >= 2);
  const bestMonth = monthStats.reduce<PeriodStat | null>((best, m) => {
    if (!best || m.completionRate > best.completionRate) return m;
    return best;
  }, null);

  // Average completion rate across days that had at least one task.
  const earliest = tasks.length ? tasks.reduce((min, t) => (t.deadline < min ? t.deadline : min), tasks[0].deadline) : today;
  const daily = buildDailyStats(tasks, parseISO(earliest), new Date()).filter((d) => d.total > 0);
  const avgCompletionRate = daily.length
    ? Math.round((daily.reduce((sum, d) => sum + d.completionRate, 0) / daily.length) * 10) / 10
    : 0;

  return {
    mostProductiveDay,
    mostProductiveMonth: bestMonth ? bestMonth.label : '—',
    avgCompletionRate,
    totalCompleted: completedTasks.length,
    totalOverdue: overdueTasks.length,
    longestStreak: computeLongestStreak(tasks),
    currentStreak: computeCurrentStreak(tasks)
  };
}
