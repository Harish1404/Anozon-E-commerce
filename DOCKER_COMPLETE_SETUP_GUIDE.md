# 🚀 Complete Docker Setup & Containerization Guide

Complete guide to understand Docker and containerize the Anozon E-Commerce platform.

---

## What is Docker & Why You Need It?

**Docker is a containerization platform** that packages your application with all dependencies into a portable "container" that runs the same everywhere.

### Without Docker ❌
```
Developer 1: "It works on my machine!"
Developer 2: "Not on mine... I have different Python version"
DevOps: "But our production uses CentOS, not Ubuntu"
🤦 Hours wasted debugging environment issues
```

### With Docker ✅
```
One docker-compose up command
↓
Same application everywhere
↓
Developer machine = Staging = Production
🎉 Zero "works on my machine" problems
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│            Your Computer/Server                 │
├─────────────────────────────────────────────────┤
│  Internet Browser                               │
│  http://localhost:3000                          │
│         ↓                                        │
│  ┌──────────────────────────────────────────┐  │
│  │     Docker Network (Isolated)            │  │
│  ├──────────────────────────────────────────┤  │
│  │                                          │  │
│  │  ┌────────────────┐  ┌──────────────┐   │  │
│  │  │   MongoDB      │  │   Backend    │   │  │
│  │  │   (Database)   │--│   (FastAPI)  │   │  │
│  │  │   Port 27017   │  │   Port 8000  │   │  │
│  │  └────────────────┘  └──────────────┘   │  │
│  │         ↑                    ↑            │  │
│  │         └────────────────────┘            │  │
│  │                                          │  │
│  │  ┌──────────────────────────────────┐   │  │
│  │  │   Frontend (React + Nginx)       │   │  │
│  │  │   http://localhost:3000          │   │  │
│  │  └──────────────────────────────────┘   │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

All 3 containers run in an isolated Docker network where they can talk to each other!

---

## Step-by-Step Setup Process

### Phase 1: Installation (5 minutes)

#### 1.1 Install Docker Desktop
- **Download:** https://www.docker.com/products/docker-desktop
- **For Windows:** Docker Desktop for Windows
- **For Mac:** Docker Desktop for Mac
- **Restart your computer** after installation
- **Verify:** Open PowerShell and run:
  ```bash
  docker --version
  docker-compose --version
  ```

#### 1.2 Check Prerequisites
```bash
# Run these commands to verify
docker ps                    # Should work (empty list is fine)
docker image ls             # Should work
docker-compose --version    # Should show 2.0 or higher
```

---

### Phase 2: Project Preparation (2 minutes)

#### 2.1 Navigate to Project Root
```bash
# Open PowerShell and go to your project
cd C:\Users\HarishP\Documents\Anozon\Anozon-E-commerce

# Verify you're in the right place
ls

# Should show:
# Backend/
# Frontend/
# docker-compose.yml
# README.md
# DOCKER.md
```

#### 2.2 Create Environment File (.env)
This file contains secrets like your JWT token.

**Method A: Automated (Windows PowerShell)**
```powershell
# Generate a random secure secret
$secret = [System.Web.Security.Membership]::GeneratePassword(32, 8)

# Create .env file
"JWT_SECRET=$secret" | Set-Content .env

# Verify it was created
type .env
# Should show something like: JWT_SECRET=aB#$%1234567890...
```

**Method B: Manual (Notepad)**
1. Create a new file named `.env` in the project root
2. Add this line:
   ```
   JWT_SECRET=your_super_secret_key_change_in_production
   ```
3. Save the file

**⚠️ IMPORTANT:** 
- Keep `.env` file **SECRET**
- Never share or commit to Git
- It's in `.gitignore` (protected)

---

### Phase 3: Build Process (3-5 minutes)

#### 3.1 Build Docker Images

```bash
# Stand in project root and run:
docker-compose build

# What happens:
# 1. Reads docker-compose.yml
# 2. Reads Backend/dockerfile
#    - Downloads Python 3.11 base image
#    - Installs requirements from requirements.txt
#    - Takes ~1 minute
# 3. Reads Frontend/dockerfile  
#    - Downloads Node 18 base image
#    - Builds React app with npm
#    - Takes ~2 minutes
# 4. Downloads MongoDB 7.0 image from Docker Hub
#    - Takes ~30 seconds
```

**Progress you'll see:**
```
[+] Building 45.2s (15/15) FINISHED
 => [backend internal] load build definition from dockerfile
 => [backend internal] load .dockerignore
 => [backend base] pull python:3.11-slim
 => [backend base] resolve image config for python:3.11-slim
 ... (many more lines)
```

#### 3.2 Verify Images Were Created

```bash
# List all images on your computer
docker image ls

# You should see:
# REPOSITORY                   TAG       IMAGE ID
# product-shop-backend         latest    abc123...
# product-shop-frontend        latest    def456...
# mongo                         7.0       ghi789...
```

---

### Phase 4: Start Services (30 seconds)

#### 4.1 Launch All Containers

```bash
# Start all 3 services in background
docker-compose up -d

# You should see:
# [+] Running 4/4
#  ✔ Network product-shop-network  Created
#  ✔ Container product-shop-mongodb  Started
#  ✔ Container product-shop-backend  Started
#  ✔ Container product-shop-frontend  Started
```

#### 4.2 What Actually Happens

When you run `docker-compose up -d`:

1. **Creates a network** (isolated communication)
   - All containers can talk to each other
   - External traffic only comes through ports 3000, 8000

2. **Starts MongoDB container**
   - Creates `/data/db` directory for data persistence
   - Listens on port 27017
   - Stays running

3. **Starts Backend container**
   - Runs Python FastAPI server
   - Connects to MongoDB automatically
   - Listens on port 8000

4. **Starts Frontend container**
   - Runs Nginx web server
   - Serves React build files
   - Listens on port 3000 (mapped from container port 80)

---

### Phase 5: Verification (1 minute)

#### 5.1 Check Container Health

```bash
# Check status
docker-compose ps

# Expected output (wait 20-30 seconds after starting):
NAME                      STATUS              PORTS
product-shop-mongodb      Up (healthy)        27017/tcp
product-shop-backend      Up (healthy)        0.0.0.0:8000->8000/tcp
product-shop-frontend     Up (healthy)        0.0.0.0:3000->80/tcp

# ✅ All should show "Up (healthy)"
```

#### 5.2 Test Backend API

```bash
# Test backend is running
curl http://localhost:8000/docs

# Should return HTML content (Swagger UI)
# Or visit http://localhost:8000/docs in browser
```

#### 5.3 Test Frontend App

```bash
# Test frontend is running
curl http://localhost:3000

# Should return HTML content (React app)
# Or visit http://localhost:3000 in browser
```

---

### Phase 6: Test Application (2 minutes)

#### 6.1 Open in Browser

| What | URL |
|------|-----|
| **Frontend App** | http://localhost:3000 |
| **API Documentation** | http://localhost:8000/docs |
| **Backend Status** | http://localhost:8000/health |

#### 6.2 Test Functionality

```
✓ Frontend loads
✓ Can see products
✓ Can create account (Signs up)
✓ Can login
✓ Can add to cart
✓ Can view API docs at /docs
```

---

## 🎯 Common Workflows

### Workflow 1: Daily Development

```bash
# Morning - Start everything
docker-compose up -d

# Code... edit files in Backend/ or Frontend/

# Made changes? Rebuild the service
docker-compose up -d --build backend     # If backend changed
docker-compose up -d --build frontend    # If frontend changed

# Watch logs while developing
docker-compose logs -f backend

# Evening - Stop everything
docker-compose down
```

### Workflow 2: Debug Issues

```bash
# Problem: Service unhealthy
# Solution: Check logs
docker-compose logs backend              # See what's wrong
docker-compose logs frontend
docker-compose logs mongodb

# Restart the problematic service
docker-compose restart backend

# Check status again
docker-compose ps

# Still broken? Full rebuild
docker-compose down
docker-compose up -d --build
```

### Workflow 3: Database Management

```bash
# Access MongoDB shell
docker exec -it product-shop-mongodb mongosh

# Inside mongosh:
show dbs                              # List databases
use product_shop_db                   # Switch database
show collections                      # List collections
db.users.find().pretty()              # Show all users
db.products.find().limit(1).pretty()  # Show one product

# Create new user manually
db.users.insertOne({
  name: "Test User",
  email: "test@example.com",
  created_at: new Date()
})

# Exit
exit
```

### Workflow 4: Share with Team

```bash
# 1. Push code to GitHub
git add .
git commit -m "Feature: Add dark mode"
git push

# 2. Team member pulls code
git pull

# 3. They run
docker-compose down -v        # Clean slate
docker-compose up -d --build  # Rebuild with new code

# They instantly have exact same environment!
```

---

## 🆘 Troubleshooting Guide

### Problem: "Docker not found" / "docker-compose not found"

**Cause:** Docker not installed or not in PATH
**Solution:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Run the installer
3. **Restart your computer**
4. Try again

### Problem: Containers stuck in "starting" state

**Cause:** Containers still initializing, databases connecting
**Solution:**
```bash
wait 30 seconds
docker-compose ps
# Should show "healthy" now
```

### Problem: "Port 3000 already in use"

**Cause:** Another application using port 3000
**Solution:**
```bash
# Edit docker-compose.yml
# Find: ports: - "3000:80"
# Change to: - "3001:80"
# Then restart
docker-compose down
docker-compose up -d
```

### Problem: Frontend shows blank page

**Cause:** Backend not accessible from frontend
**Solution:**
```bash
# Check backend is running
docker-compose logs backend

# Check if they can communicate
docker exec product-shop-frontend ping backend
# Should show: "backend is reachable"
```

### Problem: "EACCES: permission denied"

**Cause:** Docker running without proper permissions
**Solution (Windows):**
- Run PowerShell as Administrator
- Or use Docker Desktop terminal

---

## ✅ Success Checklist

Before you move forward, verify:

- [ ] Docker Desktop installed and working (`docker --version`)
- [ ] Docker Compose installed and working (`docker-compose --version`)
- [ ] `.env` file created in project root
- [ ] `docker-compose build` completed successfully
- [ ] `docker-compose up -d` shows all containers running
- [ ] All containers show "Up (healthy)" status
- [ ] Frontend loads at http://localhost:3000
- [ ] API Docs load at http://localhost:8000/docs
- [ ] Can sign up a user
- [ ] Can create a product (if logged in as admin)
- [ ] No errors in `docker-compose logs`

---

## 🎓 What You Learned

You now understand:

1. ✅ **What Docker is** - Containerization platform
2. ✅ **Why Docker helps** - Consistent environments everywhere
3. ✅ **How to build images** - `docker-compose build`
4. ✅ **How to run containers** - `docker-compose up -d`
5. ✅ **How to debug** - `docker-compose logs`
6. ✅ **How to manage services** - Start, stop, restart, rebuild

---

## 🚀 Next Steps

### Short Term (Now)
- [ ] Run the setup completely from scratch
- [ ] Deploy to a staging environment
- [ ] Share docker-compose with your team
- [ ] Everyone can run `docker-compose up -d` and work

### Long Term (Later)
- [ ] Push images to Docker Hub
- [ ] Deploy to AWS/DigitalOcean/Heroku
- [ ] Set up CI/CD pipeline
- [ ] Move to Kubernetes

---

**Congratulations! You've containerized a full-stack application! 🎉**

**Happy containerizing! 🐳**
