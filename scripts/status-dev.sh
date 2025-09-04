#!/bin/bash

# Development environment status and logs script
# Run independently from IDEs to avoid permission conflicts

set -e

echo "📊 SCPI Simulator Development Environment Status"
echo "================================================"
echo ""

# Navigate to project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PWD"
echo ""

# Check Docker status
echo "🐳 Docker Status:"
if docker info >/dev/null 2>&1; then
    echo "  ✅ Docker is running"
    docker version --format "  📦 Version: {{.Server.Version}}"
else
    echo "  ❌ Docker is not running"
    exit 1
fi

echo ""

# Check service status
echo "🔍 Service Status:"
docker compose -f docker-compose.dev.yml ps

echo ""

# Check if services are healthy
echo "🏥 Health Status:"
services=("db" "redis" "backend-dev" "frontend-dev")
for service in "${services[@]}"; do
    if docker compose -f docker-compose.dev.yml ps "$service" --format "table" | grep -q "Up"; then
        echo "  ✅ $service: Running"
    else
        echo "  ❌ $service: Not running"
    fi
done

echo ""

# Show resource usage
echo "💾 Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker compose -f docker-compose.dev.yml ps -q) 2>/dev/null || echo "  ℹ️  No running containers"

echo ""
echo "🔗 Access URLs (if services are running):"
echo "  • Frontend:        http://localhost:5173"
echo "  • Backend API:     http://localhost:8000"
echo "  • API Docs:        http://localhost:8000/docs"
echo "  • Database Admin:  http://localhost:8080"
echo "  • Redis Admin:     http://localhost:8081"
echo "  • Email Testing:   http://localhost:8025"

echo ""
echo "📋 Available Commands:"
echo "  • Start:     ./scripts/start-dev.sh"
echo "  • Stop:      ./scripts/stop-dev.sh"
echo "  • Logs:      ./scripts/logs-dev.sh"
echo "  • Status:    ./scripts/status-dev.sh"
echo "  • Health:    ./scripts/health-check.sh"
