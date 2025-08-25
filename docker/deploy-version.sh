#!/bin/bash

# Deploy specific version
# Usage: ./deploy-version.sh v1.0.0

set -e

VERSION=${1:-latest}
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"

echo "🚀 Deploying version: $VERSION"

# Update environment with version
export IMAGE_TAG=$VERSION

# Pull latest images
echo "📥 Pulling images for version $VERSION..."
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull

# Deploy
echo "🚀 Starting services..."
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

# Check status
echo "📊 Service status:"
docker-compose -f "$COMPOSE_FILE" ps

echo "✅ Deployment completed!"
echo "📋 View logs: docker-compose -f $COMPOSE_FILE logs -f"
