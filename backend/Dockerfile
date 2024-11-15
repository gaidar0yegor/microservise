# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create directories for static and media files
RUN mkdir -p /app/static /app/media

# Create and switch to non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Run entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Run the application
CMD ["gunicorn", "stock_management.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
