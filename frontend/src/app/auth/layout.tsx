import AuthNavigation from '@/components/auth/AuthNavigation';

export const metadata = {
  title: 'Authentication',
  description: 'Sign in or sign up to access your todo list',
}

/**
 * Auth Layout Component
 *
 * This layout wraps all authentication pages (/auth/signin, /auth/signup).
 * It provides the AuthNavigation component for consistent navigation.
 *
 * Server Component: No client-side interactivity needed at layout level
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AuthNavigation />
      {children}
    </>
  )
}
