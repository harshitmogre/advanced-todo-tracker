'use client';

import { Task } from '@/lib/types';
import { deriveTaskStatus } from '@/lib/analytics';
import { colorForCategory, classNames } from '@/lib/utils';
import { PriorityBadge, StatusBadge, CategoryTag } from '@/components/ui/Badge';
import { Check, Pencil, Repeat, Trash2, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = deriveTaskStatus(task);
  const categoryColor = colorForCategory(task.category);

  return (
    <div
      className={classNames(
        'group flex items-start gap-3 rounded-xl border border-slate-200/70 bg-panel-light p-3.5 transition hover:shadow-card dark:border-slate-800 dark:bg-panel-dark',
        task.completed && 'opacity-60'
      )}
    >
      <button
        onClick={onToggle}
        className={classNames(
          'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition',
          task.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-brand-500 dark:border-slate-600'
        )}
        aria-label="Toggle complete"
      >
        <Check size={13} strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={classNames('text-sm font-semibold', task.completed && 'line-through text-slate-400')}>{task.title}</p>
          {task.recurrence !== 'none' && <Repeat size={13} className="text-slate-400" />}
        </div>
        {task.notes && <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{task.notes}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={status} />
          <PriorityBadge priority={task.priority} />
          <CategoryTag color={categoryColor}>{task.category}</CategoryTag>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Clock size={11} />
            {format(parseISO(task.deadline), 'd MMM')}
            {task.estimatedMinutes ? ` · ${task.estimatedMinutes}m` : ''}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <button onClick={onEdit} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
