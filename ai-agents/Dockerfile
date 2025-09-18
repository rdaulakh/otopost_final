FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create logs and data directories
RUN mkdir -p logs data

# Expose port
EXPOSE 8002

# Health check
HEALTHCHECK --interval=60s --timeout=15s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8002/health || exit 1

# Start the application
CMD ["python", "main.py"]

