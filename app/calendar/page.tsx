'use client';

import { useMemo, useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTasksContext } from '@/lib/context/TasksContext';
import { computeDayStat, deriveTaskStatus } from '@/lib/analytics';
import { classNames, toISODate, todayISO } from '@/lib/utils';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';

function cellStyle(total: number, rate: number, isFuture: boolean) {
  if (total === 0) return 'bg-transparent text-slate-500';
  if (isFuture) return 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300';
  if (rate === 100) return 'bg-emerald-500 text-white';
  if (rate >= 75) return 'bg-emerald-200 text-emerald-900 dark:bg-emerald-500/30 dark:text-emerald-100';
  if (rate >= 50) return 'bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-100';
  if (rate > 0) return 'bg-orange-200 text-orange-900 dark:bg-orange-500/30 dark:text-orange-100';
  return 'bg-rose-200 text-rose-900 dark:bg-rose-500/30 dark:text-rose-100';
}

export default function CalendarPage() {
  const { tasks, loading, toggleComplete } = useTasksContext();
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<string>(todayISO());
  const today = todayISO();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const selectedTasks = tasks.filter((t) => t.deadline === selected);

  if (loading) return <p className="py-20 text-center text-sm text-slate-400">Loading calendar…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{format(month, 'MMMM yyyy')}</h2>
          <div className="flex gap-1">
            <button onClick={() => setMonth(addMonths(month, -1))} className="btn-ghost !p-2">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setMonth(new Date())} className="btn-ghost text-xs">
              Today
            </button>
            <button onClick={() => setMonth(addMonths(month, 1))} className="btn-ghost !p-2">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const iso = toISODate(day);
            const stat = computeDayStat(tasks, iso, today);
            const inMonth = isSameMonth(day, month);
            const isFuture = iso > today;
            const isSelected = iso === selected;

            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className={classNames(
                  'flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-semibold transition hover:scale-[1.04]',
                  cellStyle(stat.total, stat.completionRate, isFuture),
                  !inMonth && 'opacity-30',
                  iso === today && 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-panel-dark',
                  isSelected && 'outline outline-2 outline-brand-600'
                )}
              >
                <span>{format(day, 'd')}</span>
                {stat.total > 0 && <span className="text-[10px] font-medium opacity-80">{stat.completed}/{stat.total}</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500" /> 100%</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-200" /> 75%+</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-200" /> 50%+</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-orange-200" /> Under 50%</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-rose-200" /> 0%</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-sky-100" /> Upcoming</span>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-bold">{format(new Date(selected + 'T00:00:00'), 'EEEE, d MMMM')}</h2>
        <p className="mb-3 text-xs text-slate-400">{selectedTasks.length} task{selectedTasks.length === 1 ? '' : 's'}</p>

        {selectedTasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Nothing scheduled for this day.</p>
        ) : (
          <div className="space-y-2">
            {selectedTasks.map((t) => (
              <div key={t.id} className="rounded-lg border border-slate-200/70 p-3 dark:border-slate-800">
                <div className="flex items-start justify-between gap-2">
                  <button onClick={() => toggleComplete(t.id)} className={classNames('text-left text-sm font-semibold', t.completed && 'text-slate-400 line-through')}>
                    {t.title}
                  </button>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <StatusBadge status={deriveTaskStatus(t)} />
                  <PriorityBadge priority={t.priority} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
