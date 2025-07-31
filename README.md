# LiveKit Demo – Voice / Video Room with Python Backend

This repository is a **minimal demo** that shows how to:

* Start a LiveKit room in your browser (Next.js frontend)
* Spin up a Python process that joins the same room (Flask backend)
* Exchange audio / video – everything runs locally in minutes

No prior LiveKit experience required.

---

## 1-Minute Start

```bash
# install Node + Python deps
npm install
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# launch both services (Next.js + Flask)
./run_local.sh
```

The script:
1. starts a Flask server on **http://127.0.0.1:5000** (Python room participant)
2. starts a Next.js dev server on **http://localhost:3000** (or the next free port)

Open your browser, navigate to **/gradient** or the home page, click **Start Voice Agent**, and you’ll enter the LiveKit room. The Python backend joins automatically.

---

## Environment

Create a `.env.local` (already in `.gitignore`) with your LiveKit Cloud credentials:

```
LIVEKIT_URL=wss://your-domain.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
NEXT_PUBLIC_LK_URL=$LIVEKIT_URL
```

The same values are also read by the Python backend.

---

## Project Structure

```
app/            Next.js pages & components
backend/        Flask app that spawns the Python participant
sales_agent*.py Example Python code that joins a room (can be replaced)
run_local.sh    Helper script that starts both services
```

---

## Customising

* **Frontend** – edit `app/page.tsx` (or `app/gradient/page.tsx`) to tweak the UI.
* **Backend** – replace `sales_agent___cerebras_and_livekit.py` with your own LiveKit logic; just keep the Flask wrapper.

---

## Troubleshooting

* **Port already in use** – stop previous dev servers or change the ports in `run_local.sh`.
* **Cannot connect / RegionError** – double-check your `LIVEKIT_URL` and that the credentials match the same LiveKit Cloud project.

---

Enjoy experimenting with LiveKit! 🎤🎥
