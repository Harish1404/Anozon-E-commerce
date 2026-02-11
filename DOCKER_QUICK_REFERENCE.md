# 🐳 Docker Quick Reference Card

## 📋 Setup (One Time)

```bash
# 1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
# 2. Restart your computer
# 3. Open PowerShell and navigate to project:

cd C:\Users\HarishP\Documents\Anozon\Anozon-E-commerce

# 4. Create .env file:
$secret = [System.Web.Security.Membership]::GeneratePassword(32, 8)
"JWT_SECRET=$secret" | Set-Content .env

# 5. Build images:
docker-compose build

# 6. Start services:
docker-compose up -d

# 7. Verify (wait 20-30 seconds, then run):
docker-compose ps
```

## 🚀 Daily Development

```bash
# Start work
docker-compose up -d

# Edit code (backend or frontend)

# Rebuild changed service
docker-compose up -d --build backend    # Backend changes
docker-compose up -d --build frontend   # Frontend changes

# View logs while developing
docker-compose logs -f backend

# Stop for the day
docker-compose down
```

## 🔍 Debugging Commands

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Check container status
docker-compose ps

# Execute command in container
docker exec -it product-shop-backend bash
docker exec -it product-shop-mongodb mongosh

# Monitor resources
docker stats
```

## 🛠️ Maintenance Commands

```bash
# Restart all services
docker-compose restart

# Rebuild everything from scratch
docker-compose down
docker-compose up -d --build

# Stop and remove all data
docker-compose down -v

# Remove unused images/containers
docker system prune

# Update .env and reload
# 1. Edit .env file
# 2. docker-compose restart backend
```

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend (API) | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |
| MongoDB | localhost:27017 |

## 📊 Container Status Meanings

| Status | Meaning | Action |
|--------|---------|--------|
| Up (healthy) | ✅ Working correctly | None needed |
| Up (unhealthy) | ⚠️ Started but has issues | Check logs |
| Up (starting) | 🟡 Still initializing | Wait 10 seconds |
| Exited | ❌ Stopped/Failed | Restart or check logs |

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | Edit docker-compose.yml: `3000:80` → `3001:80` |
| Port 8000 in use | Edit docker-compose.yml: `8000:8000` → `8001:8000` |
| Container unhealthy | `docker-compose logs backend` then `docker-compose restart backend` |
| `.env` not loading | Delete `.env` and recreate: `"JWT_SECRET=test" > .env` |
| MongoDB can't connect | `docker-compose down -v && docker-compose up -d --build` |
| Nothing works | Full reset: `docker system prune -a --volumes` then rebuild |

## 📁 File Structure

```
Anozon-E-commerce/
├── Backend/
│   ├── dockerfile          (Build instructions)
│   ├── requirements.txt
│   └── app/
├── Frontend/
│   ├── dockerfile          (Build instructions)
│   ├── nginx.conf          (Web server config)
│   └── src/
├── docker-compose.yml      (Everything in one file!)
├── .env                    (Your secrets - DON'T commit!)
├── DOCKER.md              (Detailed guide)
├── setup-docker.ps1       (Automated setup script)
└── README.md
```

## 🔐 Security Reminders

- ✅ `.env` is in `.gitignore` (doesn't get committed)
- ✅ JWT_SECRET is generated randomly
- ✅ Containers run as non-root user
- ✅ MongoDB data persists in named volume
- ✅ Update JWT_SECRET before production!

## 💡 Pro Tips

```bash
# Automatically rebuild when you save code?
# Install watchdog and use:
docker-compose watch

# Want to use 2 backend instances?
docker-compose up -d --scale backend=2

# Check what images you have
docker image ls

# Remove old images to save disk space
docker image prune -a

# See what volumes store your data
docker volume ls
```

## 📞 Getting Help

1. **Check logs first:** `docker-compose logs -f`
2. **Read DOCKER.md:** Has detailed guide
3. **Check docker-compose.yml:** Verify all settings
4. **Restart everything:** `docker-compose down -v && docker-compose up -d --build`
5. **Docker docs:** https://docs.docker.com/

## 🎯 Next Steps

- [ ] Complete setup with one-time commands
- [ ] Test at http://localhost:3000
- [ ] Create test user
- [ ] View logs: `docker-compose logs -f`
- [ ] Make a code change and rebuild

---

**Saved time with Docker! 🚀**
