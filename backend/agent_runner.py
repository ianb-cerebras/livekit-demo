import subprocess
import sys
import pathlib
import signal
from typing import Optional

# Path to the existing agent script
SCRIPT_PATH = pathlib.Path(__file__).resolve().parent.parent / "sales_agent___cerebras_and_livekit.py"
PYTHON      = sys.executable  # current venv python interpreter

_proc: Optional[subprocess.Popen] = None

def start() -> bool:
    """Start the sales agent subprocess. Returns True if started, False if already running."""
    global _proc
    if _proc and _proc.poll() is None:
        return False  # already running
    _proc = subprocess.Popen([PYTHON, str(SCRIPT_PATH)])
    return True

def stop() -> bool:
    """Stop the agent subprocess. Returns True if stopped, False if it wasn't running."""
    global _proc
    if _proc and _proc.poll() is None:
        _proc.send_signal(signal.SIGINT)
        try:
            _proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            _proc.kill()
        finally:
            _proc = None
        return True
    return False

def running() -> bool:
    """Check if the agent subprocess is currently running."""
    return _proc is not None and _proc.poll() is None 