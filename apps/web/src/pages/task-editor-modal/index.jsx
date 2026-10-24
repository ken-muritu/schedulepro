import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskEditorModal from '../../components/ui/TaskEditorModal';
import TopAppBar from '../../components/ui/TopAppBar';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';

export default function TaskEditorModalPage() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleSave = (task) => {
    try {
      const existing = JSON.parse(localStorage.getItem('schedulepro_tasks') || '[]');
      const idx = existing?.findIndex(t => t?.id === task?.id);
      if (idx >= 0) existing[idx] = task;
      else existing?.push(task);
      localStorage.setItem('schedulepro_tasks', JSON.stringify(existing));
    } catch {}
    navigate('/dashboard');
  };

  const handleClose = () => navigate('/dashboard');

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <TopAppBar currentMode="flexible" onModeToggle={() => {}} onAddTask={() => setIsOpen(true)} />
      <main className="content-area px-4 md:px-6 max-w-2xl mx-auto">
        <div className="pt-6 pb-4">
          <h1 className="font-heading text-2xl font-bold text-[var(--color-foreground)]">Task Editor</h1>
          <p className="font-body text-sm text-[var(--color-muted-foreground)] mt-1">Create or edit a task with custom duration</p>
        </div>
        <div className="card p-6 text-center">
          <p className="font-body text-sm text-[var(--color-muted-foreground)] mb-4">Use the modal below to create a new task.</p>
          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-3 rounded-xl font-heading text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            Open Task Editor
          </button>
        </div>
      </main>
      <BottomTabNavigation />
      <TaskEditorModal
        isOpen={isOpen}
        onClose={handleClose}
        editingTask={null}
        onSave={handleSave}
        onDelete={() => {}}
      />
    </div>
  );
}
