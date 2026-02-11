# 🐳 Docker Deployment & Containerization Guide

Complete guide to dockerize, build, and run the Anozon E-Commerce platform.

---

## 📋 Prerequisites

Before you start, ensure you have:
- **Docker** 20.10+ ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** 2.0+ (included with Docker Desktop)
- **At least 1GB** free disk space for images
- **Git** for version control (optional but recommended)

### Verify Installation
```bash
docker --version
docker-compose --version
docker ps  # Should return empty list if no containers running
```

---

## 🚀 COMPLETE SETUP GUIDE (Step-by-Step)

### Step 1: Prepare Your Environment

Navigate to your project root:
```bash
cd C:\Users\HarishP\Documents\Anozon\Anozon-E-commerce

# Verify project structure
ls -la  # Should show: Backend/, Frontend/, docker-compose.yml, etc.
```

### Step 2: Create Environment File

Create a `.env` file in the project root with the following:

**Option A: Using PowerShell (Windows)**
```powershell
# Generate secure JWT secret
$secret = [System.Web.Security.Membership]::GeneratePassword(32, 8)
"JWT_SECRET=$secret" | Out-File -Encoding UTF8 .env
```

**Option B: Using Command Prompt (Windows)**
```batch
# Create .env file manually with content:
JWT_SECRET=your_super_secret_key_minimum_32_chars_recommended
```

**Option C: Using Python (All OS)**
```bash
python -c "import secrets; open('.env', 'w').write('JWT_SECRET=' + secrets.token_urlsafe(32))"
```

**Option D: Manual Creation**
```
Create a file named `.env` in your project root with:
JWT_SECRET=your_super_secret_key_change_in_production_!!!
```

### Step 3: Build Docker Images

Build both backend and frontend images:

```bash
# Build all images (uses docker-compose.yml)
docker-compose build

# Or build specific services
docker-compose build backend
docker-compose build frontend
```

**What happens:**
- Backend image builds from `Backend/dockerfile` (Python 3.11)
- Frontend image builds from `Frontend/dockerfile` (Node + Nginx)
- MongoDB image is downloaded from Docker Hub

### Step 4: Start All Services

Start the containerized application:

```bash
# Start in detached mode (background)
docker-compose up -d

# Or start with live logs (attach mode)
docker-compose up
```

**Expected output when starting:**
```
[+] Running 4/4
 ✔ Network product-shop-network  Created
 ✔ Container product-shop-mongodb  Started
 ✔ Container product-shop-backend  Started
 ✔ Container product-shop-frontend  Started
```

### Step 5: Verify Everything is Running

Check container status:
```bash
docker-compose ps
```

**Expected healthy status:**
```
NAME                      STATUS              PORTS
product-shop-mongodb      Up (healthy)        27017/tcp
product-shop-backend      Up (healthy)        0.0.0.0:8000->8000/tcp
product-shop-frontend     Up (healthy)        0.0.0.0:3000->80/tcp
```

### Step 6: Test the Application

Open in your browser:
- **Frontend App:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

### Step 7: View Logs (For Debugging)

Monitor what's happening:
```bash
# See all container logs
docker-compose logs -f --tail=100

# Follow specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Step 8: Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v
```

---

## 🔧 Building Images Individually

### Backend Only
```bash
# Build the image
docker build -t product-shop-backend:latest ./Backend

# Run manually (optional)
docker run -d \
  -e MONGO_URL=mongodb://host.docker.internal:27017 \
  -e JWT_SECRET=test_secret \
  -p 8000:8000 \
  product-shop-backend:latest
```

### Frontend Only
```bash
# Build the image
docker build -t product-shop-frontend:latest \
  --build-arg VITE_API_URL=http://localhost:8000 \
  ./Frontend

# Run manually (optional)
docker run -d \
  -p 3000:80 \
  product-shop-frontend:latest
```

---

## 📝 Essential Docker Commands

### View Images
```bash
# List all local Docker images
docker image ls

# Show image details
docker image inspect product-shop-backend:latest

# Remove an image
docker image rm product-shop-backend:latest

# Remove unused images
docker image prune
```

### View & Manage Containers
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Show container details
docker inspect product-shop-backend

# View container resource usage
docker stats

# View processes running in container
docker top product-shop-backend
```

### Container Management
```bash
# Start a stopped container
docker start product-shop-backend

# Stop a running container
docker stop product-shop-backend

# Restart a container
docker restart product-shop-backend

# Remove a container
docker rm product-shop-backend

# Execute command in running container
docker exec -it product-shop-backend bash
docker exec -it product-shop-mongodb mongosh
```

### Docker Compose Commands
```bash
# Start services in background
docker-compose up -d

# Start services and show logs
docker-compose up

# Stop services (keep data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything including volumes/data
docker-compose down -v

# Restart services
docker-compose restart

# Rebuild images and start
docker-compose up -d --build

# Remove images
docker-compose down --rmi all

# View resource usage
docker-compose stats

# Execute command in service
docker-compose exec backend bash
```

### Cleaning Up Docker
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove EVERYTHING unused (careful!)
docker system prune -a --volumes

# Show disk usage
docker system df
```

---

## 🔄 Updates & Code Changes

### After Editing Backend Code
```bash
# Rebuild and restart backend
docker-compose up -d --build backend

# View logs to verify
docker-compose logs -f backend
```

### After Editing Frontend Code
```bash
# Rebuild and restart frontend
docker-compose up -d --build frontend

# View logs to verify
docker-compose logs -f frontend
```

### After Editing Dockerfile
```bash
# Force rebuild ignoring cache
docker-compose build --no-cache backend
docker-compose up -d backend
```

---

## 🐛 Troubleshooting

### Backend Not Starting / Service Unhealthy
```bash
# Check logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Check if MongoDB is connected
docker-compose logs backend | grep -i mongo
```

### Frontend Not Loading (Blank Page)
```bash
# Check nginx logs
docker-compose logs frontend

# Verify backend is accessible from frontend
docker exec product-shop-frontend wget -O- http://backend:8000/docs
```

### MongoDB Connection Issues
```bash
# Access MongoDB shell
docker exec -it product-shop-mongodb mongosh

# Inside mongosh:
show dbs
use product_shop_db
show collections
```

### Port Already in Use
```bash
# Find what's using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Mac/Linux

# Change port in docker-compose.yml if needed
# Example: Change 8000:8000 to 8001:8000
```

### .env File Not Loading
```bash
# Verify .env file exists
ls -la .env

# Check if variables are loaded
docker-compose config | grep JWT_SECRET

# If not, recreate it
echo "JWT_SECRET=test_secret_key" > .env
```

### Clean Rebuild After Issues
```bash
# Stop all services
docker-compose down -v

# Remove images to rebuild from scratch
docker rmi product-shop-backend product-shop-frontend

# Rebuild everything
docker-compose up -d --build

# Verify health
docker-compose ps
```

---

## ✅ Final Verification Checklist

- [ ] Docker installed: `docker --version` returns 20.10+
- [ ] Docker Compose installed: `docker-compose --version` returns 2.0+
- [ ] .env file created with JWT_SECRET
- [ ] Images built: `docker image ls` shows images
- [ ] All containers running: `docker-compose ps` shows "Up"
- [ ] All containers healthy: All show "(healthy)" status
- [ ] Backend accessible: http://localhost:8000/docs
- [ ] Frontend accessible: http://localhost:3000
- [ ] MongoDB connected: Check backend logs
- [ ] Can create data: Sign up a user

---

## 🎉 Congratulations!

Your application is now fully containerized and ready to use!

### Quick Command Reference
```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Clean everything
docker-compose down -v
```

**Happy containerizing! 🐳**

---

## 🌐 Access URLs

- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **MongoDB:** localhost:27017

---

## 🔐 Security Setup

### Generate Secure JWT Secret
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Update `.env` file with the generated secret:
```env
JWT_SECRET=your_generated_secret_here
```

---

## 📊 Container Management

### Check Container Status
```bash
docker-compose ps
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### View Resource Usage
```bash
docker stats
```

---

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
docker-compose logs backend

# Check if MongoDB is ready
docker-compose ps mongodb
```

### Frontend Not Loading
```bash
# Check nginx logs
docker-compose logs frontend

# Verify backend is running
curl http://localhost:8000/docs
```

### MongoDB Connection Issues
```bash
# Access MongoDB shell
docker exec -it product-shop-mongodb mongosh

# Check database
use product_shop_db
show collections
```

### Clean Rebuild
```bash
# Remove everything and start fresh
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## 📦 Production Deployment

### Using Docker Compose
```bash
# Set production environment
export JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(32))")

# Start services
docker-compose up -d
```

### Using Docker Swarm
```bash
docker stack deploy -c docker-compose.yml product-shop
```

### Using Kubernetes
Convert docker-compose.yml using Kompose:
```bash
kompose convert
kubectl apply -f .
```

---

## 🔄 Updates & Maintenance

### Update Backend Code
```bash
cd Backend
git pull
cd ..
docker-compose up -d --build backend
```

### Update Frontend Code
```bash
cd Frontend
git pull
cd ..
docker-compose up -d --build frontend
```

### Backup MongoDB Data
```bash
docker exec product-shop-mongodb mongodump --out /data/backup
docker cp product-shop-mongodb:/data/backup ./mongodb-backup
```

### Restore MongoDB Data
```bash
docker cp ./mongodb-backup product-shop-mongodb:/data/backup
docker exec product-shop-mongodb mongorestore /data/backup
```

---

## 📈 Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:8000/docs

# Frontend health
curl http://localhost/

# MongoDB health
docker exec product-shop-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Container Logs
```bash
# Follow all logs
docker-compose logs -f --tail=100

# Export logs to file
docker-compose logs > logs.txt
```

---

## 🚀 Performance Optimization

### Scale Backend (Multiple Instances)
```bash
docker-compose up -d --scale backend=3
```

### Limit Resources
Edit `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

---

## ✅ Verification Checklist

- [ ] All containers running: `docker-compose ps`
- [ ] Backend accessible: http://localhost:8000/docs
- [ ] Frontend accessible: http://localhost
- [ ] MongoDB connected: Check backend logs
- [ ] Health checks passing: `docker ps` (healthy status)
- [ ] JWT_SECRET configured in `.env`

---

**Your app is now containerized! 🎉**
