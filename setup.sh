#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Stock Management System...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    # Generate random secret key
    SECRET_KEY=$(python -c 'import random; import string; print("".join(random.choice(string.ascii_letters + string.digits + string.punctuation) for _ in range(50)))')
    # Replace the secret key in .env
    sed -i "s/your-secret-key-here/$SECRET_KEY/" .env
    echo -e "${GREEN}Created .env file${NC}"
fi

# Create necessary directories
echo -e "${YELLOW}Creating necessary directories...${NC}"
mkdir -p backend/media
mkdir -p backend/static
mkdir -p frontend/build

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
if [ -f backend/requirements.txt ]; then
    docker-compose run --rm backend pip install -r requirements.txt
    echo -e "${GREEN}Backend dependencies installed${NC}"
else
    echo -e "${RED}backend/requirements.txt not found${NC}"
    exit 1
fi

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
if [ -f frontend/package.json ]; then
    docker-compose run --rm frontend npm install
    echo -e "${GREEN}Frontend dependencies installed${NC}"
else
    echo -e "${RED}frontend/package.json not found${NC}"
    exit 1
fi

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose run --rm backend python manage.py migrate
echo -e "${GREEN}Database migrations complete${NC}"

# Create superuser
echo -e "${YELLOW}Creating superuser...${NC}"
docker-compose run --rm backend python manage.py createsuperuser

# Collect static files
echo -e "${YELLOW}Collecting static files...${NC}"
docker-compose run --rm backend python manage.py collectstatic --noinput
echo -e "${GREEN}Static files collected${NC}"

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
docker-compose run --rm frontend npm run build
echo -e "${GREEN}Frontend built${NC}"

echo -e "${GREEN}Setup complete!${NC}"
echo -e "\nYou can now start the application with:"
echo -e "${YELLOW}docker-compose up${NC}"
echo -e "\nAccess the application at:"
echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "Backend API: ${GREEN}http://localhost:8000/api${NC}"
echo -e "Admin Interface: ${GREEN}http://localhost:8000/admin${NC}"

# Add execution permission to run-tests.sh
chmod +x run-tests.sh

echo -e "\nTo run tests, use:"
echo -e "${YELLOW}./run-tests.sh${NC}"
