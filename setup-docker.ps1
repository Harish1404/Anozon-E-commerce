# Docker Setup Script for Windows PowerShell
# This script automates the Docker containerization setup

Write-Host "🐳 Anozon E-Commerce Docker Setup Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is installed
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose not found." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 1: Creating .env file..." -ForegroundColor Yellow

# Create .env file if it doesn't exist
if (Test-Path ".env") {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
    $overwrite = Read-Host "Overwrite? (yes/no)"
    if ($overwrite -ne "yes") {
        Write-Host "Skipping .env creation" -ForegroundColor Yellow
    } else {
        $secret = [System.Web.Security.Membership]::GeneratePassword(32, 8)
        "JWT_SECRET=$secret" | Set-Content .env
        Write-Host "✓ .env file created with secure JWT_SECRET" -ForegroundColor Green
    }
} else {
    $secret = [System.Web.Security.Membership]::GeneratePassword(32, 8)
    "JWT_SECRET=$secret" | Set-Content .env
    Write-Host "✓ .env file created with secure JWT_SECRET" -ForegroundColor Green
    Write-Host "   Secret: $secret" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 2: Building Docker images..." -ForegroundColor Yellow
Write-Host "This may take 3-5 minutes, please wait..." -ForegroundColor Gray

docker-compose build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Images built successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Starting services..." -ForegroundColor Yellow

docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Services started" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start services" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 4: Waiting for health checks..." -ForegroundColor Yellow
Write-Host "Waiting 30 seconds for services to become healthy..." -ForegroundColor Gray

Start-Sleep -Seconds 30

Write-Host ""
Write-Host "Step 5: Verifying services..." -ForegroundColor Yellow

$output = docker-compose ps

Write-Host $output

# Check if all services are healthy
if ($output -match "health") {
    if ($output -match "unhealthy") {
        Write-Host "⚠ Some services are not healthy yet. Waiting 10 more seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        docker-compose ps
    } else {
        Write-Host "✓ All services are healthy" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is now running:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor Cyan
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  View logs:    docker-compose logs -f" -ForegroundColor Gray
Write-Host "  Stop services: docker-compose down" -ForegroundColor Gray
Write-Host "  Restart:      docker-compose restart" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:3000 in your browser" -ForegroundColor Gray
Write-Host "  2. Sign up and test the application" -ForegroundColor Gray
Write-Host "  3. View logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "For more information, see DOCKER.md" -ForegroundColor Yellow
