'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Flame, Gauge, Plus, Target } from 'lucide-react';
import { useTasksContext } from '@/lib/context/TasksContext';
import { useSettings } from '@/hooks/useSettings';
import { buildDailyStats, computeCurrentStreak, computeTodaySnapshot } from '@/lib/analytics';
import { addDays } from 'date-fns';
import StatCard from '@/components/ui/StatCard';
import ProgressRing from '@/components/ui/ProgressRing';
import Modal from '@/components/ui/Modal';
import TaskForm from '@/components/tasks/TaskForm';
import MotivationBanner from '@/components/dashboard/MotivationBanner';
import TrendChart from '@/components/dashboard/TrendChart';
import TodayTaskList from '@/components/dashboard/TodayTaskList';
import { NewTaskInput } from '@/hooks/useTasks';

export default function DashboardPage() {
  const { tasks, loading, toggleComplete, addTask, today } = useTasksContext();
  const { settings } = useSettings();
  const [modalOpen, setModalOpen] = useState(false);

  const snapshot = useMemo(() => computeTodaySnapshot(tasks), [tasks]);
  const streak = useMemo(() => computeCurrentStreak(tasks), [tasks]);
  const last7 = useMemo(() => buildDailyStats(tasks, addDays(new Date(), -6), new Date()), [tasks]);
  const todaysTasks = useMemo(() => tasks.filter((t) => t.deadline === today), [tasks, today]);

  async function handleAdd(data: NewTaskInput) {
    await addTask(data);
    setModalOpen(false);
  }

  if (loading) {
    return <p className="py-20 text-center text-sm text-slate-400">Loading your dashboard…</p>;
  }

  const goalProgress = Math.min(100, Math.round((snapshot.completed / Math.max(settings.dailyTaskGoal, 1)) * 100));

  return (
    <div className="space-y-6">
      <MotivationBanner completed={snapshot.completed} total={snapshot.total} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Completed today" value={`${snapshot.completed}/${snapshot.total}`} icon={CheckCircle2} tone="green" />
        <StatCard label="Pending" value={snapshot.pending} icon={Clock} tone="sky" subtext="Due today" />
        <StatCard label="Overdue" value={snapshot.overdueAllTime} icon={AlertTriangle} tone="red" subtext="All-time unfinished" />
        <StatCard label="Current streak" value={streak} suffix={streak === 1 ? ' day' : ' days'} icon={Flame} tone="amber" />
        <StatCard label="Productivity score" value={snapshot.score} suffix="/100" icon={Gauge} tone="violet" subtext="Priority-weighted" />
        <StatCard label="Daily goal" value={`${goalProgress}`} suffix="%" icon={Target} tone="brand" subtext={`${settings.dailyTaskGoal} tasks/day`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card flex flex-col items-center justify-center gap-3 p-6 lg:col-span-1">
          <h2 className="self-start text-sm font-bold">Today's completion</h2>
          <ProgressRing percent={snapshot.completionRate} size={180} strokeWidth={16} label="complete" />
          <p className="text-xs text-slate-400">
            {snapshot.completed} of {snapshot.total} tasks done
          </p>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold">Last 7 days</h2>
            <span className="text-xs text-slate-400">Completion rate</span>
          </div>
          <TrendChart data={last7} />
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">Today's tasks</h2>
          <button onClick={() => setModalOpen(true)} className="btn-secondary !py-1.5 text-xs">
            <Plus size={14} /> Add task
          </button>
        </div>
        <TodayTaskList tasks={todaysTasks} onToggle={toggleComplete} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add a task">
        <TaskForm categories={settings.categories} onSubmit={handleAdd} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
