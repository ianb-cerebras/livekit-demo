from flask import Flask, jsonify
from flask_cors import CORS
import agent_runner

app = Flask(__name__)
CORS(app)  # allow requests from Next.js dev server

@app.post('/agent/start')
def start_agent():
    started = agent_runner.start()
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

