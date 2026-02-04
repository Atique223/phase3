import { renderHook, waitFor } from '@testing-library/react';
import { useTasks } from './useTasks';
import * as api from '@/lib/api';

// Mock the API client
jest.mock('@/src/lib/api', () => ({
  apiClient: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
    getTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    toggleTaskCompletion: jest.fn(),
  },
}));

const mockApiClient = api.apiClient as jest.Mocked<typeof api.apiClient>;

describe('useTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initially has empty tasks and loading state', () => {
    const { result } = renderHook(() => useTasks());

    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches tasks successfully', async () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        userId: 'user1',
      },
    ];

    mockApiClient.getTasks.mockResolvedValue({
      tasks: mockTasks,
      total: 1,
      page: 1,
      limit: 10,
    });

    const { result } = renderHook(() => useTasks());

    // Call fetchTasks
    result.current.fetchTasks();

    // Check loading state
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.error).toBeNull();
    });

    expect(mockApiClient.getTasks).toHaveBeenCalled();
  });

  it('handles fetch tasks error', async () => {
    const mockError = new Error('Failed to fetch tasks');
    mockApiClient.getTasks.mockRejectedValue(mockError);

    const { result } = renderHook(() => useTasks());

    result.current.fetchTasks();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to fetch tasks');
    });
  });

  it('creates a new task successfully', async () => {
    const newTask = {
      id: '2',
      title: 'New Task',
      description: 'New Description',
      completed: false,
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
      userId: 'user1',
    };

    mockApiClient.createTask.mockResolvedValue(newTask);

    const { result } = renderHook(() => useTasks());

    const taskData = {
      title: 'New Task',
      description: 'New Description',
      completed: false,
    };

    result.current.createTask(taskData);

    await waitFor(() => {
      expect(mockApiClient.createTask).toHaveBeenCalledWith(
        'New Task',
        'New Description',
        false
      );
      expect(result.current.tasks).toContainEqual(newTask);
    });
  });

  it('handles create task error', async () => {
    const mockError = new Error('Failed to create task');
    mockApiClient.createTask.mockRejectedValue(mockError);

    const { result } = renderHook(() => useTasks());

    const taskData = {
      title: 'New Task',
      description: 'New Description',
      completed: false,
    };

    result.current.createTask(taskData);

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to create task');
    });
  });

  it('updates a task successfully', async () => {
    const initialTasks = [
      {
        id: '1',
        title: 'Old Title',
        description: 'Old Description',
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        userId: 'user1',
      },
    ];

    const updatedTask = {
      ...initialTasks[0],
      title: 'Updated Title',
      description: 'Updated Description',
      completed: true,
    };

    mockApiClient.getTasks.mockResolvedValue({
      tasks: initialTasks,
      total: 1,
      page: 1,
      limit: 10,
    });

    mockApiClient.updateTask.mockResolvedValue(updatedTask);

    const { result } = renderHook(() => useTasks());

    // First fetch tasks
    result.current.fetchTasks();
    await waitFor(() => {
      expect(result.current.tasks).toEqual(initialTasks);
    });

    // Update the task
    result.current.updateTask('1', {
      title: 'Updated Title',
      description: 'Updated Description',
      completed: true,
    });

    await waitFor(() => {
      expect(mockApiClient.updateTask).toHaveBeenCalledWith('1', {
        title: 'Updated Title',
        description: 'Updated Description',
        completed: true,
      });
      expect(result.current.tasks).toContainEqual(updatedTask);
    });
  });

  it('handles update task error', async () => {
    const mockError = new Error('Failed to update task');
    mockApiClient.updateTask.mockRejectedValue(mockError);

    const { result } = renderHook(() => useTasks());

    result.current.updateTask('1', {
      title: 'Updated Title',
      description: 'Updated Description',
      completed: true,
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to update task');
    });
  });

  it('deletes a task successfully', async () => {
    const initialTasks = [
      {
        id: '1',
        title: 'Task to Delete',
        description: 'Description',
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        userId: 'user1',
      },
      {
        id: '2',
        title: 'Keep This Task',
        description: 'Description',
        completed: false,
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        userId: 'user1',
      },
    ];

    mockApiClient.getTasks.mockResolvedValue({
      tasks: initialTasks,
      total: 2,
      page: 1,
      limit: 10,
    });

    mockApiClient.deleteTask.mockResolvedValue();

    const { result } = renderHook(() => useTasks());

    // First fetch tasks
    result.current.fetchTasks();
    await waitFor(() => {
      expect(result.current.tasks).toEqual(initialTasks);
    });

    // Delete the task
    result.current.deleteTask('1');

    await waitFor(() => {
      expect(mockApiClient.deleteTask).toHaveBeenCalledWith('1');
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe('2');
    });
  });

  it('handles delete task error', async () => {
    const mockError = new Error('Failed to delete task');
    mockApiClient.deleteTask.mockRejectedValue(mockError);

    const { result } = renderHook(() => useTasks());

    result.current.deleteTask('1');

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to delete task');
    });
  });

  it('toggles task completion successfully', async () => {
    const initialTasks = [
      {
        id: '1',
        title: 'Test Task',
        description: 'Description',
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        userId: 'user1',
      },
    ];

    const updatedTask = {
      ...initialTasks[0],
      completed: true,
    };

    mockApiClient.getTasks.mockResolvedValue({
      tasks: initialTasks,
      total: 1,
      page: 1,
      limit: 10,
    });

    mockApiClient.toggleTaskCompletion.mockResolvedValue(updatedTask);

    const { result } = renderHook(() => useTasks());

    // First fetch tasks
    result.current.fetchTasks();
    await waitFor(() => {
      expect(result.current.tasks).toEqual(initialTasks);
    });

    // Toggle completion
    result.current.toggleTaskCompletion('1');

    await waitFor(() => {
      expect(mockApiClient.toggleTaskCompletion).toHaveBeenCalledWith('1', true);
      expect(result.current.tasks[0].completed).toBe(true);
    });
  });

  it('handles toggle completion error', async () => {
    const mockError = new Error('Failed to toggle task completion');
    mockApiClient.toggleTaskCompletion.mockRejectedValue(mockError);

    const { result } = renderHook(() => useTasks());

    result.current.toggleTaskCompletion('1');

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to toggle task completion');
    });
  });
});