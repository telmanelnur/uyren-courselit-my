#!/bin/bash

# Deploy script for VPS
# Usage: ./deploy.sh <image_tag>

set -e

IMAGE_TAG=${1:-latest}
echo "Deploying with image tag: $IMAGE_TAG"

# Export the image tag for docker-compose
export IMAGE_TAG

# Pull latest images
echo "Pulling latest images..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod pull

# Deploy services
echo "Starting services..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Clean up unused images
echo "Cleaning up unused images..."
docker system prune -f

echo "Deployment completed successfully!"
