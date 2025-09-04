#!/bin/bash

# Update Frontend Environment Variables at Runtime
# This script generates the env.js file for the frontend based on environment variables

set -e

# Default values
DEFAULT_API_URL="http://localhost:8000/api/v1"
DEFAULT_APP_NAME="Simulateur SCPI Alderan"
DEFAULT_ENVIRONMENT="production"

# Environment variables with defaults
API_BASE_URL="${VITE_API_BASE_URL:-$DEFAULT_API_URL}"
APP_NAME="${VITE_APP_NAME:-$DEFAULT_APP_NAME}"
ENVIRONMENT="${VITE_ENVIRONMENT:-$DEFAULT_ENVIRONMENT}"

# Output file
OUTPUT_FILE="${1:-/usr/share/nginx/html/env.js}"

echo "🚀 Updating frontend environment configuration..."
echo "📝 Output file: $OUTPUT_FILE"
echo "🔗 API URL: $API_BASE_URL"
echo "📱 App Name: $APP_NAME"
echo "🌍 Environment: $ENVIRONMENT"

# Create the env.js file
cat > "$OUTPUT_FILE" << EOF
// Runtime environment configuration for SCPI Simulator Frontend
// Generated at: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

window._env_ = {
  // API Configuration
  VITE_API_BASE_URL: '${VITE_API_BASE_URL:-$DEFAULT_API_URL}',
  
  // Application Configuration
  VITE_APP_NAME: '${VITE_APP_NAME:-$DEFAULT_APP_NAME}',
  VITE_APP_VERSION: '${VITE_APP_VERSION:-1.0.0}',
  VITE_APP_DESCRIPTION: '${VITE_APP_DESCRIPTION:-Simulateur d'investissement SCPI pour Alderan}',
  
  // Environment
  VITE_ENVIRONMENT: '${VITE_ENVIRONMENT:-$DEFAULT_ENVIRONMENT}',
  
  // Feature Flags
  VITE_ENABLE_DEV_TOOLS: '${VITE_ENABLE_DEV_TOOLS:-false}',
  VITE_ENABLE_ANALYTICS: '${VITE_ENABLE_ANALYTICS:-true}',
  VITE_ENABLE_MOCK_API: '${VITE_ENABLE_MOCK_API:-false}',
  VITE_ENABLE_ERROR_REPORTING: '${VITE_ENABLE_ERROR_REPORTING:-true}',
  
  // External Services
  VITE_SENTRY_DSN: '${VITE_SENTRY_DSN:-}',
  VITE_GA_TRACKING_ID: '${VITE_GA_TRACKING_ID:-}',
  VITE_HOTJAR_ID: '${VITE_HOTJAR_ID:-}',
  
  // API Configuration
  VITE_API_TIMEOUT: '${VITE_API_TIMEOUT:-30000}',
  VITE_API_RETRY_ATTEMPTS: '${VITE_API_RETRY_ATTEMPTS:-3}',
  
  // Cache Configuration
  VITE_CACHE_DURATION: '${VITE_CACHE_DURATION:-300000}',
  
  // UI Configuration
  VITE_DEFAULT_THEME: '${VITE_DEFAULT_THEME:-light}',
  VITE_ENABLE_DARK_MODE: '${VITE_ENABLE_DARK_MODE:-true}',
  VITE_ENABLE_ANIMATIONS: '${VITE_ENABLE_ANIMATIONS:-true}',
  
  // Development Settings
  VITE_DEBUG_MODE: '${VITE_DEBUG_MODE:-false}',
  VITE_SHOW_API_LOGS: '${VITE_SHOW_API_LOGS:-false}',
  
  // Build Configuration
  VITE_BUILD_VERSION: '${VITE_BUILD_VERSION:-1.0.0}',
  VITE_BUILD_DATE: '${VITE_BUILD_DATE:-$(date -u +"%Y-%m-%d")}',
  
  // Security
  VITE_ENABLE_CSP: '${VITE_ENABLE_CSP:-true}',
  VITE_ALLOWED_HOSTS: '${VITE_ALLOWED_HOSTS:-localhost,127.0.0.1}',
  
  // Performance
  VITE_ENABLE_PWA: '${VITE_ENABLE_PWA:-false}',
  VITE_ENABLE_SERVICE_WORKER: '${VITE_ENABLE_SERVICE_WORKER:-false}',
  
  // Iframe Integration
  VITE_IFRAME_ALLOWED_ORIGINS: '${VITE_IFRAME_ALLOWED_ORIGINS:-https://alderan.fr,https://www.alderan.fr}',
  
  // Localization
  VITE_DEFAULT_LOCALE: '${VITE_DEFAULT_LOCALE:-fr}',
  VITE_SUPPORTED_LOCALES: '${VITE_SUPPORTED_LOCALES:-fr,en}',
  
  // Contact Information
  VITE_CONTACT_EMAIL: '${VITE_CONTACT_EMAIL:-contact@alderan.fr}',
  VITE_SUPPORT_PHONE: '${VITE_SUPPORT_PHONE:-+33123456789}',
  
  // Legal
  VITE_PRIVACY_POLICY_URL: '${VITE_PRIVACY_POLICY_URL:-https://alderan.fr/privacy}',
  VITE_TERMS_OF_SERVICE_URL: '${VITE_TERMS_OF_SERVICE_URL:-https://alderan.fr/terms}'
};

// Utility function to get environment variable
window.getEnv = function(key, defaultValue) {
  return window._env_[key] || defaultValue;
};

// Debug helper (only in development)
if (window._env_.VITE_DEBUG_MODE === 'true') {
  console.log('🔧 Frontend Environment Configuration:', window._env_);
}
EOF

echo "✅ Frontend environment configuration updated successfully!"

# Validate the generated file
if [ -f "$OUTPUT_FILE" ]; then
    echo "📊 File size: $(wc -c < "$OUTPUT_FILE") bytes"
    echo "📋 First few lines:"
    head -n 5 "$OUTPUT_FILE"
else
    echo "❌ Error: Failed to create $OUTPUT_FILE"
    exit 1
fi

echo "🎉 Done!"
