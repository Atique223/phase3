"""Helper utilities for the Todo API."""

import logging
from datetime import datetime
from typing import Dict, Any


def setup_logging():
    """Set up logging configuration for the application."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler("app.log")
        ]
    )


def log_api_call(endpoint: str, method: str, user_id: str = None, status_code: int = None):
    """Log API call details."""
    logger = logging.getLogger(__name__)
    user_info = f" by user {user_id}" if user_id else ""
    status_info = f" with status {status_code}" if status_code else ""

    logger.info(f"API call to {endpoint} using {method}{user_info}{status_info}")


def format_response(data: Any) -> Dict[str, Any]:
    """Format API response with metadata."""
    return {
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
        "status": "success"
    }


def validate_task_data(title: str, description: str = None) -> bool:
    """Validate task data according to business rules."""
    if not title or len(title) > 255:
        return False

    if description and len(description) > 1000:
        return False

    return True