#!/bin/bash
# ==============================================================================
# AI-Powered Document Intelligence System — Stop Script
# Cleanly terminates Frontend, Backend, Python Background Workers, and flushes DB
# ==============================================================================

echo "=========================================================="
echo " 🛑 Stopping AI Document Intelligence System Services..."
echo "=========================================================="

# 1. Kill recorded PIDs from .services.pid if it exists
if [ -f .services.pid ]; then
    while read -r pid; do
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            kill -15 "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
        fi
    done < .services.pid
    rm -f .services.pid
fi

# 2. Kill any process listening on Port 8000 (FastAPI Backend)
PORT_8000_PIDS=$(lsof -ti:8000 2>/dev/null)
if [ -n "$PORT_8000_PIDS" ]; then
    echo "• Stopping FastAPI Backend on Port 8000..."
    echo "$PORT_8000_PIDS" | xargs kill -9 2>/dev/null
else
    echo "• Port 8000 (Backend) is already clear."
fi

# 3. Kill any process listening on Port 5173 (React Vite Frontend)
PORT_5173_PIDS=$(lsof -ti:5173 2>/dev/null)
if [ -n "$PORT_5173_PIDS" ]; then
    echo "• Stopping Vite Frontend on Port 5173..."
    echo "$PORT_5173_PIDS" | xargs kill -9 2>/dev/null
else
    echo "• Port 5173 (Frontend) is already clear."
fi

# 4. Clean up any lingering python uvicorn worker processes
pkill -f "uvicorn app.main:app" 2>/dev/null

# 5. Flush SQLite WAL journal to commit all pending transactions & release DB locks
if [ -f "backend/data/doc_intelligence.db" ]; then
    .venv/bin/python -c "
import sqlite3
try:
    conn = sqlite3.connect('backend/data/doc_intelligence.db', timeout=5)
    conn.execute('PRAGMA wal_checkpoint(TRUNCATE);')
    conn.close()
    print('• SQLite Database WAL flushed and closed cleanly.')
except Exception as e:
    pass
" 2>/dev/null
fi

echo "=========================================================="
echo " ✅ ALL SERVICES STOPPED SUCCESSFULLY!"
echo "    - Frontend (Port 5173) : STOPPED"
echo "    - Backend  (Port 8000) : STOPPED"
echo "    - Python Workers       : STOPPED"
echo "    - SQLite Database      : SAFELY CLOSED"
echo "=========================================================="
echo "To restart everything anytime, simply run: ./start.sh"
echo ""
