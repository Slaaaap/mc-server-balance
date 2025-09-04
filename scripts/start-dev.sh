#!/bin/bash

# Independent Docker Compose launcher script
# This script can be run from outside Cursor to avoid permission conflicts

set -e

echo "🚀 Starting SCPI Simulator Development Environment"
echo "================================================="
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Navigate to project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PWD"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Creating from example..."
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found. Creating from example..."
    cp frontend/env.example frontend/.env
    echo "✅ Created frontend/.env"
fi

echo ""
echo "🐳 Starting Docker Compose services..."
echo "This may take a few minutes on first run..."
echo ""

# Start services with explicit compose command
docker compose -f docker-compose.dev.yml up --build -d

# Wait a moment for services to start
sleep 5

echo ""
echo "🔍 Checking service status..."
docker compose -f docker-compose.dev.yml ps

echo ""
echo "✅ Development environment started successfully!"
echo ""
echo "🔗 Access URLs:"
echo "  • Frontend:        http://localhost:5173"
echo "  • Backend API:     http://localhost:8000"
echo "  • API Docs:        http://localhost:8000/docs"
echo "  • Database Admin:  http://localhost:8080"
echo "  • Redis Admin:     http://localhost:8081"
echo "  • Email Testing:   http://localhost:8025"
echo ""
echo "📊 To view logs: docker compose -f docker-compose.dev.yml logs -f"
echo "🛑 To stop:      docker compose -f docker-compose.dev.yml down"
echo ""
echo "🎉 Happy coding!"
