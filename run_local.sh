#!/usr/bin/env bash
# Simple helper to run both the Flask backend (agent controller)
# and the Next.js dev server in one terminal session.
# ------------------------------------------------------------------
# Prerequisites:
#   1. You have created and activated a Python virtualenv named "venv"
#      in the project root and installed requirements.
#   2. You have run `npm install` once.
#   3. Environment variables for LiveKit are set in your shell or
#      exported below (LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET).
# ------------------------------------------------------------------

set -euo pipefail

# Activate Python venv
if [[ -f "venv/bin/activate" ]]; then
  source venv/bin/activate
else
  echo "Python venv not found (venv/). Please create it first." >&2
  exit 1
fi

# Start Flask backend in the background
python backend/app.py &
FLASK_PID=$!
echo "⚙️  Flask backend started (PID $FLASK_PID)"

echo "🌐 Starting Next.js dev server…"
# Start Next.js dev server (foreground)
npm run dev

# If Next.js exits, stop Flask too
kill $FLASK_PID 2>/dev/null || true 