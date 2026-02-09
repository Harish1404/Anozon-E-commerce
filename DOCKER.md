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
docker-compose build mongodb  # Usually just pulled, not built
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

# Stop with Ctrl+C if in attach mode
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
- **Swagger UI:** http://localhost:8000/docs (interactive)

### Step 7: View Logs (For Debugging)

Monitor what's happening:
```bash
# See all container logs
docker-compose logs -f --tail=100

# Follow specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# See only recent errors
docker-compose logs backend | grep -i error
```

### Step 8: Access MongoDB from Host (Optional)

If you want to query MongoDB directly:

```bash
# Access MongoDB shell
docker exec -it product-shop-mongodb mongosh

# Inside mongosh shell:
show dbs
use product_shop_db
show collections
db.users.find().pretty()
db.products.find().limit(1).pretty()

# Exit MongoDB
exit
```

---

## 🔧 Building Images Individually

### Build Backend Only
```bash
# Build the image
docker build -t product-shop-backend:latest ./Backend

# Verify image was created
docker image ls | grep product-shop-backend

# Run manually (optional)
docker run -d \
  -e MONGO_URL=mongodb://host.docker.internal:27017 \
  -e JWT_SECRET=test_secret \
  -p 8000:8000 \
  --name backend-test \
  product-shop-backend:latest
```

### Build Frontend Only
```bash
# Build the image
docker build -t product-shop-frontend:latest \
  --build-arg VITE_API_URL=http://localhost:8000 \
  ./Frontend

# Verify image was created
docker image ls | grep product-shop-frontend

# Run manually (optional)
docker run -d \
  -p 3000:80 \
  --name frontend-test \
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
docker-compose exec backend python -c "import sys; print(sys.version)"
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

# Clean specific service data
docker-compose down -v mongodb  # Remove only MongoDB data

# Show disk usage
docker system df
```

---

## 🔄 Updates & Code Changes

### After Editing Backend Code

```bash
# Option 1: Rebuild and restart (recommended)
docker-compose down
docker-compose up -d --build backend

# Option 2: Just rebuild and restart backend
docker-compose up -d --build backend

# Option 3: Rebuild only without restarting others
docker-compose build backend
docker-compose up -d backend

# Verify changes took effect
docker-compose logs -f backend
```

### After Editing Frontend Code

```bash
# Rebuild and restart frontend
docker-compose up -d --build frontend

# View frontend logs to ensure it started successfully
docker-compose logs -f frontend
```

### After Editing Dockerfile

Simply rebuild:
```bash
# Force rebuild ignoring cache
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Database Migrations / Manual Updates

```bash
# Connect to MongoDB and run commands
docker exec -it product-shop-mongodb mongosh

# Commands inside mongosh:
use product_shop_db
db.users.updateMany({}, { $set: { status: "active" } })
db.users.find().count()
```

---

## 🌐 Access URLs & Configuration

### Application URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **API Redoc:** http://localhost:8000/redoc
- **MongoDB (internal/external):** localhost:27017

---

## 🔐 Environment Setup

### Generate Secure JWT Secret
```bash
# Option 1: Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Option 2: Using OpenSSL
openssl rand -base64 32
```

### Create .env File
```bash
# Create .env file in project root
cat > .env << EOF
JWT_SECRET=your_generated_secret_here
EOF
```

### Verify Environment
```bash
# Check if .env is loaded
docker-compose config | grep JWT_SECRET
```

---

## 🎯 Complete Containerization Workflow

This section gives you the exact sequence of commands to containerize everything.

### Workflow Summary
```
1. Install Docker ✓
2. Create .env file ✓
3. Build images (docker-compose build)
4. Start services (docker-compose up -d)
5. Verify health (docker-compose ps)
6. Test application (open browser)
7. Monitor logs (docker-compose logs -f)
```

### Detailed Workflow with Verification

**Step 1: Install Docker Desktop**
- Download from https://www.docker.com/products/docker-desktop
- Install and restart your system
- Verify: `docker --version && docker-compose --version`

**Step 2: Navigate to Project**
```bash
cd C:\Users\HarishP\Documents\Anozon\Anozon-E-commerce

# Verify you see these files:
# ├── Backend/
# ├── Frontend/
# ├── docker-compose.yml
# ├── README.md
# └── .env (you'll create this next)
```

**Step 3: Create .env File**
```bash
# Windows PowerShell:
$secret = [System.Web.Security.Membership]::GeneratePassword(32, 8)
"JWT_SECRET=$secret" | Set-Content .env

# Verify it was created:
type .env
# Should show: JWT_SECRET=<long_random_string>
```

**Step 4: Build All Docker Images**
```bash
# Build all images (this takes 3-5 minutes, downloads dependencies)
docker-compose build

# Watch the output - you'll see:
# Building backend ... done
# Pulling mongodb ...
# Building frontend ... done

# Verify images were created:
docker image ls

# You should see:
# product-shop-backend     latest
# product-shop-frontend    latest
# mongo                     7.0
```

**Step 5: Start All Services**
```bash
# Start containers in background
docker-compose up -d

# You should see:
# [+] Running 4/4
#  ✔ Network product-shop-network Created
#  ✔ Container product-shop-mongodb Started
#  ✔ Container product-shop-backend Started
#  ✔ Container product-shop-frontend Started
```

**Step 6: Wait for Health Checks**
```bash
# Wait 20-30 seconds for containers to be healthy
# Then check status
docker-compose ps

# Expected output:
# NAME                        STATUS              PORTS
# product-shop-mongodb        Up (healthy)        27017/tcp
# product-shop-backend        Up (healthy)        0.0.0.0:8000->8000/tcp
# product-shop-frontend       Up (healthy)        0.0.0.0:3000->80/tcp

# ✅ All should show "Up (healthy)"
```

**Step 7: Test Application**
```bash
# Test backend API
curl http://localhost:8000/docs
# Should return HTML (API documentation)

# Test frontend
curl http://localhost:3000
# Should return HTML (React app)
```

**Step 8: Open in Browser**
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

**Step 9: View Logs (Debugging)**
```bash
# See all logs in real-time
docker-compose logs -f

# See only backend logs
docker-compose logs -f backend

# See only frontend logs
docker-compose logs -f frontend

# See only last 50 lines
docker-compose logs --tail=50

# Press Ctrl+C to exit logs
```

**Step 10: Stop Services (When Done)**
```bash
# Stop all services
docker-compose down

# Stop and remove data
docker-compose down -v

# Stop and remove images
docker-compose down --rmi all
```

---

### Troubleshooting During Setup

**Issue: "Docker not found" error**
Solutions:
- Restart your terminal after installing Docker
- Restart your computer
- Add Docker to PATH (Windows): https://docs.docker.com/desktop/install/windows-install/

**Issue: "Permission denied" error**
Solutions (Windows):
- Run PowerShell as Administrator
- Create .env manually using Notepad
- Use Docker Desktop terminal instead

**Issue: "Port 3000 already in use"**
Solution:
- Edit docker-compose.yml and change `3000:80` to `3001:80`
- Then restart: `docker-compose down && docker-compose up -d`

**Issue: "Containers not starting" / "Unhealthy"**
Steps:
1. Check logs: `docker-compose logs backend`
2. Look for error messages
3. Stop and rebuild: `docker-compose down && docker-compose up -d --build`
4. Wait 30 seconds and check again: `docker-compose ps`

---

## 🐛 Troubleshooting

### Backend Not Starting / Service Unhealthy
```bash
# Check logs
docker-compose logs backend

# Common issue: Healthcheck using curl (not installed)
# Solution: Already fixed in docker-compose.yml - uses Python instead

# Restart backend
docker-compose restart backend

# Check if MongoDB is connected
docker-compose logs backend | grep -i mongo
```

### Frontend Not Loading (Port 80 Error)
**Issue:** Port 80 requires root/admin privileges on Linux/Mac
**Solution:** Already changed to port 3000 in docker-compose.yml
```bash
# If you see "permission denied" error, use:
docker-compose up -d  # Run as root/with sudo, or use port 3000 instead
```

### Frontend Not Loading (Blank Page)
```bash
# Check nginx logs and verify backend connectivity
docker-compose logs frontend

# Verify backend is accessible from frontend container
docker exec product-shop-frontend wget -O- http://backend:8000/docs

# Check if VITE_API_URL is correctly set
docker inspect product-shop-frontend | grep VITE_API_URL
```

### MongoDB Connection Issues
```bash
# Access MongoDB shell
docker exec -it product-shop-mongodb mongosh

# Inside mongosh shell:
show dbs
use product_shop_db
show collections
db.users.find().limit(1)

# Test connection from backend
docker exec product-shop-backend python -c \
  "from pymongo import MongoClient; \
   client = MongoClient('mongodb://mongodb:27017'); \
   print('Connected:', client.admin.command('ping'))"
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
# Verify .env file exists in project root
ls -la .env

# Check if variables are loaded
docker-compose config | grep JWT_SECRET

# If not loaded, create it:
echo 'JWT_SECRET=test_secret_key' > .env
```

### Container Hostname Resolution Issues
```bash
# Verify network exists
docker network ls | grep product-shop

# Inspect network
docker network inspect anozon-e-commerce_product-shop-network

# Test DNS between containers
docker exec product-shop-backend ping mongodb
docker exec product-shop-frontend ping backend
```

### Clean Rebuild After Issues
```bash
# Stop all services
docker-compose down

# Remove volumes to reset database
docker-compose down -v

# Remove images to rebuild from scratch
docker rmi product-shop-backend product-shop-frontend

# Rebuild everything
docker-compose up -d --build

# Verify health
docker-compose ps
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

## 🚀 What's Next?

### Option 1: Daily Development
```bash
# Every morning
docker-compose up -d

# Work on code...

# Make changes, rebuild only what changed:
docker-compose up -d --build backend    # Backend changes
docker-compose up -d --build frontend   # Frontend changes

# Before bed
docker-compose down -v  # Clean shutdown + remove data
```

### Option 2: Deploy to Production Cloud
```bash
# 1. Create accounts at:
#    - Docker Hub: https://hub.docker.com
#    - AWS/DigitalOcean/Heroku
#
# 2. Tag images for registry
docker tag product-shop-backend:latest yourusername/product-shop-backend:1.0
docker tag product-shop-frontend:latest yourusername/product-shop-frontend:1.0

# 3. Push to Docker Hub
docker login
docker push yourusername/product-shop-backend:1.0
docker push yourusername/product-shop-frontend:1.0

# 4. Deploy on cloud platform
# (Follow their Docker deployment guides)
```

### Option 3: Run in Production Locally
```bash
# Ensure maximum security
# 1. Update JWT_SECRET to something very strong
# 2. Set ENVIRONMENT=production in docker-compose.yml
# 3. Use different database (separate MongoDB server)

docker-compose -f docker-compose.yml up -d
```

---

## 📊 Useful Monitoring After Setup

```bash
# Watch containers in real-time
watch docker-compose ps

# Monitor resource usage
docker stats

# Check specific service health
docker-compose exec backend curl http://localhost:8000/docs

# View only errors in logs
docker-compose logs | grep -i error
```

---

## ✅ Final Verification Checklist

After setup, verify everything works:

- [ ] **Docker is installed:** `docker --version` returns 20.10+
- [ ] **Docker Compose is installed:** `docker-compose --version` returns 2.0+
- [ ] **Project folder exists:** `C:\Users\HarishP\Documents\Anozon\Anozon-E-commerce`
- [ ] **.env file created:** Contains JWT_SECRET
- [ ] **Images built:** `docker image ls` shows 3+ images
- [ ] **All containers running:** `docker-compose ps` shows all "Up"
- [ ] **All containers healthy:** All show "(healthy)" status
- [ ] **Backend accessible:** http://localhost:8000/docs works
- [ ] **Frontend accessible:** http://localhost:3000 loads
- [ ] **MongoDB connected:** Backend logs show successful connection
- [ ] **Can create data:** Sign up a user, create a product
- [ ] **Logs visible:** `docker-compose logs -f` shows real-time output

---

## 🎉 Congratulations!

Your application is now fully containerized and ready to use!

### You can now:
✅ Build it once, run it anywhere
✅ Share containers with your team
✅ Deploy to production easily
✅ Scale services as needed
✅ Use consistent environments
✅ Debug with Docker logs
✅ Backup and restore data easily

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
