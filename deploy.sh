#!/bin/bash

echo "🚀 Travira Deployment Helper"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Travira project"
fi

echo ""
echo "✅ Next Steps:"
echo ""
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR-USERNAME/travira.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "2. Deploy Backend (Railway):"
echo "   - Visit: https://railway.app"
echo "   - Click 'New Project' → 'Deploy from GitHub'"
echo "   - Select 'backend' folder"
echo "   - Add environment variables from .env"
echo ""
echo "3. Deploy Frontend (Vercel):"
echo "   - Visit: https://vercel.com"
echo "   - Import Git Repository"
echo "   - Select 'frontend' folder"
echo "   - Add REACT_APP_API_URL with your Railway backend URL"
echo ""
echo "4. Deploy AI Services (Railway):"
echo "   - Create separate projects for:"
echo "     * AI_services/safety_score"
echo "     * AI_services/case_report"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
