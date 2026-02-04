import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as api from '@/src/lib/api';
import * as authUtils from '@/src/lib/auth';

// Mock the API client and auth utilities
jest.mock('@/src/lib/api', () => ({
  apiClient: {
    signin: jest.fn(),
    signup: jest.fn(),
    signout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

jest.mock('@/src/lib/auth', () => ({
  getAuthCookie: jest.fn(),
  setAuthCookie: jest.fn(),
  removeAuthCookie: jest.fn(),
  decodeToken: jest.fn(),
  isTokenExpired: jest.fn(),
}));

const mockApiClient = api.apiClient as jest.Mocked<typeof api.apiClient>;
const mockAuthUtils = authUtils as jest.Mocked<typeof authUtils>;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initially has no user and loading state', () => {
    mockAuthUtils.getAuthCookie.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('loads user from token if available', async () => {
    const mockToken = 'mock-jwt-token';
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
    };

    mockAuthUtils.getAuthCookie.mockReturnValue(mockToken);
    mockAuthUtils.decodeToken.mockReturnValue({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
      exp: Date.now() / 1000 + 3600, // Token expires in 1 hour
    });
    mockAuthUtils.isTokenExpired.mockReturnValue(false);
    mockApiClient.getCurrentUser.mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.getCurrentUser).toHaveBeenCalled();
  });

  it('handles token expiration', async () => {
    const mockToken = 'expired-jwt-token';

    mockAuthUtils.getAuthCookie.mockReturnValue(mockToken);
    mockAuthUtils.decodeToken.mockReturnValue({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
      exp: Date.now() / 1000 - 3600, // Token expired 1 hour ago
    });
    mockAuthUtils.isTokenExpired.mockReturnValue(true);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    // Token should be removed due to expiration
    expect(mockAuthUtils.removeAuthCookie).toHaveBeenCalled();
  });

  it('signs in successfully', async () => {
    const mockResponse = {
      user: {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
      },
      token: 'new-jwt-token',
    };

    mockAuthUtils.getAuthCookie.mockReturnValue(null);
    mockApiClient.signin.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth());

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Perform sign in
    result.current.signin('test@example.com', 'password123');

    await waitFor(() => {
      expect(mockApiClient.signin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockAuthUtils.setAuthCookie).toHaveBeenCalledWith('new-jwt-token');
      expect(result.current.user).toEqual(mockResponse.user);
    });
  });

  it('handles sign in error', async () => {
    const mockError = new Error('Invalid credentials');
    mockApiClient.signin.mockRejectedValue(mockError);
    mockAuthUtils.getAuthCookie.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Perform sign in
    result.current.signin('test@example.com', 'wrongpassword');

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid credentials');
    });
  });

  it('signs up successfully', async () => {
    const mockResponse = {
      user: {
        id: 'user2',
        email: 'newuser@example.com',
        name: 'New User',
      },
      token: 'new-jwt-token',
    };

    mockAuthUtils.getAuthCookie.mockReturnValue(null);
    mockApiClient.signup.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth());

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Perform sign up
    result.current.signup('newuser@example.com', 'password123', 'New User');

    await waitFor(() => {
      expect(mockApiClient.signup).toHaveBeenCalledWith('newuser@example.com', 'password123', 'New User');
      expect(mockAuthUtils.setAuthCookie).toHaveBeenCalledWith('new-jwt-token');
      expect(result.current.user).toEqual(mockResponse.user);
    });
  });

  it('handles sign up error', async () => {
    const mockError = new Error('Email already exists');
    mockApiClient.signup.mockRejectedValue(mockError);
    mockAuthUtils.getAuthCookie.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Perform sign up
    result.current.signup('existing@example.com', 'password123', 'Existing User');

    await waitFor(() => {
      expect(result.current.error).toBe('Email already exists');
    });
  });

  it('signs out successfully', async () => {
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
    };

    mockAuthUtils.getAuthCookie.mockReturnValue('valid-token');
    mockAuthUtils.decodeToken.mockReturnValue({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
      exp: Date.now() / 1000 + 3600,
    });
    mockAuthUtils.isTokenExpired.mockReturnValue(false);
    mockApiClient.getCurrentUser.mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth());

    // Wait for user to be loaded
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Perform sign out
    result.current.signout();

    await waitFor(() => {
      expect(mockApiClient.signout).toHaveBeenCalled();
      expect(mockAuthUtils.removeAuthCookie).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });
  });

  it('handles sign out error', async () => {
    const mockError = new Error('Sign out failed');
    mockApiClient.signout.mockRejectedValue(mockError);

    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
    };

    mockAuthUtils.getAuthCookie.mockReturnValue('valid-token');
    mockAuthUtils.decodeToken.mockReturnValue({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
      exp: Date.now() / 1000 + 3600,
    });
    mockAuthUtils.isTokenExpired.mockReturnValue(false);
    mockApiClient.getCurrentUser.mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth());

    // Wait for user to be loaded
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Perform sign out
    result.current.signout();

    await waitFor(() => {
      expect(result.current.error).toBe('Sign out failed');
      // Even with API error, local auth state should still be cleared
      expect(mockAuthUtils.removeAuthCookie).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });
  });

  it('checks if user is authenticated', async () => {
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
    };

    mockAuthUtils.getAuthCookie.mockReturnValue('valid-token');
    mockAuthUtils.decodeToken.mockReturnValue({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
      exp: Date.now() / 1000 + 3600,
    });
    mockAuthUtils.isTokenExpired.mockReturnValue(false);
    mockApiClient.getCurrentUser.mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated()).toBe(true);
  });

  it('returns false for isAuthenticated when no user', () => {
    mockAuthUtils.getAuthCookie.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    // Initially loading, but when loaded there will be no user
    expect(result.current.isAuthenticated()).toBe(false);
  });
});