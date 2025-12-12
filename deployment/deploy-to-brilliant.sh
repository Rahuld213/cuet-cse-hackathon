#!/bin/bash

# Brilliant Cloud Deployment Script
# Server IP: 36.255.71.118

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="36.255.71.118"
SERVER_USER="${SERVER_USER:-root}"
DEPLOY_PATH="/opt/delineate-app"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Brilliant Cloud Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Server IP: ${YELLOW}${SERVER_IP}${NC}"
echo -e "User: ${YELLOW}${SERVER_USER}${NC}"
echo -e "Deploy Path: ${YELLOW}${DEPLOY_PATH}${NC}"
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
    echo -e "${YELLOW}Warning: No SSH key found. You may need to enter password multiple times.${NC}"
    echo -e "${YELLOW}Consider setting up SSH key authentication.${NC}"
    echo ""
fi

# Test SSH connection
echo -e "${YELLOW}Testing SSH connection...${NC}"
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${SERVER_USER}@${SERVER_IP} exit 2>/dev/null; then
    echo -e "${GREEN}✓ SSH connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect to server${NC}"
    echo -e "${YELLOW}Please ensure:${NC}"
    echo "  1. Server is running"
    echo "  2. SSH is enabled"
    echo "  3. You have correct credentials"
    echo "  4. Firewall allows SSH (port 22)"
    exit 1
fi

# Create deployment directory on server
echo -e "\n${YELLOW}Creating deployment directory...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${DEPLOY_PATH}"

# Copy files to server
echo -e "${YELLOW}Copying files to server...${NC}"
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '*.log' \
    --exclude '.env' \
    ./ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

# Copy .env.example as .env if .env doesn't exist
echo -e "${YELLOW}Setting up environment file...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "cd ${DEPLOY_PATH} && [ ! -f .env ] && cp .env.example .env || echo '.env already exists'"

# Install Docker if not present
echo -e "\n${YELLOW}Checking Docker installation...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    rm get-docker.sh
else
    echo "Docker is already installed"
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "Docker Compose is already installed"
fi
ENDSSH

# Deploy with Docker Compose
echo -e "\n${YELLOW}Deploying application...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
cd ${DEPLOY_PATH}

# Stop existing containers
echo "Stopping existing containers..."
docker compose -f docker/compose.prod.yml down 2>/dev/null || true

# Pull latest images
echo "Pulling Docker images..."
docker compose -f docker/compose.prod.yml pull 2>/dev/null || true

# Start services
echo "Starting services..."
docker compose -f docker/compose.prod.yml up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check status
echo ""
echo "Container Status:"
docker compose -f docker/compose.prod.yml ps

# Check health
echo ""
echo "Health Check:"
curl -s http://localhost:3000/health || echo "Health check failed"
ENDSSH

# Display access information
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Access URLs:${NC}"
echo -e "  API:      http://${SERVER_IP}:3000"
echo -e "  Frontend: http://${SERVER_IP}:5173"
echo -e "  MinIO:    http://${SERVER_IP}:9001"
echo -e "  Jaeger:   http://${SERVER_IP}:16686"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  SSH:      ssh ${SERVER_USER}@${SERVER_IP}"
echo -e "  Logs:     ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker compose -f docker/compose.prod.yml logs -f'"
echo -e "  Restart:  ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker compose -f docker/compose.prod.yml restart'"
echo ""
echo -e "${GREEN}Done!${NC}"
