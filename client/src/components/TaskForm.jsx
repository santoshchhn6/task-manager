import { useEffect, useState } from 'react';

const EMPTY = { title: '', description: '', priority: 'medium', dueDate: '' };

export default function TaskForm({ editingTask, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title,
        description: editingTask.description || '',
        priority: editingTask.priority,
        dueDate: editingTask.due_date ? String(editingTask.due_date).slice(0, 10) : '',
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [editingTask]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please enter a task title.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        ...form,
        dueDate: form.dueDate || null,
      });
      if (!editingTask) setForm(EMPTY); // keep values when editing (parent clears it)
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">{editingTask ? 'Edit task' : 'Add a new task'}</label>
        <input
          id="title"
          className="input"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={set('title')}
          maxLength={255}
        />
      </div>

      <div>
        <label htmlFor="desc">Description (optional)</label>
        <textarea
          id="desc"
          className="textarea"
          placeholder="Add more details…"
          value={form.description}
          onChange={set('description')}
        />
      </div>

      <div className="form-row">
        <div>
          <label htmlFor="priority">Priority</label>
          <select id="priority" className="select" value={form.priority} onChange={set('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="due">Due date (optional)</label>
          <input id="due" type="date" className="input" value={form.dueDate} onChange={set('dueDate')} />
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: 13.5, margin: 0 }}>{error}</p>}

      <div className="form-actions">
        {editingTask && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : editingTask ? 'Save changes' : '+ Add task'}
        </button>
      </div>
    </form>
  );
}
