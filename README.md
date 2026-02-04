# Phase 3 - Full-Stack Task Management & AI Chat Application

A modern full-stack application featuring task management and AI-powered chat capabilities, built with Next.js and FastAPI.

## 🚀 Live Deployments

- **Frontend**: [https://frontend-chi-five-58.vercel.app](https://frontend-chi-five-58.vercel.app)
- **Backend API**: [https://ebad122-phase3.hf.space](https://ebad122-phase3.hf.space)

## ✨ Features

- **User Authentication**: Secure JWT-based authentication with signup/signin
- **Task Management**: Create, read, update, and delete tasks with status tracking
- **AI Chat Assistant**: Integrated OpenAI GPT-4o-mini powered chat interface
- **Real-time Updates**: Optimistic UI updates with SWR for data fetching
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dashboard Analytics**: Task statistics and progress tracking

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2.35 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + SWR
- **Authentication**: JWT tokens with localStorage
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: SQLite with SQLModel ORM
- **Authentication**: JWT (PyJWT)
- **AI Integration**: OpenAI GPT-4o-mini
- **Deployment**: HuggingFace Spaces

## 📁 Project Structure

```
phase3/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── dashboard/   # Dashboard page
│   │   │   ├── signin/      # Sign in page
│   │   │   └── signup/      # Sign up page
│   │   ├── components/      # React components
│   │   │   ├── chat/        # Chat interface
│   │   │   └── tasks/       # Task components
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # FastAPI backend application
│   ├── main.py             # Main application entry
│   ├── models.py           # SQLModel database models
│   ├── auth.py             # Authentication logic
│   ├── database.py         # Database configuration
│   └── requirements.txt    # Python dependencies
│
├── specs/                   # Project specifications
│   └── phase3/
│       ├── spec.md         # Feature specifications
│       ├── plan.md         # Architecture plan
│       └── tasks.md        # Implementation tasks
│
└── .specify/               # SpecKit Plus configuration
    ├── memory/
    │   └── constitution.md # Project principles
    └── templates/          # Document templates
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.11+
- OpenAI API key

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-here
BETTER_AUTH_SECRET=your-better-auth-secret
BETTER_AUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file:
```env
JWT_SECRET=your-jwt-secret-here
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=sqlite:///./main.db
```

5. Run the development server:
```bash
uvicorn main:app --reload --port 8000
```

The backend API will be available at [http://localhost:8000](http://localhost:8000)

## 🔑 Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `https://ebad122-phase3.hf.space` |
| `NEXT_PUBLIC_JWT_SECRET` | JWT secret for token validation | `your-jwt-secret-here` |
| `BETTER_AUTH_SECRET` | Better Auth secret key | `your-better-auth-secret` |
| `BETTER_AUTH_URL` | Better Auth URL | `http://localhost:3000` |

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | JWT secret for token generation | `your-jwt-secret-here` |
| `OPENAI_API_KEY` | OpenAI API key for chat | `sk-proj-...` |
| `DATABASE_URL` | Database connection string | `sqlite:///./main.db` |

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/signup` - Create a new user account
- `POST /api/signin` - Sign in and receive JWT token

### Task Endpoints

- `GET /api/users/{user_id}/tasks` - Get all tasks for a user
- `POST /api/users/{user_id}/tasks` - Create a new task
- `GET /api/tasks/{task_id}` - Get a specific task
- `PUT /api/tasks/{task_id}` - Update a task
- `DELETE /api/tasks/{task_id}` - Delete a task

### Chat Endpoints

- `POST /api/users/{user_id}/chat` - Send a message to AI assistant
- `GET /api/users/{user_id}/conversations` - Get user's chat history

## 🧪 Test Account

For testing purposes, you can use:
- **Email**: testuser@example.com
- **Password**: Test123456

## 🚀 Deployment

### Frontend (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd frontend
vercel --prod
```

3. Set environment variables in Vercel dashboard or CLI:
```bash
vercel env add NEXT_PUBLIC_API_BASE_URL production
vercel env add BETTER_AUTH_URL production
vercel env add BETTER_AUTH_SECRET production
vercel env add NEXT_PUBLIC_JWT_SECRET production
```

### Backend (HuggingFace Spaces)

1. Create a new Space on HuggingFace
2. Connect your GitHub repository
3. Set environment variables in Space settings
4. Deploy automatically on push to main branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Workflow

This project follows Spec-Driven Development (SDD) principles:

1. **Specification** (`specs/phase3/spec.md`) - Feature requirements
2. **Planning** (`specs/phase3/plan.md`) - Architecture decisions
3. **Tasks** (`specs/phase3/tasks.md`) - Implementation checklist
4. **Prompt History** (`history/prompts/`) - Development records

## 🔒 Security

- JWT tokens for authentication
- Password hashing with secure algorithms
- Environment variables for sensitive data
- CORS configuration for API security
- Input validation on all endpoints

## 📄 License

This project is part of Quarter 4 Agentic AI coursework.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [FastAPI](https://fastapi.tiangolo.com/)
- AI capabilities by [OpenAI](https://openai.com/)
- Deployed on [Vercel](https://vercel.com/) and [HuggingFace](https://huggingface.co/)

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>**
