'use client';

import { useCallback, useEffect, useState } from 'react';
import { repo } from '@/lib/storage';
import { buildSeedTasks } from '@/lib/seed';
import { Task } from '@/lib/types';
import { generateId, todayISO } from '@/lib/utils';
import { addDays, addMonths, addWeeks, parseISO } from 'date-fns';
import { toISODate } from '@/lib/utils';

export type NewTaskInput = Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt'>;

function nextRecurrenceDate(deadline: string, recurrence: Task['recurrence']): string | null {
  const d = parseISO(deadline);
  if (recurrence === 'daily') return toISODate(addDays(d, 1));
  if (recurrence === 'weekly') return toISODate(addWeeks(d, 1));
  if (recurrence === 'monthly') return toISODate(addMonths(d, 1));
  return null;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const seeded = await repo.hasSeeded();
      if (!seeded) {
        const seedTasks = buildSeedTasks();
        await repo.saveTasks(seedTasks);
        await repo.markSeeded();
      }
      const loaded = await repo.getTasks();
      setTasks(loaded);
      setLoading(false);
    })();
  }, []);

  const addTask = useCallback(async (input: NewTaskInput) => {
    const task: Task = {
      ...input,
      id: generateId(),
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    const next = await repo.createTask(task);
    setTasks(next);
    return task;
  }, []);

  const updateTask = useCallback(async (id: string, patch: Partial<Task>) => {
    const next = await repo.updateTask(id, patch);
    setTasks(next);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const next = await repo.deleteTask(id);
    setTasks(next);
  }, []);

  const toggleComplete = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const willComplete = !task.completed;

      await updateTask(id, {
        completed: willComplete,
        completedAt: willComplete ? new Date().toISOString() : null
      });

      // If completing a recurring task, spin off the next occurrence.
      if (willComplete && task.recurrence !== 'none') {
        const nextDate = nextRecurrenceDate(task.deadline, task.recurrence);
        if (nextDate) {
          await addTask({
            title: task.title,
            notes: task.notes,
            category: task.category,
            priority: task.priority,
            deadline: nextDate,
            estimatedMinutes: task.estimatedMinutes,
            recurrence: task.recurrence
          });
        }
      }
    },
    [tasks, updateTask, addTask]
  );

  const clearAllData = useCallback(async () => {
    await repo.clearAll();
    const seedTasks = buildSeedTasks();
    await repo.saveTasks(seedTasks);
    await repo.markSeeded();
    setTasks(await repo.getTasks());
  }, []);

  const wipeData = useCallback(async () => {
    await repo.clearAll();
    await repo.markSeeded(); // prevent re-seeding
    setTasks([]);
  }, []);

  return { tasks, loading, addTask, updateTask, deleteTask, toggleComplete, clearAllData, wipeData, today: todayISO() };
}
