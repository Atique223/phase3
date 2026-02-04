import sys
import os

# Add the current directory to the Python path so we can import backend
current_dir = os.path.dirname(os.path.abspath(__file__))  # Get the directory of this script
sys.path.insert(0, current_dir)

# Now import and run the app
from backend.src.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)