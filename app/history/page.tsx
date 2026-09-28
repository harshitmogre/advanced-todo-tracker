'use client';

import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useTasksContext } from '@/lib/context/TasksContext';
import { computeDayStat, deriveTaskStatus } from '@/lib/analytics';
import { classNames, colorForCategory, todayISO } from '@/lib/utils';
import { CategoryTag, PriorityBadge } from '@/components/ui/Badge';

type Filter = 'all' | 'completed' | 'overdue';

export default function HistoryPage() {
  const { tasks, loading } = useTasksContext();
  const [filter, setFilter] = useState<Filter>('all');
  const today = todayISO();

  const grouped = useMemo(() => {
    const past = tasks.filter((t) => t.deadline <= today);
    const filtered = past.filter((t) => {
      const status = deriveTaskStatus(t, today);
      if (filter === 'completed') return status === 'completed';
      if (filter === 'overdue') return status === 'overdue';
      return status !== 'pending' || t.deadline === today;
    });

    const byDate = new Map<string, typeof tasks>();
    filtered.forEach((t) => {
      const list = byDate.get(t.deadline) ?? [];
      list.push(t);
      byDate.set(t.deadline, list);
    });

    return Array.from(byDate.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [tasks, filter, today]);

  if (loading) return <p className="py-20 text-center text-sm text-slate-400">Loading history…</p>;

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(['all', 'completed', 'overdue'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={classNames(
              'rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition',
              filter === f ? 'bg-brand-600 text-white shadow-soft' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="card py-16 text-center text-sm text-slate-400">No history yet.</div>
      ) : (
        grouped.map(([date, dayTasks]) => {
          const stat = computeDayStat(tasks, date, today);
          return (
            <div key={date} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold">{format(parseISO(date), 'EEEE, d MMM yyyy')}</h2>
                <span
                  className={classNames(
                    'rounded-full px-2.5 py-1 text-xs font-bold',
                    stat.completionRate === 100
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                      : stat.completionRate >= 50
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                  )}
                >
                  {stat.completed}/{stat.total} · {stat.completionRate}%
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {dayTasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 py-2.5">
                    {t.completed ? <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-500" /> : <AlertCircle size={16} className="flex-shrink-0 text-rose-500" />}
                    <span className={classNames('flex-1 text-sm', t.completed ? 'text-slate-500' : 'font-medium')}>{t.title}</span>
                    <CategoryTag color={colorForCategory(t.category)}>{t.category}</CategoryTag>
                    <PriorityBadge priority={t.priority} />
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
