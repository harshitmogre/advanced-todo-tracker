'use client';

import { Task } from '@/lib/types';
import { Check } from 'lucide-react';
import { classNames } from '@/lib/utils';
import { PriorityBadge } from '@/components/ui/Badge';

export default function TodayTaskList({ tasks, onToggle }: { tasks: Task[]; onToggle: (id: string) => void }) {
  if (tasks.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Nothing due today. Add a task to get started.</p>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-3 rounded-lg px-1.5 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <button
            onClick={() => onToggle(task.id)}
            className={classNames(
              'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition',
              task.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-brand-500 dark:border-slate-600'
            )}
          >
            <Check size={13} strokeWidth={3} />
          </button>
          <span className={classNames('flex-1 text-sm font-medium', task.completed && 'text-slate-400 line-through')}>{task.title}</span>
          <PriorityBadge priority={task.priority} />
        </div>
      ))}
    </div>
  );
}
