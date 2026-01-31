# 🚀 Travira Quick Start Script
# Run this from project root to start all services

Write-Host "`n🎉 Starting Travira Platform...`n" -ForegroundColor Cyan

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found! Please create it from .env.example" -ForegroundColor Yellow
    Write-Host "   cp .env.example .env" -ForegroundColor Gray
    Write-Host "   Then edit .env with your MongoDB URI and other settings`n" -ForegroundColor Gray
    exit 1
}

# Function to start service in new window
function Start-Service {
    param($Title, $Command, $Path)
    Write-Host "▶️  Starting $Title..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; Write-Host '`n🚀 $Title' -ForegroundColor Cyan; $Command"
}

# Start Backend
Start-Service "Backend API Server" "npm start" "$PSScriptRoot\backend"
Start-Sleep -Seconds 3

# Start Frontend
Start-Service "Frontend Web Dashboard" "npm start" "$PSScriptRoot\frontend"
Start-Sleep -Seconds 2

# Start AI Services
Write-Host "`n📝 Note: AI services require Python and dependencies installed" -ForegroundColor Yellow
$startAI = Read-Host "Start AI services? (y/n)"
if ($startAI -eq "y") {
    Start-Service "AI Safety Score Service" "uvicorn main:app --reload --port 8001" "$PSScriptRoot\AI_services\safety_score"
    Start-Service "AI Case Report Service" "uvicorn main:app --reload --port 8002" "$PSScriptRoot\AI_services\case_report"
    Start-Sleep -Seconds 2
}

# Start Blockchain Service
$startBlockchain = Read-Host "Start Blockchain service? (y/n)"
if ($startBlockchain -eq "y") {
    Start-Service "Blockchain Service" "node server.js" "$PSScriptRoot\Blockchain"
}

Write-Host "`n✅ All services started!`n" -ForegroundColor Green
Write-Host "📋 Service URLs:" -ForegroundColor Cyan
Write-Host "   Backend API:      http://localhost:5000" -ForegroundColor White
Write-Host "   Web Dashboard:    http://localhost:3000" -ForegroundColor White
Write-Host "   AI Safety Score:  http://localhost:8001" -ForegroundColor White
Write-Host "   AI Case Report:   http://localhost:8002" -ForegroundColor White
Write-Host "   Blockchain:       http://localhost:4000" -ForegroundColor White

Write-Host "`n🔐 Test Credentials:" -ForegroundColor Cyan
Write-Host "   Admin:    admin / admin123" -ForegroundColor White
Write-Host "   Officer:  officer1 / officer123" -ForegroundColor White
Write-Host "   Tourist:  tourist_john / tourist123" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "   Setup Guide:      COMPLETE_SETUP_GUIDE.md" -ForegroundColor White
Write-Host "   API Docs:         API_DOCUMENTATION.md" -ForegroundColor White
Write-Host "   Completion:       PROJECT_COMPLETION_SUMMARY.md" -ForegroundColor White

Write-Host "`n💡 Tip: Check http://localhost:5000/api/health for system status`n" -ForegroundColor Yellow
