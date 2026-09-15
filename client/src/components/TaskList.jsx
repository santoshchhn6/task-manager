import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks, onToggleDone, onChangeStatus, onEdit, onDelete }) {
  if (!tasks.length) {
    return (
      <div className="empty">
        <div className="big">🗒️</div>
        <p>No tasks here. Add one above to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleDone={onToggleDone}
          onChangeStatus={onChangeStatus}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
