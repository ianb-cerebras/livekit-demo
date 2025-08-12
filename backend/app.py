from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import agent_runner

app = Flask(__name__)

# Restrict CORS in production via env; default to permissive for local dev
frontend_origin = os.getenv("FRONTEND_ORIGIN")
if frontend_origin:
    CORS(app, resources={r"/*": {"origins": [frontend_origin]}})
else:
    CORS(app)

@app.get('/healthz')
def healthz():
    return jsonify({"ok": True})

@app.post('/agent/start')
def start_agent():
    data = request.get_json(silent=True) or {}
    # Keys are optional; only pass if provided
    env_overrides = {}
    cerebras_key = data.get('cerebrasKey')
    cartesia_key = data.get('cartesiaKey')
    if cerebras_key:
        env_overrides['CEREBRAS_API_KEY'] = cerebras_key
    if cartesia_key:
        env_overrides['CARTESIA_API_KEY'] = cartesia_key

    started = agent_runner.start(env_overrides=env_overrides)
    return jsonify({'running': agent_runner.running(), 'started': started})

@app.post('/agent/stop')
def stop_agent():
    stopped = agent_runner.stop()
    return jsonify({'running': agent_runner.running(), 'stopped': stopped})

@app.get('/agent/status')
def status():
    return jsonify({'running': agent_runner.running()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 

