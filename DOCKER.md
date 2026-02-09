# 🐳 Docker Deployment Guide

## Quick Start

### 1. Start All Services
```bash
docker-compose up -d
```

### 2. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 3. Stop All Services
```bash
docker-compose down
```

### 4. Stop and Remove Volumes (Clean Reset)
```bash
docker-compose down -v
```

---

## 🔧 Individual Service Commands

### Backend Only
```bash
# Build
docker build -t product-shop-backend ./Backend

# Run
docker run -d -p 8000:8000 --name backend product-shop-backend
```

### Frontend Only
```bash
# Build
docker build -t product-shop-frontend ./Frontend

# Run
docker run -d -p 80:80 --name frontend product-shop-frontend
```

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
