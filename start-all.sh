#!/bin/bash
# 🚀 Travira Quick Start Script (Linux/Mac)
# Run this from project root to start all services

echo -e "\n🎉 Starting Travira Platform...\n"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "⚠️  .env file not found! Please create it from .env.example"
    echo -e "   cp .env.example .env"
    echo -e "   Then edit .env with your MongoDB URI and other settings\n"
    exit 1
fi

# Function to start service in new terminal
start_service() {
    TITLE=$1
    COMMAND=$2
    PATH=$3
    
    echo -e "▶️  Starting $TITLE..."
    
    # Try different terminal emulators
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $PATH && echo -e '\n🚀 $TITLE' && $COMMAND; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd $PATH && echo -e '\n🚀 $TITLE' && $COMMAND; exec bash" &
    elif command -v konsole &> /dev/null; then
        konsole -e "cd $PATH && echo -e '\n🚀 $TITLE' && $COMMAND; exec bash" &
    else
        echo "No supported terminal found. Please run manually: cd $PATH && $COMMAND"
    fi
    
    sleep 2
}

# Start Backend
start_service "Backend API Server" "npm start" "$(pwd)/backend"

# Start Frontend
start_service "Frontend Web Dashboard" "npm start" "$(pwd)/frontend"

# Start AI Services
echo -e "\n📝 Note: AI services require Python and dependencies installed"
read -p "Start AI services? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    start_service "AI Safety Score Service" "uvicorn main:app --reload --port 8001" "$(pwd)/AI_services/safety_score"
    start_service "AI Case Report Service" "uvicorn main:app --reload --port 8002" "$(pwd)/AI_services/case_report"
fi

# Start Blockchain Service
read -p "Start Blockchain service? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    start_service "Blockchain Service" "node server.js" "$(pwd)/Blockchain"
fi

echo -e "\n✅ All services started!\n"
echo -e "📋 Service URLs:"
echo -e "   Backend API:      http://localhost:5000"
echo -e "   Web Dashboard:    http://localhost:3000"
echo -e "   AI Safety Score:  http://localhost:8001"
echo -e "   AI Case Report:   http://localhost:8002"
echo -e "   Blockchain:       http://localhost:4000"

echo -e "\n🔐 Test Credentials:"
echo -e "   Admin:    admin / admin123"
echo -e "   Officer:  officer1 / officer123"
echo -e "   Tourist:  tourist_john / tourist123"

echo -e "\n📚 Documentation:"
echo -e "   Setup Guide:      COMPLETE_SETUP_GUIDE.md"
echo -e "   API Docs:         API_DOCUMENTATION.md"
echo -e "   Completion:       PROJECT_COMPLETION_SUMMARY.md"

echo -e "\n💡 Tip: Check http://localhost:5000/api/health for system status\n"
