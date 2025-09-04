# Frontend Dockerfile for SCPI Simulator

# Build stage
FROM node:20-alpine AS builder

# Set environment variables
ENV NODE_ENV=production \
    NPM_CONFIG_CACHE=/tmp/.npm

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies)
RUN npm install --include=dev

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL=http://localhost:8000/api/v1
ARG VITE_APP_NAME="Simulateur SCPI Alderan"
ARG VITE_APP_VERSION=1.0.0
ARG VITE_ENVIRONMENT=production

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_VERSION=$VITE_APP_VERSION \
    VITE_ENVIRONMENT=$VITE_ENVIRONMENT

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy environment template for runtime configuration
COPY env.template.js /usr/share/nginx/html/env.template.js

# Create startup script for environment variable injection
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Generate env.js from environment variables' >> /docker-entrypoint.sh && \
    echo 'envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Start nginx' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start application
ENTRYPOINT ["/docker-entrypoint.sh"]
