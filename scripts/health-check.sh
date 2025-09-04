#!/bin/bash

# Health Check Script for SCPI Simulator
# This script checks if all services are running correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"
DB_HOST="localhost"
DB_PORT="5432"
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Timeout for health checks
TIMEOUT=10

echo -e "${BLUE}🏥 SCPI Simulator Health Check${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to check HTTP endpoint
check_http() {
    local url=$1
    local service_name=$2
    local expected_status=${3:-200}
    
    echo -n "🔍 Checking $service_name... "
    
    if command -v curl >/dev/null 2>&1; then
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" || echo "000")
        
        if [ "$status_code" = "$expected_status" ]; then
            echo -e "${GREEN}✅ OK${NC} (HTTP $status_code)"
            return 0
        else
            echo -e "${RED}❌ FAILED${NC} (HTTP $status_code)"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️ SKIPPED${NC} (curl not available)"
        return 0
    fi
}

# Function to check TCP port
check_port() {
    local host=$1
    local port=$2
    local service_name=$3
    
    echo -n "🔍 Checking $service_name... "
    
    if command -v nc >/dev/null 2>&1; then
        if nc -z -w$TIMEOUT "$host" "$port" 2>/dev/null; then
            echo -e "${GREEN}✅ OK${NC} (Port $port)"
            return 0
        else
            echo -e "${RED}❌ FAILED${NC} (Port $port not reachable)"
            return 1
        fi
    elif command -v telnet >/dev/null 2>&1; then
        if timeout $TIMEOUT telnet "$host" "$port" </dev/null >/dev/null 2>&1; then
            echo -e "${GREEN}✅ OK${NC} (Port $port)"
            return 0
        else
            echo -e "${RED}❌ FAILED${NC} (Port $port not reachable)"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️ SKIPPED${NC} (nc/telnet not available)"
        return 0
    fi
}

# Function to check Docker service
check_docker_service() {
    local service_name=$1
    local compose_file=${2:-docker-compose.dev.yml}
    
    echo -n "🐳 Checking Docker service $service_name... "
    
    if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
        local status=$(docker compose -f "$compose_file" ps -q "$service_name" 2>/dev/null)
        
        if [ -n "$status" ]; then
            local running=$(docker inspect --format='{{.State.Running}}' "$status" 2>/dev/null || echo "false")
            local health=$(docker inspect --format='{{.State.Health.Status}}' "$status" 2>/dev/null || echo "unknown")
            
            if [ "$running" = "true" ]; then
                if [ "$health" = "healthy" ] || [ "$health" = "unknown" ]; then
                    echo -e "${GREEN}✅ OK${NC} (Running)"
                    return 0
                else
                    echo -e "${YELLOW}⚠️ UNHEALTHY${NC} (Running but unhealthy)"
                    return 1
                fi
            else
                echo -e "${RED}❌ FAILED${NC} (Not running)"
                return 1
            fi
        else
            echo -e "${RED}❌ FAILED${NC} (Service not found)"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️ SKIPPED${NC} (docker compose not available)"
        return 0
    fi
}

# Initialize counters
total_checks=0
passed_checks=0

# Function to run check and update counters
run_check() {
    total_checks=$((total_checks + 1))
    if "$@"; then
        passed_checks=$((passed_checks + 1))
    fi
}

echo -e "${YELLOW}📊 Service Health Checks${NC}"
echo "-------------------------"

# Check Docker services (if available)
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    run_check check_docker_service "db"
    run_check check_docker_service "redis"
    run_check check_docker_service "backend-dev"
    run_check check_docker_service "frontend-dev"
fi

echo ""
echo -e "${YELLOW}🌐 Network Health Checks${NC}"
echo "-------------------------"

# Check network connectivity
run_check check_port "$DB_HOST" "$DB_PORT" "PostgreSQL Database"
run_check check_port "$REDIS_HOST" "$REDIS_PORT" "Redis Cache"

echo ""
echo -e "${YELLOW}🔗 API Health Checks${NC}"
echo "--------------------"

# Check API endpoints
run_check check_http "$BACKEND_URL/health" "Backend Health"
run_check check_http "$BACKEND_URL/docs" "Backend Documentation"
run_check check_http "$BACKEND_URL/api/v1/scpi/list" "SCPI List API"

echo ""
echo -e "${YELLOW}🎨 Frontend Health Checks${NC}"
echo "-------------------------"

# Check frontend (development mode)
run_check check_http "$FRONTEND_URL" "Frontend Application"

echo ""
echo -e "${YELLOW}📊 Database Health Checks${NC}"
echo "-------------------------"

# Check database connectivity (if psql is available)
if command -v psql >/dev/null 2>&1; then
    echo -n "🔍 Checking PostgreSQL connection... "
    if PGPASSWORD=scpi_password psql -h "$DB_HOST" -p "$DB_PORT" -U scpi_user -d scpi_simulator -c "SELECT health_check();" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC} (Database query successful)"
        run_check true
    else
        echo -e "${RED}❌ FAILED${NC} (Database query failed)"
        run_check false
    fi
else
    echo -e "${YELLOW}⚠️ SKIPPED${NC} (psql not available)"
fi

# Check Redis connectivity (if redis-cli is available)
if command -v redis-cli >/dev/null 2>&1; then
    echo -n "🔍 Checking Redis connection... "
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC} (Redis ping successful)"
        run_check true
    else
        echo -e "${RED}❌ FAILED${NC} (Redis ping failed)"
        run_check false
    fi
else
    echo -e "${YELLOW}⚠️ SKIPPED${NC} (redis-cli not available)"
fi

echo ""
echo -e "${BLUE}📈 Health Check Summary${NC}"
echo "========================"

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}🎉 All checks passed! ($passed_checks/$total_checks)${NC}"
    echo -e "${GREEN}✅ The SCPI Simulator is healthy and ready to use!${NC}"
    exit_code=0
elif [ $passed_checks -gt 0 ]; then
    echo -e "${YELLOW}⚠️ Some checks failed ($passed_checks/$total_checks passed)${NC}"
    echo -e "${YELLOW}🔧 The system may still be functional but needs attention${NC}"
    exit_code=1
else
    echo -e "${RED}❌ All checks failed! ($passed_checks/$total_checks passed)${NC}"
    echo -e "${RED}🚨 The system appears to be down${NC}"
    exit_code=2
fi

echo ""
echo -e "${BLUE}🔗 Quick Access Links${NC}"
echo "--------------------"
echo -e "Frontend:     ${BLUE}http://localhost:5173${NC}"
echo -e "Backend API:  ${BLUE}http://localhost:8000${NC}"
echo -e "API Docs:     ${BLUE}http://localhost:8000/docs${NC}"
echo -e "DB Admin:     ${BLUE}http://localhost:8080${NC}"
echo -e "Redis Admin:  ${BLUE}http://localhost:8081${NC}"

echo ""
echo -e "${BLUE}🛠️ Troubleshooting${NC}"
echo "------------------"
if [ $exit_code -ne 0 ]; then
    echo -e "🔍 Check logs with: ${YELLOW}make logs${NC}"
    echo -e "🔄 Restart services: ${YELLOW}make dev-restart${NC}"
    echo -e "🧹 Clean and rebuild: ${YELLOW}make dev-clean && make dev${NC}"
fi

exit $exit_code
