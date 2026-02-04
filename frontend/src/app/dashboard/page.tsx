'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import AuthNavigation from '@/components/auth/AuthNavigation';
import { Task, CreateTaskInput } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ChatInterface from '@/components/chat/ChatInterface';

// Lazy load heavy components to improve initial page load
const TaskList = lazy(() => import('@/components/tasks/TaskList'));
const TaskForm = lazy(() => import('@/components/tasks/TaskForm'));
const TaskEdit = lazy(() => import('@/components/tasks/TaskEdit'));

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    tasks,
    loading: tasksLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [view, setView] = useState<'tasks' | 'chat'>('tasks');

  // Fetch tasks when component mounts
  useEffect(() => {
    if (!authLoading && user) {
      fetchTasks();
    }
  }, [authLoading, user, fetchTasks]);

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else { // 'title'
      return a.title.localeCompare(b.title);
    }
  });

  const handleCreateTask = async (taskData: CreateTaskInput) => {
    try {
      await createTask(taskData);
      setShowForm(false);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        completed: updatedTask.completed
      });
      setEditingTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleCompletion = async (id: string) => {
    try {
      await toggleTaskCompletion(id);
    } catch (err) {
      console.error('Error toggling task completion:', err);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
  };

  const cancelEditing = () => {
    setEditingTask(null);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = totalTasks - completedTasks;

  return (
    <ProtectedRoute>
      <AuthNavigation currentPage="dashboard" />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                  My Tasks
                </h1>
                <p className="text-gray-600 text-lg">Manage and organize your daily tasks</p>
              </div>

              {/* View Toggle */}
              <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-soft border-2 border-gray-100">
                <button
                  onClick={() => setView('tasks')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                    view === 'tasks'
                      ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Tasks</span>
                  </div>
                </button>
                <button
                  onClick={() => setView('chat')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                    view === 'chat'
                      ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>AI Chat</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Chat View */}
          {view === 'chat' && (
            <div className="animate-fade-in">
              <ChatInterface />
            </div>
          )}

          {/* Tasks View */}
          {view === 'tasks' && (
            <div className="animate-fade-in">
              {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-gray-100 p-6 hover:shadow-medium transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalTasks}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-gray-100 p-6 hover:shadow-medium transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active</p>
                  <p className="text-3xl font-bold text-accent-600 mt-1">{activeTasks}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-gray-100 p-6 hover:shadow-medium transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{completedTasks}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-gray-100 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Filters and Sort */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <label htmlFor="filter" className="block text-sm font-bold text-gray-900 mb-2">Filter</label>
                  <select
                    id="filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-300 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 bg-white"
                    aria-label="Filter tasks"
                  >
                    <option value="all">All Tasks</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label htmlFor="sort" className="block text-sm font-bold text-gray-900 mb-2">Sort by</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-300 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 bg-white"
                    aria-label="Sort tasks"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title A-Z</option>
                  </select>
                </div>
              </div>

              {/* Create Task Button */}
              <div className="lg:ml-4">
                <label className="block text-sm font-bold text-gray-900 mb-2 opacity-0 pointer-events-none lg:block hidden">Action</label>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="w-full lg:w-auto px-6 py-3 text-base font-bold text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-glow whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  aria-expanded={showForm}
                >
                  {showForm ? '✕ Cancel' : '+ Create New Task'}
                </button>
              </div>
            </div>
          </div>

          {/* Create Task Form */}
          {showForm && !editingTask && (
            <div className="mb-6 animate-slide-down" role="region" aria-labelledby="create-task-heading">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-gray-100 p-6">
                <h2 id="create-task-heading" className="text-xl font-bold text-gray-900 mb-4">Create New Task</h2>
                <Suspense fallback={<div className="p-4"><LoadingSpinner size="md" /></div>}>
                  <TaskForm
                    onSubmit={handleCreateTask}
                    onCancel={() => setShowForm(false)}
                  />
                </Suspense>
              </div>
            </div>
          )}

          {/* Edit Task Form */}
          {editingTask && (
            <div className="mb-6 animate-slide-down" role="region" aria-labelledby="edit-task-heading">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border-2 border-primary-200 p-6">
                <h2 id="edit-task-heading" className="text-xl font-bold text-gray-900 mb-4">Edit Task</h2>
                <Suspense fallback={<div className="p-4"><LoadingSpinner size="md" /></div>}>
                  <TaskEdit
                    task={editingTask}
                    onSave={handleUpdateTask}
                    onCancel={cancelEditing}
                  />
                </Suspense>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-800 rounded-xl animate-slide-down"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Task List */}
          <div role="region" aria-labelledby="task-list-heading">
            <h2 id="task-list-heading" className="sr-only">Task List</h2>
            <Suspense fallback={<div className="flex justify-center items-center py-10"><LoadingSpinner size="lg" /></div>}>
              <TaskList
                tasks={sortedTasks}
                loading={tasksLoading}
                error={error}
                onToggleCompletion={handleToggleCompletion}
                onDelete={handleDeleteTask}
                onEdit={startEditing}
              />
            </Suspense>
          </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}