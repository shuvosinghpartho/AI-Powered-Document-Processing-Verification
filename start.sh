#!/bin/bash
# ==============================================================================
# AI-Powered Document Intelligence System — All-in-One Start Script
# Launches Backend, Frontend, and Python Workers in background daemon mode
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR" || exit 1

echo "=========================================================="
echo " 🚀 Starting AI Document Intelligence System..."
echo "=========================================================="

# 1. Clean up any previous lingering instances to guarantee fresh ports
./stop.sh >/dev/null 2>&1
sleep 1

# 2. Ensure log directory exists
mkdir -p logs

# 3. Start FastAPI Backend in background
echo "⚡ [1/2] Starting FastAPI Backend on http://localhost:8000..."
nohup .venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend --reload > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > .services.pid

# Wait for backend to be healthy (up to 8 seconds)
for i in {1..8}; do
    if curl -s http://localhost:8000/health | grep -q "healthy"; then
        break
    fi
    sleep 1
done

# 4. Start Vite Frontend in background
echo "⚛️  [2/2] Starting React Vite Frontend on http://localhost:5173..."
nohup npx vite --host --port 5173 > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" >> .services.pid

sleep 2

# Verify services
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    BACKEND_STATUS="ONLINE (Healthy)"
else
    BACKEND_STATUS="STARTING..."
fi

if lsof -ti:5173 >/dev/null 2>&1; then
    FRONTEND_STATUS="ONLINE (Port 5173)"
else
    FRONTEND_STATUS="STARTING..."
fi

echo "=========================================================="
echo " ✅ SYSTEM STARTED SUCCESSFULLY & RUNNING IN BACKGROUND!"
echo "=========================================================="
echo "  • Frontend Web App : http://localhost:5173/ [$FRONTEND_STATUS]"
echo "  • Backend REST API : http://localhost:8000/ [$BACKEND_STATUS]"
echo "  • Swagger API Docs : http://localhost:8000/docs"
echo "  • Live Logs Folder : $PROJECT_DIR/logs/"
echo "=========================================================="
echo "💡 Commands to remember:"
echo "   ./stop.sh   ➔ Stop everything completely (Frontend, Backend, DB)"
echo "   ./start.sh  ➔ Start everything again"
echo "   ./logs.sh   ➔ View live server logs"
echo "=========================================================="
echo ""
