'use client';

import { useRef, useState } from 'react';
import { Download, Upload, Trash2, RotateCcw, Plus, X } from 'lucide-react';
import { useTasksContext } from '@/lib/context/TasksContext';
import { useSettings } from '@/hooks/useSettings';
import { repo } from '@/lib/storage';
import { Task } from '@/lib/types';

export default function SettingsPage() {
  const { tasks, clearAllData, wipeData } = useTasksContext();
  const { settings, updateSettings } = useSettings();
  const [newCategory, setNewCategory] = useState('');
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function flash(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  }

  function addCategory() {
    const name = newCategory.trim();
    if (!name || settings.categories.includes(name)) return;
    updateSettings({ categories: [...settings.categories, name] });
    setNewCategory('');
  }

  function removeCategory(name: string) {
    updateSettings({ categories: settings.categories.filter((c) => c !== name) });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ tasks, settings }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'focusflow-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as { tasks: Task[]; settings?: typeof settings };
      if (!Array.isArray(parsed.tasks)) throw new Error('bad file');
      await repo.saveTasks(parsed.tasks);
      if (parsed.settings) await repo.saveSettings(parsed.settings);
      flash('Backup imported — reloading…');
      setTimeout(() => window.location.reload(), 700);
    } catch {
      flash("That file doesn't look like a valid backup.");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {message && <div className="rounded-lg bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{message}</div>}

      <div className="card p-5">
        <h2 className="text-sm font-bold">Daily task goal</h2>
        <p className="mb-3 text-xs text-slate-400">How many tasks you aim to complete each day.</p>
        <input
          type="number"
          min={1}
          max={50}
          className="input !w-28"
          value={settings.dailyTaskGoal}
          onChange={(e) => updateSettings({ dailyTaskGoal: Math.max(1, Number(e.target.value) || 1) })}
        />
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-bold">Categories</h2>
        <p className="mb-3 text-xs text-slate-400">Used to organise your tasks.</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {settings.categories.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-1.5 text-xs font-medium dark:bg-slate-800">
              {c}
              <button onClick={() => removeCategory(c)} className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-rose-600 dark:hover:bg-slate-700">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input" placeholder="New category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCategory()} />
          <button onClick={addCategory} className="btn-primary">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-bold">Your data</h2>
        <p className="mb-4 text-xs text-slate-400">Everything is stored in this browser. Export a backup so you never lose it.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportData} className="btn-secondary">
            <Download size={15} /> Export backup
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary">
            <Upload size={15} /> Import backup
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importData} />
        </div>
      </div>

      <div className="card border-rose-200 p-5 dark:border-rose-500/30">
        <h2 className="text-sm font-bold text-rose-600 dark:text-rose-400">Danger zone</h2>
        <p className="mb-4 text-xs text-slate-400">The app starts with demo data so the charts aren't empty. Remove it when you're ready to use it for real.</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (confirm('Delete ALL tasks and start with a completely empty tracker?')) wipeData();
            }}
            className="btn-secondary !border-rose-300 !text-rose-600"
          >
            <Trash2 size={15} /> Delete all data
          </button>
          <button
            onClick={() => {
              if (confirm('Replace everything with fresh demo data?')) clearAllData();
            }}
            className="btn-secondary"
          >
            <RotateCcw size={15} /> Reset to demo data
          </button>
        </div>
      </div>
    </div>
  );
}
