'use client';

import { useMemo, useState } from 'react';
import { Plus, ListTodo } from 'lucide-react';
import { useTasksContext } from '@/lib/context/TasksContext';
import { useSettings } from '@/hooks/useSettings';
import { Task } from '@/lib/types';
import { deriveTaskStatus } from '@/lib/analytics';
import Modal from '@/components/ui/Modal';
import TaskForm from '@/components/tasks/TaskForm';
import TaskItem from '@/components/tasks/TaskItem';
import TaskFilters, { TaskFilterState } from '@/components/tasks/TaskFilters';

const DEFAULT_FILTERS: TaskFilterState = { status: 'all', priority: 'all', category: 'all', search: '' };

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleComplete, loading } = useTasksContext();
  const { settings } = useSettings();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_FILTERS);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => (filters.status === 'all' ? true : deriveTaskStatus(t) === filters.status))
      .filter((t) => (filters.priority === 'all' ? true : t.priority === filters.priority))
      .filter((t) => (filters.category === 'all' ? true : t.category === filters.category))
      .filter((t) => (filters.search ? t.title.toLowerCase().includes(filters.search.toLowerCase()) : true))
      .sort((a, b) => (a.deadline < b.deadline ? -1 : a.deadline > b.deadline ? 1 : 0));
  }, [tasks, filters]);

  function openAddModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  async function handleSubmit(data: any) {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await addTask(data);
    }
    setModalOpen(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'}</p>
        <button onClick={openAddModal} className="btn-primary">
          <Plus size={16} /> Add task
        </button>
      </div>

      <div className="card p-4">
        <TaskFilters filters={filters} onChange={setFilters} categories={settings.categories} />
      </div>

      <div className="space-y-2">
        {loading ? (
          <p className="py-10 text-center text-sm text-slate-400">Loading…</p>
        ) : filteredTasks.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 py-14 text-center">
            <ListTodo className="text-slate-300 dark:text-slate-600" size={32} />
            <p className="text-sm font-medium text-slate-500">No tasks match these filters.</p>
            <button onClick={openAddModal} className="btn-secondary mt-2">
              <Plus size={14} /> Add a task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => toggleComplete(task.id)}
              onEdit={() => openEditModal(task)}
              onDelete={() => deleteTask(task.id)}
            />
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'Edit task' : 'Add a task'}>
        <TaskForm initial={editingTask ?? undefined} categories={settings.categories} onSubmit={handleSubmit} onClose={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
