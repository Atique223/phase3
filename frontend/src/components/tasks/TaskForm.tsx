import React, { useState } from 'react';
import { CreateTaskInput } from '@/lib/types';

interface TaskFormProps {
  onSubmit: (task: CreateTaskInput) => void;
  onCancel?: () => void;
  initialData?: CreateTaskInput;
  isEditing?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  initialData = { title: '', description: '', completed: false },
  isEditing = false
}) => {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description || '');
  const [completed, setCompleted] = useState(initialData.completed || false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }

    if (title.length > 255) {
      setError('Title must be 255 characters or less');
      return false;
    }

    if (description && description.length > 1000) {
      setError('Description must be 1000 characters or less');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      completed
    });

    // Reset form after successful submission
    if (!isEditing) {
      setTitle('');
      setDescription('');
      setCompleted(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md flexible-form" role="form" aria-label={isEditing ? "Edit Task Form" : "Create Task Form"}>
      {error && (
        <div
          className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`input ${error && !title ? 'input-error' : ''}`}
          placeholder="Enter task title"
          maxLength={255}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? "task-form-error" : undefined}
        />
        {error && !title && (
          <p className="mt-1 text-sm text-red-600" id="task-form-error">
            Title is required
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea"
          placeholder="Enter task description (optional)"
          maxLength={1000}
          aria-describedby="task-description-help"
        />
        <p id="task-description-help" className="mt-1 text-xs text-gray-500">
          Optional description for your task (max 1000 characters)
        </p>
      </div>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="task-completed"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="task-completed" className="ml-2 block text-sm text-gray-700">
          Mark as completed
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="btn btn-primary"
        >
          {isEditing ? 'Update Task' : 'Create Task'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;