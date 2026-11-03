#!/bin/bash
# AI-Powered Document Intelligence System - All-in-One Startup Script

echo "=========================================================="
echo " 🚀 Starting AI Document Intelligence System"
echo "=========================================================="

# Function to cleanly stop background processes on Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Shutting down backend and frontend services..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# 1. Start FastAPI Backend in the background
echo "⚡ [1/2] Starting FastAPI Backend on http://localhost:8000..."
.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend --reload &
BACKEND_PID=$!

sleep 1

# 2. Start Vite Frontend in foreground
echo "⚛️ [2/2] Starting React Vite Frontend on http://localhost:5173..."
echo "=========================================================="
echo "  • Frontend:  http://localhost:5173/"
echo "  • Backend:   http://localhost:8000/"
echo "  • API Docs:  http://localhost:8000/docs"
echo "=========================================================="
echo "Press Ctrl+C to stop all services."
echo ""

npx vite --host --port 5173

# Cleanup if frontend stops
kill $BACKEND_PID 2>/dev/null
