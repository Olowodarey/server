#!/bin/bash

# Test Runner Script for Stacks Academy API
# Usage: ./run-tests.sh [unit|e2e|all|coverage]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Default to all tests
TEST_TYPE="${1:-all}"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Stacks Academy API - Test Runner${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check if .env.test exists
if [ ! -f ".env.test" ]; then
    echo -e "${RED}Error: .env.test file not found${NC}"
    echo "Creating .env.test from template..."
    cp .env.example .env.test
    echo -e "${YELLOW}Please configure .env.test and run again${NC}"
    exit 1
fi

# Load test environment
export $(cat .env.test | grep -v '^#' | xargs)

case $TEST_TYPE in
    unit)
        echo -e "${GREEN}Running Unit Tests...${NC}"
        pnpm test
        ;;
    e2e)
        echo -e "${GREEN}Running E2E Tests...${NC}"
        echo -e "${YELLOW}Ensure test database is running...${NC}"
        pnpm test:e2e
        ;;
    coverage)
        echo -e "${GREEN}Running Tests with Coverage...${NC}"
        pnpm test:cov
        ;;
    all)
        echo -e "${GREEN}Running All Tests...${NC}"
        echo ""
        echo -e "${YELLOW}1. Unit Tests${NC}"
        pnpm test
        echo ""
        echo -e "${YELLOW}2. E2E Tests${NC}"
        pnpm test:e2e
        ;;
    *)
        echo -e "${RED}Invalid test type: $TEST_TYPE${NC}"
        echo "Usage: ./run-tests.sh [unit|e2e|all|coverage]"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Tests Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
