import logging
import sys
from app.core.config import settings

# Create a custom logger
logger = logging.getLogger("fastapi_app")

# Set level (DEBUG for dev, INFO for prod)
logger.setLevel(logging.DEBUG)

# Create a handler that writes to the console (Standard Output)
handler = logging.StreamHandler(sys.stdout)

# Define the format (JSON-like structure is best for Cloud)
# DevOps Tip: "correlation_id" allows you to trace one user request across multiple services
formatter = logging.Formatter(
    fmt='%(asctime)s | %(levelname)s | %(module)s:%(funcName)s:%(lineno)d | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

handler.setFormatter(formatter)
logger.addHandler(handler)

# Prevent duplicate logs from uvicorn
logger.propagate = False