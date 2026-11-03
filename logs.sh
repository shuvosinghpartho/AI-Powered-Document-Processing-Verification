#!/bin/bash
# Real-time unified log viewer for AI Document Intelligence System
echo "=========================================================="
echo " 📜 Streaming Backend & Frontend Logs (Ctrl+C to exit)"
echo "=========================================================="
tail -f logs/backend.log logs/frontend.log 2>/dev/null
