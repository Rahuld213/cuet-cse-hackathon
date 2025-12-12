# Brilliant Cloud Deployment Guide

## Server Information

- **Floating IP**: `36.255.71.118`
- **Provider**: Brilliant Cloud

---

## Prerequisites

1. **SSH Access**

   ```bash
   ssh root@36.255.71.118
   # or
   ssh user@36.255.71.118
   ```

2. **Required Software on Server**
   - Docker
   - Docker Compose
   - Git (optional)

---

## Deployment Options

### Option 1: Docker Compose Deployment (Recommended)

#### Step 1: Copy Files to Server

```bash
# From your local machine
scp -r . user@36.255.71.118:/opt/delineate-app/
```

#### Step 2: SSH into Server

```bash
ssh user@36.255.71.118
cd /opt/delineate-app
```

#### Step 3: Update Environment Variables

```bash
# Edit .env file
nano .env
```

Update these values:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# S3 Configuration
S3_REGION=us-east-1
S3_ENDPOINT=http://delineate-minio:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=downloads
S3_FORCE_PATH_STYLE=true

# Observability
SENTRY_DSN=your-sentry-dsn-here
OTEL_EXPORTER_OTLP_ENDPOINT=http://delineate-jaeger:4318

# Rate Limiting
REQUEST_TIMEOUT_MS=30000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# CORS - Update with your domain
CORS_ORIGINS=http://36.255.71.118,http://36.255.71.118:5173

# Download Delay Simulation
DOWNLOAD_DELAY_ENABLED=true
DOWNLOAD_DELAY_MIN_MS=10000
DOWNLOAD_DELAY_MAX_MS=200000
```

#### Step 4: Deploy with Docker Compose

```bash
# Production deployment
docker compose -f docker/compose.prod.yml up -d

# Check status
docker compose -f docker/compose.prod.yml ps

# View logs
docker compose -f docker/compose.prod.yml logs -f
```

---

### Option 2: Manual Docker Deployment

#### Build and Push Images

```bash
# Build production image
docker build -f docker/Dockerfile.prod -t delineate-app:latest .

# Save and transfer
docker save delineate-app:latest | gzip > delineate-app.tar.gz
scp delineate-app.tar.gz user@36.255.71.118:/tmp/

# On server
ssh user@36.255.71.118
docker load < /tmp/delineate-app.tar.gz
```

---

### Option 3: Git-based Deployment

#### On Server

```bash
# Clone repository
cd /opt
git clone <your-repo-url> delineate-app
cd delineate-app

# Create .env file
cp .env.example .env
nano .env

# Deploy
docker compose -f docker/compose.prod.yml up -d
```

---

## Nginx Reverse Proxy Configuration

Create `/etc/nginx/sites-available/delineate`:

```nginx
# API Server
server {
    listen 80;
    server_name 36.255.71.118;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Frontend
server {
    listen 80;
    server_name app.36.255.71.118;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/delineate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Firewall Configuration

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow specific ports (if not using nginx)
sudo ufw allow 3000/tcp  # API
sudo ufw allow 5173/tcp  # Frontend
sudo ufw allow 9001/tcp  # MinIO Console
sudo ufw allow 16686/tcp # Jaeger UI

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## Access URLs

After deployment:

- **API**: http://36.255.71.118:3000
- **Frontend**: http://36.255.71.118:5173
- **MinIO Console**: http://36.255.71.118:9001
- **Jaeger UI**: http://36.255.71.118:16686

With Nginx:

- **API**: http://36.255.71.118
- **Frontend**: http://app.36.255.71.118

---

## Health Check

```bash
# Check API health
curl http://36.255.71.118:3000/health

# Check all services
docker compose -f docker/compose.prod.yml ps
```

---

## Troubleshooting

### Check Logs

```bash
# All services
docker compose -f docker/compose.prod.yml logs

# Specific service
docker logs delineate-delineate-app-1

# Follow logs
docker compose -f docker/compose.prod.yml logs -f
```

### Restart Services

```bash
docker compose -f docker/compose.prod.yml restart
```

### Stop Services

```bash
docker compose -f docker/compose.prod.yml down
```

### Clean Restart

```bash
docker compose -f docker/compose.prod.yml down -v
docker compose -f docker/compose.prod.yml up -d
```

---

## SSL/HTTPS Setup (Optional)

### Using Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d 36.255.71.118

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Monitoring

### Check Resource Usage

```bash
# Docker stats
docker stats

# System resources
htop
df -h
free -h
```

### Set up Monitoring

```bash
# Install monitoring tools
docker run -d --name=cadvisor \
  -p 8080:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  google/cadvisor:latest
```

---

## Backup Strategy

```bash
# Backup MinIO data
docker run --rm \
  -v delineate_minio-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/minio-backup-$(date +%Y%m%d).tar.gz /data

# Backup environment
cp .env .env.backup
```

---

## Quick Commands Reference

```bash
# Deploy
docker compose -f docker/compose.prod.yml up -d

# Status
docker compose -f docker/compose.prod.yml ps

# Logs
docker compose -f docker/compose.prod.yml logs -f

# Restart
docker compose -f docker/compose.prod.yml restart

# Stop
docker compose -f docker/compose.prod.yml down

# Update
git pull
docker compose -f docker/compose.prod.yml up -d --build
```
