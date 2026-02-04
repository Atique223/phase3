import React from 'react';

interface AuthFormProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitButtonText: string;
  disabled?: boolean;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  children,
  onSubmit,
  submitButtonText,
  disabled = false,
  error,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            {children}
          </div>

          <div>
            <button
              type="submit"
              disabled={disabled}
              className={`btn-primary w-full py-2 px-4 ${disabled ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {disabled ? 'Processing...' : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;