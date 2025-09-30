# http://127.0.0.1:8001
from fastapi import FastAPI

# create FastAPI app instance
app = FastAPI()

@app.get("/")
def root():
    return {"message": "Safety Score API is running"}

@app.post("/calculate")
def calculate_score(data: dict):
    # Example dummy scoring logic
    telemetry = data.get("telemetry", {})
    geofence_risk = data.get("geofence_risk", 1)
    anomalies = data.get("anomalies", 0)

    score = 100 - (geofence_risk * 10 + anomalies * 20)
    return {"safety_score": max(score, 0)}
