# Quickstart: Todo Frontend UI

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Access to the JWT-protected backend API

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Set up environment variables**
   Create a `.env.local` file in the frontend directory with the following:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open the application**
   Visit `http://localhost:3000` in your browser

## Key Features

- **Authentication**: Sign up, sign in, and sign out functionality using Better Auth
- **Task Management**: Create, read, update, delete, and toggle completion status of tasks
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Loading States**: Visual feedback during API operations
- **Error Handling**: Clear error messages when operations fail
- **Empty States**: Guidance when no tasks exist

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages and layouts
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and API client
│   ├── hooks/               # Custom React hooks
│   └── styles/              # Global styles and Tailwind configuration
├── public/                  # Static assets
└── tests/                   # Test files
```

## API Integration

The frontend communicates with the backend API through a centralized client at `/lib/api.ts` that:
- Attaches JWT tokens to all authenticated requests
- Handles API errors appropriately
- Provides consistent request/response formatting

## Development

- Use Server Components by default for better performance
- Use Client Components only where interactivity is required (using 'use client' directive)
- Follow the component architecture with auth, tasks, and UI components separated
- Utilize custom hooks for authentication and task management state