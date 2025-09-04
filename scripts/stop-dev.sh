#!/bin/bash

# Independent Docker Compose stop script
# This script can be run from outside Cursor to avoid permission conflicts

set -e

echo "🛑 Stopping SCPI Simulator Development Environment"
echo "=================================================="
echo ""

# Navigate to project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PWD"
echo ""

# Check if services are running
if docker compose -f docker-compose.dev.yml ps --services --filter "status=running" | grep -q .; then
    echo "🐳 Stopping Docker Compose services..."
    docker compose -f docker-compose.dev.yml down
    
    echo ""
    echo "✅ Development environment stopped successfully!"
else
    echo "ℹ️  No services are currently running."
fi

echo ""
echo "🔍 Final status:"
docker compose -f docker-compose.dev.yml ps
