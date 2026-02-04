# Todo Frontend - Quick Start Guide

This guide will help you quickly set up and run the Todo Frontend application.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

To run the application in development mode with hot reloading:

```bash
npm run dev
```

The application will be available at `http://localhost:4000` (the server will automatically find an available port if 3000 is in use).

### Production Build

To build the application for production:

```bash
npm run build
```

To run the production build locally:

```bash
npm start
```

## Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Replace `http://localhost:8000/api/v1` with your actual backend API URL.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # Reusable React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and API client
│   ├── styles/         # Global styles
│   └── __tests__/      # Test files
├── package.json        # Dependencies and scripts
└── next.config.js      # Next.js configuration
```

## Features

- **Authentication**: Secure JWT-based authentication with signup/signin
- **Task Management**: Full CRUD operations for tasks
- **Responsive Design**: Mobile-first responsive UI
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Optimistic updates and loading indicators
- **Accessibility**: ARIA attributes and keyboard navigation support

## API Integration

The application integrates with a JWT-protected backend API. All API calls include proper authentication headers and error handling.

## Development Guidelines

- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling with consistent design tokens
- Implement proper error handling and loading states
- Write tests for components and hooks
- Follow accessibility best practices
