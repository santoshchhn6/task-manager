const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

function formatDue(dueDate) {
  if (!dueDate) return null;
  const d = new Date(`${String(dueDate).slice(0, 10)}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function isOverdue(task) {
  if (!task.due_date || task.status === 'done') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${String(task.due_date).slice(0, 10)}T00:00:00`) < today;
}

export default function TaskItem({ task, onToggleDone, onChangeStatus, onEdit, onDelete }) {
  const done = task.status === 'done';
  const overdue = isOverdue(task);

  return (
    <div className={`task-item ${done ? 'is-done' : ''}`}>
      <button
        className={`check ${done ? 'checked' : ''}`}
        onClick={() => onToggleDone(task)}
        title={done ? 'Mark as not done' : 'Mark as done'}
        aria-label="Toggle done"
      >
        {done && '✓'}
      </button>

      <div className="task-body">
        <div className="task-title">{task.title}</div>
        {task.description && <div className="task-desc">{task.description}</div>}
        <div className="meta">
          <span className={`badge ${task.priority}`}>{task.priority}</span>
          {task.due_date && (
            <span className={`due ${overdue ? 'overdue' : ''}`}>
              📅 {formatDue(task.due_date)}
              {overdue && ' · overdue'}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
        <select
          className="status-select"
          value={task.status}
          onChange={(e) => onChangeStatus(task, e.target.value)}
          title="Change status"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <div className="task-actions">
          <button className="icon-btn" onClick={() => onEdit(task)} title="Edit task">
            ✏️
          </button>
          <button className="icon-btn danger" onClick={() => onDelete(task)} title="Delete task">
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
