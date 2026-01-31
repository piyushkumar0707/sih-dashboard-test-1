# Travira Deployment Helper (PowerShell)
# Run this script to prepare for deployment

Write-Host "🚀 Travira Deployment Helper" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - Travira project"
}

Write-Host ""
Write-Host "✅ Next Steps:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Push to GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR-USERNAME/travira.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy Backend (Render - FREE!):" -ForegroundColor White
Write-Host "   - Visit: https://render.com" -ForegroundColor Gray
Write-Host "   - Click 'New +' → 'Web Service'" -ForegroundColor Gray
Write-Host "   - Connect GitHub → Select 'backend' folder" -ForegroundColor Gray
Write-Host "   - Build: npm install | Start: npm start" -ForegroundColor Gray
Write-Host "   - Add environment variables from .env" -ForegroundColor Gray
Write-Host "   - Free tier: 750 hours/month!" -ForegroundColor Green
Write-Host ""
Write-Host "3. Deploy Frontend (Vercel):" -ForegroundColor White
Write-Host "   - Visit: https://vercel.com" -ForegroundColor Gray
Write-Host "   - Import Git Repository" -ForegroundColor Gray
Write-Host "   - Select 'frontend' folder" -ForegroundColor Gray
Write-Host "   - Add REACT_APP_API_URL with your Railway backend URL" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deploy AI Services (Render - FREE!):" -ForegroundColor White
Write-Host "   - Create separate Web Services for:" -ForegroundColor Gray
Write-Host "     * AI_services/safety_score (Python)" -ForegroundColor Gray
Write-Host "     * AI_services/case_report (Python)" -ForegroundColor Gray
Write-Host "   - Each gets 750 free hours/month!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 See DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
