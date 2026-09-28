'use client';

import { TaskStatus, Priority } from '@/lib/types';
import { classNames } from '@/lib/utils';

export interface TaskFilterState {
  status: TaskStatus | 'all';
  priority: Priority | 'all';
  category: string | 'all';
  search: string;
}

export default function TaskFilters({
  filters,
  onChange,
  categories
}: {
  filters: TaskFilterState;
  onChange: (next: TaskFilterState) => void;
  categories: string[];
}) {
  const statusOptions: Array<TaskStatus | 'all'> = ['all', 'pending', 'completed', 'overdue'];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => onChange({ ...filters, status: s })}
            className={classNames(
              'rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition',
              filters.status === s
                ? 'bg-brand-600 text-white shadow-soft'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <select className="input !w-auto text-xs" value={filters.priority} onChange={(e) => onChange({ ...filters, priority: e.target.value as any })}>
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="input !w-auto text-xs" value={filters.category} onChange={(e) => onChange({ ...filters, category: e.target.value })}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="input !w-auto text-xs"
          placeholder="Search tasks…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
    </div>
  );
}
