#!/bin/bash

# Production Deploy Script for Courselit Application
# This script is called by GitHub Actions to deploy to VPS
# Usage: ./deploy.sh <tag> [--force] [--rollback]

set -euo pipefail

# Configuration - Update these paths for your VPS
PROJECT_DIR="/home/ubuntu/courselit"
DOCKER_DIR="$PROJECT_DIR/docker"
COMPOSE_FILE="$DOCKER_DIR/docker-compose.prod.yml"
ENV_FILE="$DOCKER_DIR/.env.prod"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output and log
log_and_print() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            echo "[$timestamp] [INFO] $message" >> "$LOG_FILE"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            echo "[$timestamp] [SUCCESS] $message" >> "$LOG_FILE"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            echo "[$timestamp] [WARNING] $message" >> "$LOG_FILE"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            echo "[$timestamp] [ERROR] $message" >> "$LOG_FILE"
            ;;
    esac
}

print_status() { log_and_print "INFO" "$1"; }
print_success() { log_and_print "SUCCESS" "$1"; }
print_warning() { log_and_print "WARNING" "$1"; }
print_error() { log_and_print "ERROR" "$1"; }

# Parse command line arguments
FORCE_DEPLOY=false
ROLLBACK_MODE=false
TAG=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --rollback)
            ROLLBACK_MODE=true
            shift
            ;;
        -*)
            print_error "Unknown option: $1"
            print_error "Usage: ./deploy.sh <tag> [--force] [--rollback]"
            exit 1
            ;;
        *)
            TAG="$1"
            shift
            ;;
    esac
done

# Check if tag parameter is provided
if [ -z "$TAG" ]; then
    print_error "No tag provided. Usage: ./deploy.sh <tag> [--force] [--rollback]"
    exit 1
fi

print_status "Deploying version: $TAG"
if [ "$FORCE_DEPLOY" = true ]; then
    print_warning "Force deploy mode enabled"
fi
if [ "$ROLLBACK_MODE" = true ]; then
    print_warning "Rollback mode enabled"
fi

print_status "Starting deployment at $(date)"

# Navigate to project directory
cd $PROJECT_DIR || {
    print_error "Failed to navigate to project directory: $PROJECT_DIR"
    exit 1
}

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Docker compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_warning "Environment file not found: $ENV_FILE"
    print_warning "Using default environment variables"
fi





# Stop existing services
print_status "Stopping existing services..."
docker-compose -f $COMPOSE_FILE down || {
    print_warning "Failed to stop services, continuing..."
}

# Pull latest images with the specified tag
print_status "Pulling latest images with tag: $TAG"
docker pull ghcr.io/faizullin/uyren-courselit-my/web:$TAG
docker pull ghcr.io/faizullin/uyren-courselit-my/queue:$TAG

# Tag images as latest
print_status "Tagging images as latest..."
docker tag ghcr.io/faizullin/uyren-courselit-my/web:$TAG ghcr.io/faizullin/uyren-courselit-my/web:latest
docker tag ghcr.io/faizullin/uyren-courselit-my/queue:$TAG ghcr.io/faizullin/uyren-courselit-my/queue:latest

# Start services with new images
print_status "Starting services with new images..."
if [ -f "$ENV_FILE" ]; then
    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d
else
    docker-compose -f $COMPOSE_FILE up -d
fi

# Wait for services to start
print_status "Waiting for services to start..."
sleep 5

# Check service status
print_status "Checking service status..."
docker-compose -f $COMPOSE_FILE ps

print_success "Deployment completed successfully!"
print_success "Version $TAG is now running on the VPS"
