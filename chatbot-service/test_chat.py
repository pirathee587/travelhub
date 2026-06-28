import httpx
import time
import subprocess
import os

# Start server
proc = subprocess.Popen(
    ["/Users/jathuja/TravelHUB/chatbot-service/venv/bin/python", "-m", "uvicorn", "main:app", "--port", "8002"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

time.sleep(5)  # Wait for it to start

try:
    resp = httpx.post("http://127.0.0.1:8002/chat", json={"prompt": "How many packages do you have?"}, timeout=30.0)
    print("STATUS:", resp.status_code)
    print("RESPONSE:", resp.json())
except Exception as e:
    print("ERROR:", e)

proc.terminate()
proc.wait(timeout=2)
