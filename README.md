# Stock Management System

A modern stock management system built with Django and React, designed for efficient inventory control and supplier management.

## Features

- Stock inventory management
- Product management
- Supplier management
- Order tracking
- Real-time stock updates
- User authentication and authorization
- Reporting and analytics

## Tech Stack

- **Backend**: Django with Django REST Framework
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL
- **Cache & Message Broker**: Redis
- **Task Queue**: Celery
- **Containerization**: Docker

## Project Structure

```
.
├── backend/                 # Django backend
│   ├── stock_app/          # Main application
│   │   ├── models/         # Database models
│   │   ├── serializers/    # API serializers
│   │   ├── views/          # API views
│   │   └── tests/          # Unit tests
│   └── stock_management/   # Project settings
├── frontend/               # React frontend
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/         # Page components
│       ├── store/         # Redux store
│       ├── services/      # API services
│       └── types/         # TypeScript types
├── docker/                # Docker configurations
│   ├── backend/          # Backend Docker setup
│   ├── frontend/         # Frontend Docker setup
│   └── nginx/            # Nginx configuration
├── database/             # Database initialization
└── docs/                 # Documentation
    ├── api/             # API documentation
    ├── deployment/      # Deployment guides
    └── development/     # Development guides
```

## Prerequisites

- Docker
- Docker Compose
- Git

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd stock-management
   ```

2. Run the setup script:
   ```bash
   ./setup.sh
   ```

3. Start the application:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin Interface: http://localhost:8000/admin

## Development

### Running Tests

```bash
# Run all tests
./run-tests.sh

# Run specific tests
./run-tests.sh backend
./run-tests.sh frontend
```

### Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Key environment variables:
- `DJANGO_SECRET_KEY`: Django secret key
- `DJANGO_DEBUG`: Debug mode
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `REDIS_URL`: Redis connection URL

## API Documentation

API documentation is available at:
- Swagger UI: http://localhost:8000/api/swagger/
- ReDoc: http://localhost:8000/api/redoc/

Detailed API documentation can be found in [docs/api/README.md](docs/api/README.md).

## Deployment

Deployment guides are available in [docs/deployment/README.md](docs/deployment/README.md).

## Development Guide

Development guidelines and best practices can be found in [docs/development/README.md](docs/development/README.md).

## Docker Services

- **backend**: Django application
- **frontend**: React application
- **db**: PostgreSQL database
- **redis**: Redis cache and message broker
- **celery**: Celery worker for async tasks
- **nginx**: Production web server

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
