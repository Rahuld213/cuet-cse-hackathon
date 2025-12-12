# Brilliant Cloud Deployment Script (PowerShell)
# Server IP: 36.255.71.118

param(
    [string]$ServerIP = "36.255.71.118",
    [string]$ServerUser = "root",
    [string]$DeployPath = "/opt/delineate-app"
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Brilliant Cloud Deployment" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Server IP: $ServerIP" -ForegroundColor Yellow
Write-Host "User: $ServerUser" -ForegroundColor Yellow
Write-Host "Deploy Path: $DeployPath`n" -ForegroundColor Yellow

# Check if SSH is available
Write-Host "Checking SSH availability..." -ForegroundColor Yellow
$sshAvailable = Get-Command ssh -ErrorAction SilentlyContinue
if (-not $sshAvailable) {
    Write-Host "✗ SSH not found. Please install OpenSSH or use WSL." -ForegroundColor Red
    Write-Host "`nInstall OpenSSH:" -ForegroundColor Yellow
    Write-Host "  Settings > Apps > Optional Features > Add OpenSSH Client" -ForegroundColor White
    exit 1
}
Write-Host "✓ SSH is available`n" -ForegroundColor Green

# Test SSH connection
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
$testConnection = ssh -o ConnectTimeout=5 -o BatchMode=yes "$ServerUser@$ServerIP" "exit" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ SSH connection successful`n" -ForegroundColor Green
} else {
    Write-Host "✗ Cannot connect to server" -ForegroundColor Red
    Write-Host "`nPlease ensure:" -ForegroundColor Yellow
    Write-Host "  1. Server is running" -ForegroundColor White
    Write-Host "  2. SSH is enabled" -ForegroundColor White
    Write-Host "  3. You have correct credentials" -ForegroundColor White
    Write-Host "  4. Firewall allows SSH (port 22)`n" -ForegroundColor White
    
    Write-Host "Attempting manual connection test..." -ForegroundColor Yellow
    Write-Host "If prompted, enter your password:`n" -ForegroundColor Yellow
    ssh "$ServerUser@$ServerIP" "echo 'Connection successful'"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n✗ Connection failed. Please check your credentials and try again." -ForegroundColor Red
        exit 1
    }
}

# Create deployment directory
Write-Host "Creating deployment directory..." -ForegroundColor Yellow
ssh "$ServerUser@$ServerIP" "mkdir -p $DeployPath"
Write-Host "✓ Directory created`n" -ForegroundColor Green

# Check if rsync is available, otherwise use scp
Write-Host "Copying files to server..." -ForegroundColor Yellow
$rsyncAvailable = Get-Command rsync -ErrorAction SilentlyContinue

if ($rsyncAvailable) {
    Write-Host "Using rsync for file transfer..." -ForegroundColor Cyan
    rsync -avz --progress `
        --exclude 'node_modules' `
        --exclude '.git' `
        --exclude 'dist' `
        --exclude '*.log' `
        --exclude '.env' `
        ./ "$ServerUser@${ServerIP}:$DeployPath/"
} else {
    Write-Host "Using scp for file transfer (this may take longer)..." -ForegroundColor Cyan
    Write-Host "Note: Install rsync for faster transfers`n" -ForegroundColor Yellow
    
    # Create a temporary archive
    $tempArchive = "deployment-temp.tar.gz"
    Write-Host "Creating archive..." -ForegroundColor Cyan
    
    if (Get-Command tar -ErrorAction SilentlyContinue) {
        tar -czf $tempArchive `
            --exclude='node_modules' `
            --exclude='.git' `
            --exclude='dist' `
            --exclude='*.log' `
            --exclude='.env' `
            .
        
        Write-Host "Uploading archive..." -ForegroundColor Cyan
        scp $tempArchive "$ServerUser@${ServerIP}:$DeployPath/"
        
        Write-Host "Extracting on server..." -ForegroundColor Cyan
        ssh "$ServerUser@$ServerIP" "cd $DeployPath && tar -xzf $tempArchive && rm $tempArchive"
        
        Remove-Item $tempArchive
    } else {
        Write-Host "✗ Neither rsync nor tar available. Please install one of them." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Files copied`n" -ForegroundColor Green

# Setup environment file
Write-Host "Setting up environment file..." -ForegroundColor Yellow
ssh "$ServerUser@$ServerIP" "cd $DeployPath && [ ! -f .env ] && cp .env.example .env || echo '.env already exists'"
Write-Host "✓ Environment file ready`n" -ForegroundColor Green

# Install Docker if needed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
$dockerCheck = @"
if ! command -v docker &> /dev/null; then
    echo 'Installing Docker...'
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    rm get-docker.sh
    echo 'Docker installed'
else
    echo 'Docker already installed'
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo 'Installing Docker Compose...'
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-`$(uname -s)-`$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo 'Docker Compose installed'
else
    echo 'Docker Compose already installed'
fi
"@

ssh "$ServerUser@$ServerIP" $dockerCheck
Write-Host "✓ Docker ready`n" -ForegroundColor Green

# Deploy application
Write-Host "Deploying application..." -ForegroundColor Yellow
$deployScript = @"
cd $DeployPath

echo 'Stopping existing containers...'
docker compose -f docker/compose.prod.yml down 2>/dev/null || true

echo 'Starting services...'
docker compose -f docker/compose.prod.yml up -d

echo 'Waiting for services to start...'
sleep 10

echo ''
echo 'Container Status:'
docker compose -f docker/compose.prod.yml ps

echo ''
echo 'Health Check:'
curl -s http://localhost:3000/health || echo 'Health check pending...'
"@

ssh "$ServerUser@$ServerIP" $deployScript
Write-Host "`n✓ Deployment complete`n" -ForegroundColor Green

# Display access information
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "  API:      http://${ServerIP}:3000" -ForegroundColor Cyan
Write-Host "  Docs:     http://${ServerIP}:3000/docs" -ForegroundColor Cyan
Write-Host "  Frontend: http://${ServerIP}:5173" -ForegroundColor Cyan
Write-Host "  MinIO:    http://${ServerIP}:9001" -ForegroundColor Cyan
Write-Host "  Jaeger:   http://${ServerIP}:16686`n" -ForegroundColor Cyan

Write-Host "Useful Commands:" -ForegroundColor Yellow
Write-Host "  SSH:      ssh $ServerUser@$ServerIP" -ForegroundColor White
Write-Host "  Logs:     ssh $ServerUser@$ServerIP 'cd $DeployPath && docker compose -f docker/compose.prod.yml logs -f'" -ForegroundColor White
Write-Host "  Restart:  ssh $ServerUser@$ServerIP 'cd $DeployPath && docker compose -f docker/compose.prod.yml restart'" -ForegroundColor White
Write-Host "  Stop:     ssh $ServerUser@$ServerIP 'cd $DeployPath && docker compose -f docker/compose.prod.yml down'`n" -ForegroundColor White

Write-Host "Test the API:" -ForegroundColor Yellow
Write-Host "  curl http://${ServerIP}:3000/health`n" -ForegroundColor White

Write-Host "Done!" -ForegroundColor Green
