## LiveKit Demo (Next.js + Flask Agent)

Production-ready example that pairs a Next.js frontend with a Python (Flask) controller that launches a LiveKit Agents worker. Users enter their Cerebras and Cartesia API keys, click Start Call, and join a LiveKit room with:

- Animated speaking avatar for the agent
- Local camera tile
- Server-minted LiveKit JWTs

---

## Architecture

```
Browser ──> Vercel (Next.js)
  ├─ GET /api/token             → mints LiveKit JWT (uses LIVEKIT_* envs)
  └─ POST /api/agent/start      → proxies to Render backend
                                 └─ /agent/start (Flask) launches agent subprocess
Agent ↔ LiveKit Cloud (LIVEKIT_URL / KEY / SECRET)
```

Repo highlights:
- `app/page.tsx` – UI, agent speaking avatar, camera tile, key inputs
- `app/api/token/route.ts` – Node runtime token route using `livekit-server-sdk`
- `app/api/agent/start/route.ts` – Server-side proxy to backend (uses `BACKEND_URL`)
- `backend/app.py` – Flask API (`/agent/start|stop|status`, `/healthz`, CORS)
- `backend/agent_runner.py` – Spawns the Python agent subprocess with env overrides
- `sales_agent___cerebras_and_livekit.py` – Agent entrypoint; reads all keys from env

---

## Prerequisites

- Node.js 18+
- Python 3.9+
- LiveKit Cloud application (URL, API Key, Secret)
- Cerebras & Cartesia API keys (users enter these at runtime)

---

## Environment Variables

### Frontend (Vercel)
- `BACKEND_URL` – Public HTTPS URL of the Render backend, e.g. `https://<service>.onrender.com`
- `LIVEKIT_URL` – `wss://<your-app>.livekit.cloud` (LiveKit application URL)
- `LIVEKIT_API_KEY` – LiveKit API key
- `LIVEKIT_API_SECRET` – LiveKit API secret

Notes:
- The token route returns `{ token, url }`; the UI uses this `url` as `LiveKitRoom.serverUrl` for alignment.
- Prefer `BACKEND_URL` (server-only) over a `NEXT_PUBLIC_*` to avoid CORS/mixed-content and client-stale URL issues.

### Backend (Render)
- `LIVEKIT_URL` – `wss://<your-app>.livekit.cloud` (not an STT host)
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- `FRONTEND_ORIGIN` – `https://<your-vercel-app>.vercel.app` (no trailing slash)
- Optional defaults: `CARTESIA_API_KEY`, `CEREBRAS_API_KEY` (users can still override via UI)

---

## Local Development

1) Install dependencies
```bash
npm install
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2) Run both servers
```bash
./run_local.sh
```
- Backend: `http://127.0.0.1:5000`
- Frontend: `http://localhost:3000` (or falls back to 3001)

3) Open the app, enter Cerebras/Cartesia keys, click “Start Call”.

---

## Production Deployment

### Backend on Render (Flask)
- Build:
```bash
pip install -r requirements.txt
```
- Start:
```bash
gunicorn backend.app:app -w 1 -k gthread -b 0.0.0.0:$PORT --threads 2 --preload --timeout 120
```
- Health check: `/healthz`
- Set envs (see above). Keep `workers=1` to avoid multiple agent subprocesses.

### Frontend on Vercel (Next.js)
- Token route must run on Node:
```ts
// app/api/token/route.ts
export const runtime = 'nodejs';
```
- Set envs (`BACKEND_URL`, `LIVEKIT_*`).
- Deploy. The UI uses the token route’s `url` for `LiveKitRoom.serverUrl`.

---

## How the UI Works

- Join card collects user Cerebras + Cartesia keys (password inputs). Start button is disabled until both are present.
- On Start:
  - POST `/api/agent/start` (server-side proxy) with `{ cerebrasKey, cartesiaKey }`
  - Backend injects keys into env and launches the agent subprocess
  - UI calls `/api/token` to get `{ token, url }` and joins the room
- In-call:
  - Left: speaking avatar driven by LiveKit `useIsSpeaking`
  - Right: local camera rendered via `useTracks` + `TrackLoop` + `ParticipantTile`

---

## Verification Checklist

- Backend healthy: `curl -sS https://<render>.onrender.com/healthz` → `{ "ok": true }`
- Vercel Network tab on Start Call:
  - POST `/api/agent/start` (same origin; not `127.0.0.1`)
  - GET `/api/token` returns `{ token, url: wss://<your-app>.livekit.cloud }`
- Render logs show agent starting without region-info errors.

---

## Troubleshooting

- Browser POSTs to `127.0.0.1:5000`
  - Set `BACKEND_URL` on Vercel and redeploy. Hard refresh or use Incognito to bust cache.

- LiveKit “region info” / JSON decode error
  - Ensure `LIVEKIT_URL` is the application URL `wss://<your-app>.livekit.cloud` on both Vercel and Render (not an STT host). Make sure URL/key/secret all belong to the same LiveKit app.

- “No room provided” or hooks failing
  - Ensure components using LiveKit hooks render inside a single `LiveKitRoom`.

- “No TrackRef” error
  - Use `useTracks([Track.Source.Camera])` + `TrackLoop` + `ParticipantTile` or pass a full trackRef.

- Console spam from 1Password extension
  - It’s harmless. Disable the extension or its desktop-app integration.

- Port 3000 in use (local)
  - Next.js falls back to 3001 automatically, or free the port: `kill $(lsof -ti :3000)`

---

## Security Notes

- Secrets (e.g., `LIVEKIT_API_SECRET`) are server-only (Vercel API route, Render). The browser never sees them.
- User-provided Cerebras & Cartesia keys are sent over HTTPS to the backend and injected into the agent env. They are not logged.
- Rotate secrets if they appear in logs or chat.

---

## Useful Commands

```bash
# Dev (both servers)
./run_local.sh

# Backend only
source venv/bin/activate && python backend/app.py

# Frontend only
npm run dev

# Build frontend
npm run build
```

---

## License

This repository is provided as an example demo.
