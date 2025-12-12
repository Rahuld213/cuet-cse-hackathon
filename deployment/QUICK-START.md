# Quick Start - Brilliant Cloud Deployment

## Server Information

- **IP Address**: `36.255.71.118`
- **Provider**: Brilliant Cloud

---

## 🚀 Quick Deploy (Recommended)

### Windows (PowerShell)

```powershell
cd deployment
.\deploy-to-brilliant.ps1
```

### Linux/Mac (Bash)

```bash
cd deployment
chmod +x deploy-to-brilliant.sh
./deploy-to-brilliant.sh
```

---

## 📋 Manual Deployment Steps

### 1. Connect to Server

```bash
ssh root@36.255.71.118
# or
ssh your-username@36.255.71.118
```

### 2. Install Docker (if not installed)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Start Docker
sudo systemctl enable docker
sudo systemctl start docker
```

### 3. Upload Project Files

**Option A: Using Git**

```bash
cd /opt
git clone <your-repo-url> delineate-app
cd delineate-app
```

**Option B: Using SCP (from your local machine)**

```bash
# Create archive
tar -czf delineate-app.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  .

# Upload
scp delineate-app.tar.gz root@36.255.71.118:/opt/

# On server
ssh root@36.255.71.118
cd /opt
tar -xzf delineate-app.tar.gz
mv <extracted-folder> delineate-app
cd delineate-app
```

### 4. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

Update these important values:

```env
NODE_ENV=production
CORS_ORIGINS=http://36.255.71.118,http://36.255.71.118:5173
```

### 5. Deploy

```bash
# Start all services
docker compose -f docker/compose.prod.yml up -d

# Check status
docker compose -f docker/compose.prod.yml ps

# View logs
docker compose -f docker/compose.prod.yml logs -f
```

---

## ✅ Verify Deployment

### Check Services

```bash
# On server
docker compose -f docker/compose.prod.yml ps

# Should show:
# - delineate-app (running)
# - delineate-minio (healthy)
```

### Test API

```bash
# From your local machine
curl http://36.255.71.118:3000/health

# Expected response:
# {"status":"healthy","checks":{"storage":"ok"}}
```

### Access URLs

- **API**: http://36.255.71.118:3000
- **API Docs**: http://36.255.71.118:3000/docs
- **Frontend**: http://36.255.71.118:5173
- **MinIO Console**: http://36.255.71.118:9001
- **Jaeger UI**: http://36.255.71.118:16686

---

## 🔧 Common Commands

### View Logs

```bash
# All services
docker compose -f docker/compose.prod.yml logs -f

# Specific service
docker logs delineate-delineate-app-1 -f
```

### Restart Services

```bash
docker compose -f docker/compose.prod.yml restart
```

### Stop Services

```bash
docker compose -f docker/compose.prod.yml down
```

### Update Deployment

```bash
# Pull latest changes (if using git)
git pull

# Rebuild and restart
docker compose -f docker/compose.prod.yml up -d --build
```

---

## 🔒 Security Checklist

### 1. Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3000/tcp # API
sudo ufw allow 5173/tcp # Frontend

# Enable firewall
sudo ufw enable
```

### 2. Change Default Credentials

Edit `.env` and update:

```env
S3_ACCESS_KEY_ID=your-secure-key
S3_SECRET_ACCESS_KEY=your-secure-secret
```

Then restart:

```bash
docker compose -f docker/compose.prod.yml restart
```

### 3. Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install certbot

# Get certificate (requires domain name)
sudo certbot certonly --standalone -d your-domain.com
```

---

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check logs
docker compose -f docker/compose.prod.yml logs

# Check disk space
df -h

# Check memory
free -h
```

### Cannot Access from Browser

1. Check firewall rules
2. Verify services are running: `docker ps`
3. Check if ports are listening: `netstat -tlnp | grep -E '3000|5173'`

### MinIO Not Healthy

```bash
# Check MinIO logs
docker logs delineate-delineate-minio-1

# Restart MinIO
docker compose -f docker/compose.prod.yml restart delineate-minio
```

### API Returns 500 Error

```bash
# Check API logs
docker logs delineate-delineate-app-1

# Check environment variables
docker exec delineate-delineate-app-1 env | grep S3
```

---

## 📊 Monitoring

### Check Resource Usage

```bash
# Docker stats
docker stats

# System resources
htop
```

### Health Monitoring Script

Create `/opt/health-check.sh`:

```bash
#!/bin/bash
curl -f http://localhost:3000/health || echo "API is down!"
```

Add to crontab:

```bash
crontab -e
# Add: */5 * * * * /opt/health-check.sh
```

---

## 🔄 Backup & Restore

### Backup MinIO Data

```bash
docker run --rm \
  -v delineate_minio-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/minio-$(date +%Y%m%d).tar.gz /data
```

### Restore MinIO Data

```bash
docker compose -f docker/compose.prod.yml down
docker run --rm \
  -v delineate_minio-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/minio-YYYYMMDD.tar.gz -C /
docker compose -f docker/compose.prod.yml up -d
```

---

## 📞 Support

If you encounter issues:

1. Check logs: `docker compose -f docker/compose.prod.yml logs`
2. Verify environment: `cat .env`
3. Check connectivity: `curl http://localhost:3000/health`
4. Review documentation: `deployment/brilliant-cloud-setup.md`

---

## 🎉 Success!

Once deployed, you should be able to access:

- ✅ API at http://36.255.71.118:3000
- ✅ Frontend at http://36.255.71.118:5173
- ✅ All services running and healthy

**Happy deploying!** 🚀
