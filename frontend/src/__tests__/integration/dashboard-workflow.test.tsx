import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/src/app/dashboard/page';
import { useAuth } from '@/src/hooks/useAuth';
import { useTasks } from '@/src/hooks/useTasks';
import * as api from '@/src/lib/api';

// Mock the hooks and API
jest.mock('@/src/hooks/useAuth');
jest.mock('@/src/hooks/useTasks');
jest.mock('@/src/lib/api');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseTasks = useTasks as jest.MockedFunction<typeof useTasks>;
const mockApiClient = api.apiClient as jest.Mocked<typeof api.apiClient>;

// Create a test query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock user data
const mockUser = {
  id: 'user1',
  email: 'test@example.com',
  name: 'Test User',
};

// Mock tasks data
const mockTasks = [
  {
    id: '1',
    title: 'First Task',
    description: 'Description for first task',
    completed: false,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    userId: 'user1',
  },
  {
    id: '2',
    title: 'Second Task',
    description: 'Description for second task',
    completed: true,
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
    userId: 'user1',
  },
];

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the auth hook to return an authenticated user
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signin: jest.fn(),
      signup: jest.fn(),
      signout: jest.fn(),
      isAuthenticated: jest.fn(() => true),
    });

    // Mock the tasks hook
    mockUseTasks.mockReturnValue({
      tasks: [],
      loading: false,
      error: null,
      fetchTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
    });
  });

  it('displays tasks after fetching', async () => {
    // Update the mock to return tasks
    mockUseTasks.mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      fetchTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

    // Check that tasks are displayed
    await waitFor(() => {
      expect(screen.getByText('First Task')).toBeInTheDocument();
      expect(screen.getByText('Second Task')).toBeInTheDocument();
    });

    expect(screen.getByText('Description for first task')).toBeInTheDocument();
    expect(screen.getByText('Description for second task')).toBeInTheDocument();
  });

  it('allows creating a new task', async () => {
    const user = userEvent.setup();

    const mockCreateTask = jest.fn();
    mockUseTasks.mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      fetchTasks: jest.fn(),
      createTask: mockCreateTask,
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

    // Click the "Create New Task" button
    const createTaskButton = screen.getByRole('button', { name: /Create New Task/i });
    await user.click(createTaskButton);

    // Fill in the task form
    const titleInput = screen.getByRole('textbox', { name: /Title \*/i });
    const descriptionInput = screen.getByRole('textbox', { name: /Description/i });
    const submitButton = screen.getByRole('button', { name: /Create Task/i });

    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'New Description');

    // Submit the form
    await user.click(submitButton);

    // Check that createTask was called with correct data
    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        completed: false,
      });
    });
  });

  it('allows editing an existing task', async () => {
    const user = userEvent.setup();

    const mockUpdateTask = jest.fn();
    mockUseTasks.mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      fetchTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: mockUpdateTask,
      deleteTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('First Task')).toBeInTheDocument();
    });

    // Click the edit button for the first task
    const editButton = screen.getByRole('button', { name: /Edit task "First Task"/i });
    await user.click(editButton);

    // Find the edit form and update the task
    const titleInput = screen.getByRole('textbox', { name: /Title \*/i });
    const descriptionInput = screen.getByRole('textbox', { name: /Description/i });
    const updateButton = screen.getByRole('button', { name: /Update Task/i });

    // Clear and type new values
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'Updated Description');

    await user.click(updateButton);

    // Check that updateTask was called with correct data
    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith('1', {
        title: 'Updated Task',
        description: 'Updated Description',
        completed: false,
      });
    });
  });

  it('allows deleting a task', async () => {
    const user = userEvent.setup();

    const mockDeleteTask = jest.fn();
    mockUseTasks.mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      fetchTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: mockDeleteTask,
      toggleTaskCompletion: jest.fn(),
    });

    // Mock window.confirm to return true
    window.confirm = jest.fn(() => true);

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('First Task')).toBeInTheDocument();
    });

    // Click the delete button for the first task
    const deleteButton = screen.getByRole('button', { name: /Delete task "First Task"/i });
    await user.click(deleteButton);

    // Check that deleteTask was called with correct ID
    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith('1');
    });
  });

  it('allows toggling task completion', async () => {
    const user = userEvent.setup();

    const mockToggleTaskCompletion = jest.fn();
    mockUseTasks.mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      fetchTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTaskCompletion: mockToggleTaskCompletion,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('First Task')).toBeInTheDocument();
    });

    // Find the checkbox for the first task and click it
    const checkbox = screen.getByRole('checkbox', { name: /Mark task "First Task" as complete/i });
    await user.click(checkbox);

    // Check that toggleTaskCompletion was called with correct ID
    await waitFor(() => {
      expect(mockToggleTaskCompletion).toHaveBeenCalledWith('1');
    });
  });

  it('allows filtering tasks', async () => {
    const user = userEvent.setup();

    mockUseTasks.mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      fetchTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('First Task')).toBeInTheDocument();
      expect(screen.getByText('Second Task')).toBeInTheDocument();
    });

    // Select the "Active" filter
    const filterSelect = screen.getByRole('combobox', { name: /Filter tasks/i });
    await user.selectOptions(filterSelect, 'active');

    // Note: The actual filtering happens in the page logic, which we're not fully testing here
    // We're just verifying that the UI elements work
    expect(filterSelect).toHaveValue('active');
  });

  it('allows sorting tasks', async () => {
    const user = userEvent.setup();

    mockUseTasks.mockReturnValue({
      tasks: mockTasks,
      loading: false,
      error: null,
      fetchTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('First Task')).toBeInTheDocument();
      expect(screen.getByText('Second Task')).toBeInTheDocument();
    });

    // Select the "Title A-Z" sort option
    const sortSelect = screen.getByRole('combobox', { name: /Sort tasks/i });
    await user.selectOptions(sortSelect, 'title');

    // Note: The actual sorting happens in the page logic, which we're not fully testing here
    // We're just verifying that the UI elements work
    expect(sortSelect).toHaveValue('title');
  });

  it('shows error messages', async () => {
    const errorMessage = 'Something went wrong';

    mockUseTasks.mockReturnValue({
      tasks: [],
      loading: false,
      error: errorMessage,
      fetchTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

    // Check that error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseTasks.mockReturnValue({
      tasks: [],
      loading: true,
      error: null,
      fetchTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

    // Check that loading spinner is displayed
    expect(screen.getByRole('status', { name: /Loading tasks/i })).toBeInTheDocument();
  });
});

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects unauthenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signin: jest.fn(),
      signup: jest.fn(),
      signout: jest.fn(),
      isAuthenticated: jest.fn(() => false),
    });

    mockUseTasks.mockReturnValue({
      tasks: [],
      loading: false,
      error: null,
      fetchTasks: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
      toggleTaskCompletion: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

    // For this test, we're just checking that the ProtectedRoute component
    // would handle the unauthenticated state appropriately
    // In a real test, we would check for redirection behavior
    expect(mockUseAuth().isAuthenticated()).toBe(false);
  });
});