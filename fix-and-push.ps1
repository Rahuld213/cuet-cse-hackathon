# Fix CI/CD and Push to GitHub
# This script will initialize Git and push the fixed CI/CD workflow

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl,
    
    [string]$Branch = "main"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   FIX CI/CD AND PUSH TO GITHUB" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git first: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host "Repository URL: $RepoUrl" -ForegroundColor Yellow
Write-Host "Branch: $Branch`n" -ForegroundColor Yellow

# Initialize Git
Write-Host "1. Initializing Git repository..." -ForegroundColor Cyan
git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to initialize Git" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Git initialized`n" -ForegroundColor Green

# Configure Git user (if not set)
Write-Host "2. Configuring Git user..." -ForegroundColor Cyan
$gitUser = git config user.name
if (!$gitUser) {
    $userName = Read-Host "Enter your Git username"
    git config user.name "$userName"
}
$gitEmail = git config user.email
if (!$gitEmail) {
    $userEmail = Read-Host "Enter your Git email"
    git config user.email "$userEmail"
}
Write-Host "✓ Git user configured`n" -ForegroundColor Green

# Add all files
Write-Host "3. Adding files..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to add files" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Files added`n" -ForegroundColor Green

# Commit
Write-Host "4. Creating commit..." -ForegroundColor Cyan
git commit -m "fix: resolve CI/CD merge conflicts and update dependencies"
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to commit" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Commit created`n" -ForegroundColor Green

# Add remote
Write-Host "5. Adding remote repository..." -ForegroundColor Cyan
git remote add origin $RepoUrl 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Remote already exists, updating..." -ForegroundColor Yellow
    git remote set-url origin $RepoUrl
}
Write-Host "✓ Remote configured`n" -ForegroundColor Green

# Rename branch
Write-Host "6. Setting branch to $Branch..." -ForegroundColor Cyan
git branch -M $Branch
Write-Host "✓ Branch set`n" -ForegroundColor Green

# Push
Write-Host "7. Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "⚠ This will force push to $Branch branch!" -ForegroundColor Yellow
$confirm = Read-Host "Continue? (Y/N)"
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "`n✗ Push cancelled" -ForegroundColor Yellow
    exit 0
}

git push -u origin $Branch --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n✗ Failed to push" -ForegroundColor Red
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check if repository URL is correct" -ForegroundColor White
    Write-Host "  2. Verify you have push access" -ForegroundColor White
    Write-Host "  3. Check if you need to authenticate" -ForegroundColor White
    exit 1
}

Write-Host "`n✓ Successfully pushed to GitHub!`n" -ForegroundColor Green

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PUSH COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Go to your GitHub repository" -ForegroundColor White
Write-Host "  2. Check the Actions tab" -ForegroundColor White
Write-Host "  3. Verify CI/CD pipeline runs successfully" -ForegroundColor White
Write-Host "  4. Review and merge Dependabot PRs`n" -ForegroundColor White

Write-Host "Repository: $RepoUrl" -ForegroundColor Cyan
Write-Host "Branch: $Branch`n" -ForegroundColor Cyan

Write-Host "Done! 🚀`n" -ForegroundColor Green
