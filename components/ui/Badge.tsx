import { classNames } from '@/lib/utils';
import { Priority, TaskStatus } from '@/lib/types';

const PRIORITY_STYLES: Record<Priority, string> = {
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300'
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  pending: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={classNames('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize', PRIORITY_STYLES[priority])}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={classNames('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize', STATUS_STYLES[status])}>
      {status}
    </span>
  );
}

export function CategoryTag({ color, children }: { color: { bg: string; text: string; dot: string }; children: React.ReactNode }) {
  return (
    <span className={classNames('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', color.bg, color.text)}>
      <span className={classNames('h-1.5 w-1.5 rounded-full', color.dot)} />
      {children}
    </span>
  );
}
