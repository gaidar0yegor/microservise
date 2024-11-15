# Deployment Guide

This guide covers deployment of the Stock Management System in different environments.

## Development Environment

1. Prerequisites:
   ```bash
   - Docker & Docker Compose
   - Git
   ```

2. Setup:
   ```bash
   # Clone repository
   git clone <repository-url>
   cd stock-management

   # Run setup script
   ./setup.sh

   # Start services
   docker-compose up
   ```

3. Access:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin: http://localhost:8000/admin

## Production Environment

1. Prerequisites:
   ```bash
   - Docker & Docker Compose
   - Domain name
   - SSL certificate
   ```

2. Environment Setup:
   ```bash
   # Copy environment file
   cp .env.example .env

   # Edit production settings
   nano .env

   # Required changes:
   - Set DJANGO_DEBUG=False
   - Set DJANGO_ALLOWED_HOSTS
   - Set secure database credentials
   - Set proper CORS settings
   - Set email configuration
   ```

3. SSL Setup:
   ```bash
   # Place SSL certificates in
   ./certs/fullchain.pem
   ./certs/privkey.pem
   ```

4. Database Setup:
   ```bash
   # Start database
   docker-compose up -d db

   # Wait for database to be ready
   docker-compose exec db pg_isready

   # Run migrations
   docker-compose run --rm backend python manage.py migrate
   ```

5. Static Files:
   ```bash
   # Collect static files
   docker-compose run --rm backend python manage.py collectstatic --noinput

   # Build frontend
   docker-compose run --rm frontend npm run build
   ```

6. Start Services:
   ```bash
   # Start all services
   docker-compose -f docker-compose.yml up -d
   ```

7. Create Superuser:
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

## Security Checklist

1. Environment Variables:
   - [ ] Changed default passwords
   - [ ] Set secure SECRET_KEY
   - [ ] Disabled DEBUG
   - [ ] Set allowed hosts

2. Database:
   - [ ] Changed default database password
   - [ ] Enabled database backups
   - [ ] Set proper database permissions

3. SSL/TLS:
   - [ ] Installed valid SSL certificate
   - [ ] Configured SSL in nginx
   - [ ] Redirected HTTP to HTTPS

4. Security Headers:
   - [ ] Set CORS headers
   - [ ] Set CSP headers
   - [ ] Set HSTS headers

## Backup and Restore

1. Database Backup:
   ```bash
   docker-compose exec db pg_dump -U postgres stock_management > backup.sql
   ```

2. Database Restore:
   ```bash
   cat backup.sql | docker-compose exec -T db psql -U postgres stock_management
   ```

3. Media Files Backup:
   ```bash
   tar -czf media_backup.tar.gz backend/media/
   ```

## Monitoring

Basic health checks:
```bash
# Check backend health
curl http://localhost:8000/health/

# Check database connection
docker-compose exec backend python manage.py dbcheck

# View logs
docker-compose logs -f
```

## Troubleshooting

1. Database Connection Issues:
   ```bash
   # Check database status
   docker-compose exec db pg_isready

   # Check database logs
   docker-compose logs db
   ```

2. Backend Issues:
   ```bash
   # Check backend logs
   docker-compose logs backend

   # Enter backend container
   docker-compose exec backend bash
   ```

3. Frontend Issues:
   ```bash
   # Check frontend logs
   docker-compose logs frontend

   # Rebuild frontend
   docker-compose run --rm frontend npm run build
   ```

## Performance Optimization

1. Database:
   - Enable connection pooling
   - Set appropriate PostgreSQL configuration
   - Regular VACUUM and maintenance

2. Caching:
   - Configure Redis caching
   - Enable template caching
   - Set appropriate cache timeouts

3. Static Files:
   - Enable gzip compression
   - Set proper cache headers
   - Use CDN for static files

## Scaling

1. Horizontal Scaling:
   ```bash
   # Scale backend
   docker-compose up -d --scale backend=3

   # Scale celery workers
   docker-compose up -d --scale celery=2
   ```

2. Load Balancing:
   - Configure nginx load balancing
   - Set up health checks
   - Configure session persistence

## Maintenance

1. Updates:
   ```bash
   # Pull latest changes
   git pull origin main

   # Update dependencies
   docker-compose build

   # Apply migrations
   docker-compose run --rm backend python manage.py migrate

   # Restart services
   docker-compose down
   docker-compose up -d
   ```

2. Logs Rotation:
   - Configure logrotate
   - Set appropriate retention periods
   - Monitor disk space

Remember to always test deployments in a staging environment before applying to production.
