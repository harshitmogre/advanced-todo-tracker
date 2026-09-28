import { Priority, Task } from './types';
import { generateId, toISODate } from './utils';

const CATEGORIES = ['Study', 'Work', 'Personal', 'Health', 'Errands'];
const TITLES = [
  'Review lecture notes', 'Finish assignment draft', 'Reply to emails', 'Gym session',
  'Read 20 pages', 'Team standup', 'Grocery shopping', 'Fix bug in project',
  'Plan next week', 'Call family', 'Write report', 'Clean workspace',
  'Practice problems', 'Prepare presentation', 'Meal prep', 'Revise chapter 4',
  'Update resume', 'Water plants', 'Submit assignment', 'Lab work'
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Builds ~35 days of plausible history (some good days, some slack days)
 * plus a handful of tasks for today, so the dashboard/analytics have
 * something meaningful to show immediately.
 */
export function buildSeedTasks(): Task[] {
  const tasks: Task[] = [];
  const now = new Date();

  for (let daysAgo = 35; daysAgo >= 1; daysAgo--) {
    const day = new Date(now);
    day.setDate(day.getDate() - daysAgo);
    const iso = toISODate(day);

    // Vary how "productive" each day was, with occasional low days.
    const roll = Math.random();
    const taskCount = roll < 0.15 ? 1 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 4);
    const completionChance = roll < 0.15 ? 0.3 : 0.65 + Math.random() * 0.35;

    for (let i = 0; i < taskCount; i++) {
      const isCompleted = Math.random() < completionChance;
      const createdAt = new Date(day);
      createdAt.setHours(8 + Math.floor(Math.random() * 4));
      const completedAt = isCompleted ? new Date(day.setHours(9 + Math.floor(Math.random() * 10))) : null;

      tasks.push({
        id: generateId(),
        title: pick(TITLES),
        notes: '',
        category: pick(CATEGORIES),
        priority: pick(['low', 'medium', 'high']) as Priority,
        deadline: iso,
        estimatedMinutes: pick([15, 30, 45, 60, 90]),
        recurrence: 'none',
        completed: isCompleted,
        createdAt: createdAt.toISOString(),
        completedAt: completedAt ? completedAt.toISOString() : null
      });
    }
  }

  // A few tasks for today: a mix of done / pending, so the dashboard has live data.
  const todayIso = toISODate(now);
  const todaysTasks: Array<[string, boolean]> = [
    ['Review lecture notes', true],
    ['Morning workout', true],
    ['Finish assignment draft', false],
    ['Reply to emails', false],
    ['Plan tomorrow', false]
  ];
  todaysTasks.forEach(([title, completed]) => {
    const createdAt = new Date(now);
    createdAt.setHours(7);
    tasks.push({
      id: generateId(),
      title,
      notes: '',
      category: pick(CATEGORIES),
      priority: pick(['low', 'medium', 'high']) as Priority,
      deadline: todayIso,
      estimatedMinutes: pick([15, 30, 45, 60]),
      recurrence: 'none',
      completed,
      createdAt: createdAt.toISOString(),
      completedAt: completed ? new Date().toISOString() : null
    });
  });

  return tasks;
}
