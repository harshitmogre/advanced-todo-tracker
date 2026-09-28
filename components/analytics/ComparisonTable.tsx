import { PeriodStat } from '@/lib/types';
import { classNames } from '@/lib/utils';
import { Flame } from 'lucide-react';

function rateColor(rate: number) {
  if (rate >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
  if (rate >= 50) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
  return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300';
}

export default function ComparisonTable({ data }: { data: PeriodStat[] }) {
  const rows = [...data].reverse(); // newest first

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
            <th className="py-2.5 pr-3 font-semibold">Period</th>
            <th className="py-2.5 pr-3 font-semibold">Created</th>
            <th className="py-2.5 pr-3 font-semibold">Completed</th>
            <th className="py-2.5 pr-3 font-semibold">Overdue</th>
            <th className="py-2.5 pr-3 font-semibold">Completion</th>
            <th className="py-2.5 font-semibold">Perfect</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
              <td className="py-3 pr-3 font-semibold">{row.label}</td>
              <td className="py-3 pr-3 text-slate-500">{row.created}</td>
              <td className="py-3 pr-3 text-emerald-600 dark:text-emerald-400">{row.completed}</td>
              <td className={classNames('py-3 pr-3', row.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400')}>{row.overdue}</td>
              <td className="py-3 pr-3">
                <span className={classNames('rounded-full px-2.5 py-1 text-xs font-bold', rateColor(row.completionRate))}>{row.completionRate}%</span>
              </td>
              <td className="py-3">{row.streakActive ? <Flame size={16} className="text-amber-500" /> : <span className="text-slate-300">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
