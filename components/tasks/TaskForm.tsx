'use client';

import { useState } from 'react';
import { Priority, Recurrence, Task } from '@/lib/types';
import { todayISO } from '@/lib/utils';
import { NewTaskInput } from '@/hooks/useTasks';

export default function TaskForm({
  initial,
  categories,
  onSubmit,
  onClose
}: {
  initial?: Task;
  categories: string[];
  onSubmit: (data: NewTaskInput) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState(initial?.category ?? categories[0] ?? 'Personal');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [deadline, setDeadline] = useState(initial?.deadline ?? todayISO());
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>(initial?.estimatedMinutes ? String(initial.estimatedMinutes) : '30');
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'none');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Give the task a title.');
      return;
    }
    onSubmit({
      title: title.trim(),
      category,
      priority,
      deadline,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
      recurrence,
      notes: notes.trim()
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10">{error}</p>}

      <div>
        <label className="label">Title</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Finish assignment draft" autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Priority</label>
          <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Deadline</label>
          <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <div>
          <label className="label">Estimated minutes</label>
          <input type="number" min={0} step={5} className="input" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Repeats</label>
        <select className="input" value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)}>
          <option value="none">Does not repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input min-h-[70px] resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details…" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initial ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  );
}
