# LiveKit Demo (Next.js + Flask Agent)

A production-ready example that pairs a Next.js frontend with a Python (Flask) controller that launches a LiveKit Agents worker. Users enter their Cerebras and Cartesia API keys, click Start Call, and join a LiveKit room with:

- A custom animated "speaking" avatar for the agent
- A simple local camera tile
- Server-minted LiveKit JWTs

---

## Overview

- Frontend: Next.js 15 (App Router) with `@livekit/components-react`
- Backend: Flask (controller) spawns the Python LiveKit agent as a subprocess
- Agent: `sales_agent___cerebras_and_livekit.py` (LiveKit Agents + Cerebras LLM + Cartesia STT/TTS + Silero VAD)
- Token route: `app/api/token/route.ts` mints JWTs using `livekit-server-sdk` (Node runtime)

```
Browser ──> Vercel (Next.js)
  ├─ GET /api/token  → mints LiveKit JWT (uses LIVEKIT_* envs)
  └─ POST {keys} → Render (Flask) /agent/start
                     └─ launches agent subprocess with env overrides
Agent ↔ LiveKit Cloud (URL/KEY/SECRET)
```

---

## Prerequisites

- Node.js 18+ (dev)
- Python 3.9+ (dev)
- LiveKit Cloud app with URL/API Key/Secret
- Cerebras API key (user-provided at runtime)
- Cartesia API key (user-provided at runtime)

---

## Environment Variables

### Frontend (Vercel)
- `LIVEKIT_URL`: `wss://<your-app>.livekit.cloud`
- `LIVEKIT_API_KEY`: LiveKit API key
- `LIVEKIT_API_SECRET`: LiveKit API secret
- `NEXT_PUBLIC_BACKEND_URL`: Public HTTPS URL of your backend (Render), e.g. `https://<service>.onrender.com`

Notes:
- The token route returns `{ token, url }`. The frontend uses that `url` as `LiveKitRoom.serverUrl` to avoid drift.
- The `NEXT_PUBLIC_*` prefix is required for the value to be exposed to the browser bundle.

### Backend (Render)
- `LIVEKIT_URL`: `wss://<your-app>.livekit.cloud`
- `LIVEKIT_API_KEY`: LiveKit API key
- `LIVEKIT_API_SECRET`: LiveKit API secret
- `FRONTEND_ORIGIN`: `https://<your-frontend>.vercel.app` (CORS allowlist)
- Optional defaults: `CARTESIA_API_KEY`, `CEREBRAS_API_KEY` (users can still override on Start)

---

## Local Development

1) Install dependencies
```bash
npm install
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2) Run both servers with one command
```bash
chmod +x run_local.sh
./run_local.sh
```
- Flask backend on `http://127.0.0.1:5000`
- Next.js dev server on `http://localhost:3000` (or `3001` if busy)

3) Open the app, enter your Cerebras + Cartesia keys, click “Start Call”.

---

## Production Deployment

### Backend on Render
- Build command:
```bash
pip install -r requirements.txt
```
- Start command (single worker to avoid duplicate agents):
```bash
gunicorn backend.app:app -w 1 -k gthread -b 0.0.0.0:$PORT --threads 2 --preload --timeout 120
```
- Health check path: `/healthz`
- Set envs listed above

CORS is restricted via `FRONTEND_ORIGIN`. Add preview origins if you need preview builds to work.

### Frontend on Vercel
- Ensure `app/api/token/route.ts` contains:
```ts
export const runtime = 'nodejs';
```
- Set envs listed above (LIVEKIT_* and NEXT_PUBLIC_BACKEND_URL)
- Deploy. The token route mints JWTs, returns `{ token, url }`. The frontend uses `url` for `LiveKitRoom`.

---

## How the UI Works

- Landing card collects user Cerebras + Cartesia keys (password inputs). Start button is disabled until both are entered.
- On Start:
  - Frontend POSTs `{ cerebrasKey, cartesiaKey }` to `${NEXT_PUBLIC_BACKEND_URL}/agent/start`
  - Backend merges keys into the agent subprocess environment and launches the Python agent
  - Frontend calls `/api/token` to get `{ token, url }` and joins the room
- In-call UI:
  - Left: Agent speaking circle (animated via `useIsSpeaking`)
  - Right: Local camera tile (rendered via `useTracks` + `TrackLoop` + `ParticipantTile`)

---

## Key Files

- `app/page.tsx`: Main page, speaking avatar, camera tile, API key inputs, room join logic
- `app/api/token/route.ts`: Node runtime token route using `livekit-server-sdk`
- `backend/app.py`: Flask app, CORS, `/agent/*` endpoints, `/healthz`
- `backend/agent_runner.py`: Spawns the Python agent subprocess with env overrides
- `sales_agent___cerebras_and_livekit.py`: LiveKit agent entrypoint; reads all keys from env
- `run_local.sh`: Helper to run Flask + Next.js together
- `requirements.txt`: Python deps (LiveKit Agents, Flask, Gunicorn, etc.)

---

## Troubleshooting

- net::ERR_CONNECTION_REFUSED on `/agent/start`
  - Your frontend is calling `http://127.0.0.1:5000` in production. Set `NEXT_PUBLIC_BACKEND_URL` on Vercel to your Render URL and redeploy.
  - Verify backend health: open `https://<render>.onrender.com/healthz`.

- “No room provided” or hooks failing
  - Ensure components using LiveKit hooks are rendered inside a single `LiveKitRoom` provider.

- “No TrackRef” error
  - Use `useTracks([Track.Source.Camera])` + `TrackLoop` + `ParticipantTile`, or pass a full `trackRef={{ participant, source: Track.Source.Camera }}`.

- LiveKit “region info” / JSON decode error
  - Use your application URL `wss://<project>.livekit.cloud` (not an STT cluster URL). Ensure the same URL is used across frontend and backend.

- Port 3000 in use
  - Next.js will fall back to 3001 automatically, or free the port: `kill $(lsof -ti :3000)`

---

## Security Notes

- Secrets (LIVEKIT_API_SECRET) live only on server runtimes (Vercel API route, Render). The browser never sees them.
- User-provided Cerebras/Cartesia keys are posted over HTTPS to the backend and injected into the agent env. They are not logged.

---

## Useful Commands

```bash
# Dev (both servers)
./run_local.sh

# Backend only (dev)
source venv/bin/activate && python backend/app.py

# Frontend only (dev)
npm run dev

# Build (frontend)
npm run build
```

---

## License

This repository is provided as an example demo. Add a license if you intend to distribute or modify it publicly.
