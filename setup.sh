#!/bin/bash

# OutreachSaaS Setup Script
# This script helps you set up the project for local development

set -e  # Exit on error

echo "========================================="
echo "OutreachSaaS Setup Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js v18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js detected: $(node --version)${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ Warning: Docker is not installed. You'll need Docker for PostgreSQL and Redis.${NC}"
    echo "  Install Docker from: https://docs.docker.com/get-docker/"
    echo ""
fi

# Backend Setup
echo ""
echo "========================================="
echo "Setting up Backend..."
echo "========================================="

cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit backend/.env with your configuration${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Database setup
echo ""
read -p "Do you want to initialize the database now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running database migrations..."
    npx prisma migrate dev --name init
    echo -e "${GREEN}✓ Database initialized${NC}"
fi

cd ..

# Frontend Setup
echo ""
echo "========================================="
echo "Setting up Frontend..."
echo "========================================="

cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file from .env.local.example..."
    cp .env.local.example .env.local
    echo -e "${GREEN}✓ .env.local file created${NC}"
else
    echo -e "${GREEN}✓ .env.local file already exists${NC}"
fi

cd ..

# Final Instructions
echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start Docker services (PostgreSQL & Redis):"
echo "   ${GREEN}docker-compose up -d${NC}"
echo ""
echo "2. Start the backend (in one terminal):"
echo "   ${GREEN}cd backend && npm run dev${NC}"
echo ""
echo "3. Start the frontend (in another terminal):"
echo "   ${GREEN}cd frontend && npm run dev${NC}"
echo ""
echo "4. (Optional) Start the background worker:"
echo "   ${GREEN}cd backend && npm run worker${NC}"
echo ""
echo "5. Access the application:"
echo "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo "   Backend API: ${GREEN}http://localhost:5000${NC}"
echo ""
echo "For more information, see README.md"
echo ""
