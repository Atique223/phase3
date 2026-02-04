import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTaskInput } from '@/src/lib/types';
import TaskForm from './TaskForm';

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

describe('TaskForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/Title \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mark as completed/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Task/i })).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title \*/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const submitButton = screen.getByRole('button', { name: /Create Task/i });

    await userEvent.type(titleInput, 'New Task');
    await userEvent.type(descriptionInput, 'New Description');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        completed: false,
      });
    });
  });

  it('validates required title field', async () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Create Task/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
  });

  it('validates title length', async () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title \*/i);
    const submitButton = screen.getByRole('button', { name: /Create Task/i });

    // Fill with 256 characters (more than max)
    const longTitle = 'a'.repeat(256);
    await userEvent.type(titleInput, longTitle);

    fireEvent.click(submitButton);

    expect(screen.getByText(/Title must be 255 characters or less/i)).toBeInTheDocument();
  });

  it('validates description length', async () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title \*/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const submitButton = screen.getByRole('button', { name: /Create Task/i });

    await userEvent.type(titleInput, 'Valid Title');
    await userEvent.type(descriptionInput, 'a'.repeat(1001)); // More than 1000 characters

    fireEvent.click(submitButton);

    expect(screen.getByText(/Description must be 1000 characters or less/i)).toBeInTheDocument();
  });

  it('handles completion checkbox correctly', async () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title \*/i);
    const completedCheckbox = screen.getByLabelText(/Mark as completed/i);
    const submitButton = screen.getByRole('button', { name: /Create Task/i });

    await userEvent.type(titleInput, 'Completed Task');
    fireEvent.click(completedCheckbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Completed Task',
        description: '',
        completed: true,
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('does not show cancel button if onCancel is not provided', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.queryByRole('button', { name: /Cancel/i });
    expect(cancelButton).not.toBeInTheDocument();
  });

  it('resets form after successful submission (when not editing)', async () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title \*/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const submitButton = screen.getByRole('button', { name: /Create Task/i });

    await userEvent.type(titleInput, 'New Task');
    await userEvent.type(descriptionInput, 'New Description');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });
  });

  it('does not reset form after submission when editing', async () => {
    const initialData = {
      title: 'Existing Task',
      description: 'Existing Description',
      completed: true,
    };

    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        initialData={initialData}
        isEditing={true}
      />
    );

    const titleInput = screen.getByLabelText(/Title \*/i);
    const submitButton = screen.getByRole('button', { name: /Update Task/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Existing Task',
        description: 'Existing Description',
        completed: true,
      });
    });

    // Title should remain as initial value when editing
    expect(titleInput).toHaveValue('Existing Task');
  });
});