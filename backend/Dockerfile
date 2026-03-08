# Dockerfile for Google Cloud Run deployment
# Alternative to Render deployment

FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set Python path
ENV PYTHONPATH=/app

# Cloud Run provides PORT environment variable
# Use 8080 as default for local development
ENV PORT=8080

# Run the application
CMD exec uvicorn src.main:app --host 0.0.0.0 --port ${PORT}
