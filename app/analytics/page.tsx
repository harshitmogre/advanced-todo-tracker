'use client';

import { useMemo, useState } from 'react';
import { CalendarCheck, CalendarRange, CheckCircle2, AlertTriangle, Flame, Percent, TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react';
import { useTasksContext } from '@/lib/context/TasksContext';
import { buildPeriodStats, computeInsights } from '@/lib/analytics';
import { ComparisonGranularity } from '@/lib/types';
import { classNames } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import { ActivityBarChart, CompletionLineChart } from '@/components/analytics/ComparisonChart';
import ComparisonTable from '@/components/analytics/ComparisonTable';

const TABS: Array<{ key: ComparisonGranularity; label: string; count: number; unit: string }> = [
  { key: 'day', label: 'Day by day', count: 14, unit: 'yesterday' },
  { key: 'week', label: 'Week by week', count: 8, unit: 'last week' },
  { key: 'month', label: 'Month by month', count: 12, unit: 'last month' },
  { key: 'year', label: 'Year by year', count: 5, unit: 'last year' }
];

function Delta({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
        <Minus size={13} /> No change
      </span>
    );
  }
  const up = value > 0;
  return (
    <span className={classNames('inline-flex items-center gap-1 text-xs font-semibold', up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
      {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {up ? '+' : ''}
      {value}
      {suffix}
    </span>
  );
}

export default function AnalyticsPage() {
  const { tasks, loading } = useTasksContext();
  const [granularity, setGranularity] = useState<ComparisonGranularity>('week');

  const tab = TABS.find((t) => t.key === granularity)!;
  const periods = useMemo(() => buildPeriodStats(tasks, granularity, tab.count), [tasks, granularity, tab.count]);
  const insights = useMemo(() => computeInsights(tasks), [tasks]);

  if (loading) return <p className="py-20 text-center text-sm text-slate-400">Crunching your numbers…</p>;

  const current = periods[periods.length - 1];
  const previous = periods[periods.length - 2];
  const rateDelta = current && previous ? Math.round((current.completionRate - previous.completionRate) * 10) / 10 : 0;
  const completedDelta = current && previous ? current.completed - previous.completed : 0;
  const overdueDelta = current && previous ? current.overdue - previous.overdue : 0;

  return (
    <div className="space-y-6">
      {/* Insight cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Most productive day" value={insights.mostProductiveDay} icon={CalendarCheck} tone="brand" />
        <StatCard label="Best month" value={insights.mostProductiveMonth} icon={CalendarRange} tone="violet" />
        <StatCard label="Avg daily completion" value={insights.avgCompletionRate} suffix="%" icon={Percent} tone="sky" />
        <StatCard label="Tasks completed" value={insights.totalCompleted} icon={CheckCircle2} tone="green" />
        <StatCard label="Tasks overdue" value={insights.totalOverdue} icon={AlertTriangle} tone="red" />
        <StatCard label="Longest streak" value={insights.longestStreak} suffix={insights.longestStreak === 1 ? ' day' : ' days'} icon={Trophy} tone="amber" />
      </div>

      {/* Granularity tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setGranularity(t.key)}
            className={classNames(
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              granularity === t.key
                ? 'bg-brand-600 text-white shadow-soft'
                : 'bg-white text-slate-500 hover:text-brand-600 dark:bg-panel-dark dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Current vs previous */}
      {current && previous && (
        <div className="card grid gap-4 p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-slate-400">Completion rate vs {tab.unit}</p>
            <p className="mt-1 text-2xl font-bold">{current.completionRate}%</p>
            <Delta value={rateDelta} suffix="%" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Tasks completed vs {tab.unit}</p>
            <p className="mt-1 text-2xl font-bold">{current.completed}</p>
            <Delta value={completedDelta} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Overdue vs {tab.unit}</p>
            <p className="mt-1 text-2xl font-bold">{current.overdue}</p>
            <Delta value={-overdueDelta} />
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-bold">Activity</h2>
          <ActivityBarChart data={periods} />
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-bold">Completion trend</h2>
          <CompletionLineChart data={periods} />
        </div>
      </div>

      {/* Table */}
      <div className="card p-5">
        <h2 className="mb-3 text-sm font-bold">Breakdown</h2>
        <ComparisonTable data={periods} />
      </div>
    </div>
  );
}
