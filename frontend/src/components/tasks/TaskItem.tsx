import React from 'react';
import { Task } from '@/lib/types';

interface TaskItemProps {
  task: Task;
  onToggleCompletion: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleCompletion, onDelete, onEdit }) => {
  const handleToggle = () => {
    onToggleCompletion(task.id);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      onDelete(task.id);
    }
  };

  const handleEdit = () => {
    onEdit(task);
  };

  return (
    <div
      className={`task-item ${task.completed ? 'completed' : ''} animate-fade-in`}
      role="listitem"
    >
      <div className="flex items-start gap-4">
        {/* Custom Checkbox */}
        <div className="flex items-center h-6 mt-1">
          <input
            type="checkbox"
            id={`task-completed-${task.id}`}
            checked={task.completed}
            onChange={handleToggle}
            className="sr-only peer"
            aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />
          <label
            htmlFor={`task-completed-${task.id}`}
            className="relative flex items-center justify-center w-6 h-6 border-2 border-gray-300 rounded-lg cursor-pointer transition-all duration-300 peer-checked:bg-gradient-to-br peer-checked:from-primary-500 peer-checked:to-purple-600 peer-checked:border-primary-500 hover:border-primary-400 peer-focus:ring-4 peer-focus:ring-primary-100"
          >
            {task.completed && (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </label>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`task-title ${task.completed ? 'completed' : ''}`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="task-description" id={`task-description-${task.id}`}>
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-3">
            <p className="task-meta" id={`task-created-${task.id}`}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(task.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            {task.completed && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleEdit}
            className="px-4 py-2 text-sm font-semibold text-primary-700 bg-primary-50 border-2 border-primary-200 rounded-xl hover:bg-primary-100 hover:border-primary-300 transition-all duration-300 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={`Edit task "${task.title}"`}
          >
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </span>
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label={`Delete task "${task.title}"`}
          >
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;