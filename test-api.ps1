# PowerShell API Testing Script
Write-Host "🔍 Testing Download Service API..." -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
    Write-Host "✅ Health Status: $($health.status)" -ForegroundColor Green
    Write-Host "✅ Storage Status: $($health.checks.storage)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Start Download
Write-Host "`n2. Starting Download..." -ForegroundColor Yellow
try {
    $body = @{ file_id = 70000 } | ConvertTo-Json
    $download = Invoke-RestMethod -Uri "http://localhost:3000/v1/download/start" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Download Started - Job ID: $($download.job_id)" -ForegroundColor Green
    $jobId = $download.job_id
    
    # Test 3: Check Status
    Write-Host "`n3. Checking Download Status..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    $status = Invoke-RestMethod -Uri "http://localhost:3000/v1/download/status/$jobId" -Method GET
    Write-Host "✅ Status: $($status.status)" -ForegroundColor Green
    Write-Host "✅ Progress: $($status.progress)%" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Download test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: File Check
Write-Host "`n4. Testing File Check..." -ForegroundColor Yellow
try {
    $body = @{ file_id = 70000 } | ConvertTo-Json
    $check = Invoke-RestMethod -Uri "http://localhost:3000/v1/download/check" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ File Check: $($check.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ File check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "📊 Open Dashboard: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔍 Open Jaeger UI: http://localhost:16686" -ForegroundColor Cyan
Write-Host "💾 Open MinIO Console: http://localhost:9001" -ForegroundColor Cyan