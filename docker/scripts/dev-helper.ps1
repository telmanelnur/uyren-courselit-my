# PowerShell Docker Helper Script

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("up", "down", "restart", "logs", "status")]
    [string]$Action
)

# Navigate to docker directory
Set-Location -Path (Split-Path $PSScriptRoot -Parent)

switch ($Action) {
    "up" {
        Write-Host "🚀 Starting development services..." -ForegroundColor Green
        docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d
        Write-Host "✅ Services started!" -ForegroundColor Green
        Write-Host "📊 Redis UI: http://localhost:8081 [admin/admin123]" -ForegroundColor Yellow
        Write-Host "🍃 MongoDB: mongodb://admin:admin123@localhost:27017/courselit" -ForegroundColor Yellow
        Write-Host "🔧 Redis: localhost:6379" -ForegroundColor Yellow
    }
    "down" {
        Write-Host "🛑 Stopping development services..." -ForegroundColor Red
        docker-compose -f docker-compose.dev.yml down
        Write-Host "✅ Services stopped!" -ForegroundColor Green
    }
    "restart" {
        Write-Host "🔄 Restarting development services..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml restart
        Write-Host "✅ Services restarted!" -ForegroundColor Green
    }
    "logs" {
        Write-Host "📋 Showing service logs..." -ForegroundColor Cyan
        docker-compose -f docker-compose.dev.yml logs -f
    }
    "status" {
        Write-Host "📊 Service status:" -ForegroundColor Cyan
        docker-compose -f docker-compose.dev.yml ps
    }
}
