import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/auth/AuthProvider';
import React from 'react';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Todo App - Manage Your Tasks',
    template: '%s | Todo App'
  },
  description: 'A clean, responsive todo application with authentication. Organize your tasks, set priorities, and boost your productivity.',
  keywords: ['todo', 'task management', 'productivity', 'tasks', 'organizer', 'authentication'],
  authors: [{ name: 'Todo App Team' }],
  creator: 'Todo App Team',
  publisher: 'Todo App Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-todo-app.com'), // Replace with actual domain
  openGraph: {
    type: 'website',
    title: 'Todo App - Manage Your Tasks',
    description: 'A clean, responsive todo application with authentication. Organize your tasks, set priorities, and boost your productivity.',
    url: 'https://your-todo-app.com', // Replace with actual domain
    siteName: 'Todo App',
    images: [
      {
        url: '/og-image.jpg', // Replace with actual og image
        width: 1200,
        height: 630,
        alt: 'Todo App - Manage Your Tasks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Todo App - Manage Your Tasks',
    description: 'A clean, responsive todo application with authentication. Organize your tasks, set priorities, and boost your productivity.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code
    yahoo: 'yahoo-site-verification-code',   // Replace with actual verification code
    other: {
      me: ['your-email@example.com'], // Replace with actual email
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="sr-only">
              <h1>Todo App - Manage Your Tasks</h1>
              <p>Your personal task management application</p>
            </header>

            {/* Main content area */}
            <main className="container mx-auto py-6" id="main-content">
              {children}
            </main>

            <footer className="sr-only">
              <p>&copy; {new Date().getFullYear()} Todo App. All rights reserved.</p>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}