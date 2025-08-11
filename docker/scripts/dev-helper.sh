#!/bin/bash
# Bash Docker Helper Script

ACTION=$1

# Navigate to docker directory
cd "$(dirname "$0")/.."

case $ACTION in
    "up")
        echo "🚀 Starting development services..."
        docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d
        echo "✅ Services started!"
        echo "📊 Redis UI: http://localhost:8081 (admin/admin123)"
        echo "🍃 MongoDB: mongodb://admin:admin123@localhost:27017/courselit"
        echo "🔧 Redis: localhost:6379"
        ;;
    "down")
        echo "🛑 Stopping development services..."
        docker-compose -f docker-compose.dev.yml down
        echo "✅ Services stopped!"
        ;;
    "restart")
        echo "🔄 Restarting development services..."
        docker-compose -f docker-compose.dev.yml restart
        echo "✅ Services restarted!"
        ;;
    "logs")
        echo "📋 Showing service logs..."
        docker-compose -f docker-compose.dev.yml logs -f
        ;;
    "status")
        echo "📊 Service status:"
        docker-compose -f docker-compose.dev.yml ps
        ;;
    *)
        echo "Usage: $0 {up|down|restart|logs|status}"
        echo "  up      - Start all services"
        echo "  down    - Stop all services"
        echo "  restart - Restart all services"
        echo "  logs    - Show service logs"
        echo "  status  - Show service status"
        exit 1
        ;;
esac
