import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import { api } from './api.js';
import { useTheme } from './hooks/useTheme.js';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

export default function App() {
  const { theme, toggle } = useTheme();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  const loadTasks = useCallback(async () => {
    try {
      setError('');
      const data = await api.list();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
    }),
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (q && !`${t.title} ${t.description || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, statusFilter, search]);

  async function handleCreate(data) {
    await api.create(data);
    setEditingTask(null);
    await loadTasks();
  }

  async function handleUpdate(id, data) {
    await api.update(id, data);
    setEditingTask(null);
    await loadTasks();
  }

  const handleFormSubmit = (data) =>
    editingTask ? handleUpdate(editingTask.id, data) : handleCreate(data);

  async function toggleDone(task) {
    try {
      await api.update(task.id, { status: task.status === 'done' ? 'todo' : 'done' });
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeStatus(task, status) {
    try {
      await api.update(task.id, { status });
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.remove(task.id);
      if (editingTask?.id === task.id) setEditingTask(null);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={toggle} />

      <section className="stats">
        <div className="stat-card accent">
          <div className="num">{stats.total}</div>
          <div className="label">Total tasks</div>
        </div>
        <div className="stat-card">
          <div className="num">{stats.todo}</div>
          <div className="label">To do</div>
        </div>
        <div className="stat-card progress">
          <div className="num">{stats.in_progress}</div>
          <div className="label">In progress</div>
        </div>
        <div className="stat-card done">
          <div className="num">{stats.done}</div>
          <div className="label">Done</div>
        </div>
      </section>

      {error && (
        <div className="error-banner" role="alert">
          ⚠️ {error}{' '}
          <button className="btn btn-ghost" style={{ padding: '4px 12px', marginLeft: 8 }} onClick={loadTasks}>
            Retry
          </button>
        </div>
      )}

      <TaskForm editingTask={editingTask} onSubmit={handleFormSubmit} onCancel={() => setEditingTask(null)} />

      <div style={{ height: 20 }} />

      <div className="toolbar">
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={statusFilter === t.key}
              className={`tab ${statusFilter === t.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="search">
          <input
            className="input"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading tasks…</div>
      ) : (
        <TaskList
          tasks={visibleTasks}
          onToggleDone={toggleDone}
          onChangeStatus={changeStatus}
          onEdit={(task) => setEditingTask(task)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
