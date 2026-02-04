import { render, screen, fireEvent } from '@testing-library/react';
import { Task } from '@/lib/types';
import TaskItem from './TaskItem';

// Mock the task data
const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  userId: 'user1',
};

const mockOnToggleCompletion = jest.fn();
const mockOnDelete = jest.fn();
const mockOnEdit = jest.fn();

describe('TaskItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task title and description', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders task creation date', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Created: 1/1/2023')).toBeInTheDocument();
  });

  it('calls onToggleCompletion when checkbox is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockOnToggleCompletion).toHaveBeenCalledWith('1');
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit task "Test Task"/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', () => {
    // Mock window.confirm to return true
    window.confirm = jest.fn(() => true);

    render(
      <TaskItem
        task={mockTask}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /Delete task "Test Task"/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('displays line-through text when task is completed', () => {
    const completedTask = { ...mockTask, completed: true };

    render(
      <TaskItem
        task={completedTask}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const titleElement = screen.getByText('Test Task');
    expect(titleElement).toHaveClass('line-through');
  });

  it('shows different styling for completed tasks', () => {
    const completedTask = { ...mockTask, completed: true };

    render(
      <TaskItem
        task={completedTask}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const taskItem = screen.getByRole('listitem');
    expect(taskItem).toHaveClass('completed');
  });

  it('has correct accessibility attributes', () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleCompletion={mockOnToggleCompletion}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const taskItem = screen.getByRole('listitem');
    expect(taskItem).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Mark task "Test Task" as complete');
  });
});