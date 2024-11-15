#!/bin/sh

# Exit on error
set -e

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "Database is ready!"

# Wait for redis to be ready
echo "Waiting for redis..."
while ! nc -z redis 6379; do
  sleep 0.1
done
echo "Redis is ready!"

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Create cache table
echo "Creating cache table..."
python manage.py createcachetable

# Start application
echo "Starting application..."
exec "$@"
