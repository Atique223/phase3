import { useState, useCallback } from 'react';
import { apiClient, TaskResponse } from '@/lib/api';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/lib/types';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

/**
 * Helper function to convert TaskResponse (API format with string dates)
 * to Task (application format with Date objects)
 */
const convertTaskResponseToTask = (taskResponse: TaskResponse): Task => {
  return {
    ...taskResponse,
    createdAt: new Date(taskResponse.createdAt),
    updatedAt: new Date(taskResponse.updatedAt),
  };
};

export const useTasks = () => {
  const [state, setState] = useState<TasksState>({
    tasks: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    limit: 10,
  });

  // Fetch tasks from the API
  const fetchTasks = useCallback(async (params?: { page?: number; limit?: number; completed?: boolean }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.getTasks(params);

      // Backend returns TaskListResponse with tasks array
      const tasksArray = Array.isArray(response) ? response : response.tasks || [];
      
      // Convert TaskResponse objects to Task objects
      const convertedTasks = tasksArray.map(convertTaskResponseToTask);

      setState({
        tasks: convertedTasks,
        loading: false,
        error: null,
        total: convertedTasks.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch tasks',
      }));
    }
  }, []);

  // Create a new task
  const createTask = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const newTaskResponse = await apiClient.createTask(input.title, input.description, input.completed);
      const newTask = convertTaskResponseToTask(newTaskResponse);

      // Optimistically update the state
      setState(prev => ({
        ...prev,
        loading: false,
        tasks: [newTask, ...prev.tasks],
        total: prev.total + 1,
      }));

      return newTask;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to create task',
      }));
      throw error;
    }
  }, []);

  // Update an existing task
  const updateTask = useCallback(async (id: string, input: UpdateTaskInput): Promise<Task> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const updatedTaskResponse = await apiClient.updateTask(id, input);
      const updatedTask = convertTaskResponseToTask(updatedTaskResponse);

      // Optimistically update the state
      setState(prev => ({
        ...prev,
        loading: false,
        tasks: prev.tasks.map(task =>
          task.id === id ? updatedTask : task
        ),
      }));

      return updatedTask;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update task',
      }));
      throw error;
    }
  }, []);

  // Delete a task
  const deleteTask = useCallback(async (id: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await apiClient.deleteTask(id);

      // Optimistically update the state
      setState(prev => ({
        ...prev,
        loading: false,
        tasks: prev.tasks.filter(task => task.id !== id),
        total: prev.total - 1,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to delete task',
      }));
      throw error;
    }
  }, []);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (id: string): Promise<Task> => {
    const task = state.tasks.find(t => t.id === id);
    if (!task) {
      throw new Error('Task not found');
    }

    const newCompletedStatus = !task.completed;

    // Optimistically update the state
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === id ? { ...t, completed: newCompletedStatus } : t
      ),
    }));

    try {
      const updatedTaskResponse = await apiClient.toggleTaskCompletion(id, newCompletedStatus);
      const updatedTask = convertTaskResponseToTask(updatedTaskResponse);

      // Update with server response
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === id ? updatedTask : t
        ),
      }));

      return updatedTask;
    } catch (error: any) {
      // Revert optimistic update if API call fails
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === id ? { ...t, completed: task.completed } : t
        ),
        error: error.message || 'Failed to update task completion',
      }));
      throw error;
    }
  }, [state.tasks]);

  return {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    total: state.total,
    page: state.page,
    limit: state.limit,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  };
};
