import React from 'react';
import TaskItem from './TaskItem';
import { Task } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  error?: string | null;
  onToggleCompletion: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  error,
  onToggleCompletion,
  onDelete,
  onEdit,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10" role="status" aria-label="Loading tasks">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" aria-hidden="true"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
        role="alert"
        aria-live="polite"
      >
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10" role="status" aria-label="No tasks available">
        <p className="text-gray-500">No tasks yet. Create your first task!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3" role="list" aria-label="Task list">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem
            task={task}
            onToggleCompletion={onToggleCompletion}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </li>
      ))}
    </ul>
  );
};

export default TaskList;