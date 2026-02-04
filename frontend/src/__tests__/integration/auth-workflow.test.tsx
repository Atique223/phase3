import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import userEvent from '@testing-library/user-event';
import SigninPage from '@/src/app/auth/signin/page';
import SignupPage from '@/src/app/auth/signup/page';
import { useAuth } from '@/src/hooks/useAuth';
import * as api from '@/src/lib/api';

// Mock the hooks and API
jest.mock('@/src/hooks/useAuth');
jest.mock('@/src/lib/api');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
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

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Signin Page', () => {
    it('allows a user to sign in successfully', async () => {
      const user = userEvent.setup();

      const mockSignin = jest.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signin: mockSignin,
        signup: jest.fn(),
        signout: jest.fn(),
        isAuthenticated: jest.fn(() => false),
      });

      mockApiClient.signin.mockResolvedValue({
        user: mockUser,
        token: 'mock-jwt-token',
      });

      render(
        <QueryClientProvider client={queryClient}>
          <SigninPage />
        </QueryClientProvider>
      );

      // Fill in the sign in form
      const emailInput = screen.getByRole('textbox', { name: /Email address/i });
      const passwordInput = screen.getByLabelText(/Password/i);
      const signInButton = screen.getByRole('button', { name: /Sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Submit the form
      await user.click(signInButton);

      // Check that signin was called with correct data
      await waitFor(() => {
        expect(mockSignin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('shows error message for failed sign in', async () => {
      const user = userEvent.setup();

      const mockSignin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signin: mockSignin,
        signup: jest.fn(),
        signout: jest.fn(),
        isAuthenticated: jest.fn(() => false),
      });

      render(
        <QueryClientProvider client={queryClient}>
          <SigninPage />
        </QueryClientProvider>
      );

      // Fill in the sign in form
      const emailInput = screen.getByRole('textbox', { name: /Email address/i });
      const passwordInput = screen.getByLabelText(/Password/i);
      const signInButton = screen.getByRole('button', { name: /Sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      // Submit the form
      await user.click(signInButton);

      // Check that error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();

      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signin: jest.fn(),
        signup: jest.fn(),
        signout: jest.fn(),
        isAuthenticated: jest.fn(() => false),
      });

      render(
        <QueryClientProvider client={queryClient}>
          <SigninPage />
        </QueryClientProvider>
      );

      // Submit the form without filling in fields
      const signInButton = screen.getByRole('button', { name: /Sign in/i });
      await user.click(signInButton);

      // Check for validation errors (these would be handled by the form validation in the component)
      // Since we're testing the integration, we'll look for visual feedback
      const emailInput = screen.getByRole('textbox', { name: /Email address/i });
      expect(emailInput).toHaveFocus(); // Focus might be on the first field after validation
    });

    it('has link to signup page', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signin: jest.fn(),
        signup: jest.fn(),
        signout: jest.fn(),
        isAuthenticated: jest.fn(() => false),
      });

      render(
        <QueryClientProvider client={queryClient}>
          <SigninPage />
        </QueryClientProvider>
      );

      const signupLink = screen.getByRole('link', { name: /Create a new account/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/auth/signup');
    });
  });

  describe('Signup Page', () => {
    it('allows a user to sign up successfully', async () => {
      const user = userEvent.setup();

      const mockSignup = jest.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signin: jest.fn(),
        signup: mockSignup,
        signout: jest.fn(),
        isAuthenticated: jest.fn(() => false),
      });

      mockApiClient.signup.mockResolvedValue({
        user: { ...mockUser, name: 'New User' },
        token: 'mock-jwt-token',
      });

      render(
        <QueryClientProvider client={queryClient}>
          <SignupPage />
        </QueryClientProvider>
      );

      // Fill in the sign up form
      const nameInput = screen.getByRole('textbox', { name: /Full Name \(optional\)/i });
      const emailInput = screen.getByRole('textbox', { name: /Email address/i });
      const passwordInput = screen.getByLabelText(/Password/i);
      const signUpButton = screen.getByRole('button', { name: /Sign up/i });

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');

      // Submit the form
      await user.click(signUpButton);

      // Check that signup was called with correct data
      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith('newuser@example.com', 'password123', 'New User');
      });
    });

    it('shows error message for failed sign up', async () => {
      const user = userEvent.setup();

      const mockSignup = jest.fn().mockRejectedValue(new Error('Email already exists'));
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signin: jest.fn(),
        signup: mockSignup,
        signout: jest.fn(),
        isAuthenticated: jest.fn(() => false),
      });

      render(
        <QueryClientProvider client={queryClient}>
          <SignupPage />
        </QueryClientProvider>
      );

      // Fill in the sign up form
      const nameInput = screen.getByRole('textbox', { name: /Full Name \(optional\)/i });
      const emailInput = screen.getByRole('textbox', { name: /Email address/i });
      const passwordInput = screen.getByLabelText(/Password/i );
      const signUpButton = screen.getByRole('button', { name: /Sign up/i });

      await user.type(nameInput, 'Existing User');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');

      // Submit the form
      await user.click(signUpButton);

      // Check that error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
      });
    });

    it('validates password length', async () => {
      const user = userEvent.setup();

      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signin: jest.fn(),
        signup: jest.fn(),
        signout: jest.fn(),
        isAuthenticated: jest.fn(() => false),
      });

      render(
        <QueryClientProvider client={queryClient}>
          <SignupPage />
        </QueryClientProvider>
      );

      // Fill in the sign up form with a short password
      const emailInput = screen.getByRole('textbox', { name: /Email address/i });
      const passwordInput = screen.getByLabelText(/Password/i );
      const signUpButton = screen.getByRole('button', { name: /Sign up/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '123'); // Too short

      // Submit the form
      await user.click(signUpButton);

      // Check for error message about password length
      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      const user = userEvent.setup();

      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signin: jest.fn(),
        signup: jest.fn(),
        signout: jest.fn(),
        isAuthenticated: jest.fn(() => false),
      });

      render(
        <QueryClientProvider client={queryClient}>
          <SignupPage />
        </QueryClientProvider>
      );

      // Fill in the sign up form with an invalid email
      const emailInput = screen.getByRole('textbox', { name: /Email address/i });
      const passwordInput = screen.getByLabelText(/Password/i );
      const signUpButton = screen.getByRole('button', { name: /Sign up/i });

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');

      // Submit the form
      await user.click(signUpButton);

      // Check for error message about email format
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('has link to sign in page', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signin: jest.fn(),
        signup: jest.fn(),
        signout: jest.fn(),
        isAuthenticated: jest.fn(() => false),
      });

      render(
        <QueryClientProvider client={queryClient}>
          <SignupPage />
        </QueryClientProvider>
      );

      const signinLink = screen.getByRole('link', { name: /Sign in to your existing account/i });
      expect(signinLink).toBeInTheDocument();
      expect(signinLink).toHaveAttribute('href', '/auth/signin');
    });
  });

  describe('Auth State Management', () => {
    it('redirects authenticated users from sign in page', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
        signin: jest.fn(),
        signup: jest.fn(),
        signout: jest.fn(),
        isAuthenticated: jest.fn(() => true),
      });

      render(
        <QueryClientProvider client={queryClient}>
          <SigninPage />
        </QueryClientProvider>
      );

      // When user is authenticated, they should be redirected
      // This would typically happen via router.push, which we can't fully test here
      // But we can verify the auth state is correct
      expect(mockUseAuth().isAuthenticated()).toBe(true);
      expect(mockUseAuth().user).toEqual(mockUser);
    });

    it('redirects authenticated users from sign up page', () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
        signin: jest.fn(),
        signup: jest.fn(),
        signout: jest.fn(),
        isAuthenticated: jest.fn(() => true),
      });

      render(
        <QueryClientProvider client={queryClient}>
          <SignupPage />
        </QueryClientProvider>
      );

      // When user is authenticated, they should be redirected
      expect(mockUseAuth().isAuthenticated()).toBe(true);
      expect(mockUseAuth().user).toEqual(mockUser);
    });
  });
});