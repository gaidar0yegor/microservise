#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to run backend tests
run_backend_tests() {
    echo -e "${YELLOW}Running backend tests...${NC}"
    docker-compose run --rm backend python manage.py test
    local backend_exit_code=$?
    
    if [ $backend_exit_code -eq 0 ]; then
        echo -e "${GREEN}Backend tests passed!${NC}"
    else
        echo -e "${RED}Backend tests failed!${NC}"
        return $backend_exit_code
    fi
}

# Function to run frontend tests
run_frontend_tests() {
    echo -e "${YELLOW}Running frontend tests...${NC}"
    docker-compose run --rm frontend npm test -- --watchAll=false
    local frontend_exit_code=$?
    
    if [ $frontend_exit_code -eq 0 ]; then
        echo -e "${GREEN}Frontend tests passed!${NC}"
    else
        echo -e "${RED}Frontend tests failed!${NC}"
        return $frontend_exit_code
    fi
}

# Main execution
echo -e "${YELLOW}Starting test suite...${NC}"

# Check if specific component is specified
if [ "$1" = "backend" ]; then
    run_backend_tests
    exit $?
elif [ "$1" = "frontend" ]; then
    run_frontend_tests
    exit $?
fi

# Run all tests if no specific component is specified
run_backend_tests
backend_result=$?

run_frontend_tests
frontend_result=$?

# Check if any tests failed
if [ $backend_result -eq 0 ] && [ $frontend_result -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed!${NC}"
    exit 1
fi
