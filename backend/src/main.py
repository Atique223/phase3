"""Main FastAPI application for Todo API with JWT Authentication."""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config.settings import settings
from .api.v1.tasks import router as tasks_router
from .api.v1.auth import router as auth_router
from .api.v1.chat import router as chat_router
from .mcp.server import mcp_server
from .models.database import create_db_and_tables
from .utils.helpers import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler to initialize database tables on startup.

    Args:
        app: FastAPI application instance
    """
    # Set up logging
    setup_logging()

    print("Creating database tables...")
    create_db_and_tables()
    print("Database tables created.")

    # Initialize MCP server
    print(f"MCP server initialized with {len(mcp_server.tools)} tools")

    yield
    print("Shutting down...")


# Create FastAPI app with lifespan event handler
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="A secure Todo API with JWT authentication",
    lifespan=lifespan
)


# Add CORS middleware for Next.js frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {"message": "Welcome to Todo API with JWT Authentication"}


@app.get("/health")
async def health_check():
    """Health check endpoint with MCP server status validation."""
    # T050: Validate MCP server status
    mcp_status = {
        "initialized": len(mcp_server.tools) > 0,
        "tool_count": len(mcp_server.tools),
        "tools": list(mcp_server.tools.keys())
    }

    # Overall health status
    is_healthy = mcp_status["initialized"]

    return {
        "status": "healthy" if is_healthy else "degraded",
        "version": "1.0.0",
        "mcp_server": mcp_status
    }


# Include API routers - the user_id will be handled in the individual route paths
app.include_router(tasks_router, prefix=settings.API_V1_STR, tags=["tasks"])
app.include_router(auth_router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(chat_router, prefix=settings.API_V1_STR, tags=["chat"])


# Global exception handlers removed - let endpoints handle their own error messages
# The global handlers were overriding specific error messages from endpoints


@app.exception_handler(403)
async def forbidden_exception_handler(request, exc):
    """Handle forbidden access globally."""
    return JSONResponse(
        status_code=403,
        content={"detail": "Forbidden - Access denied to requested resource"}
    )


@app.exception_handler(404)
async def not_found_exception_handler(request, exc):
    """Handle not found globally."""
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)