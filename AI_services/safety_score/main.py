# http://127.0.0.1:8001
"""
Safety Score FastAPI microservice.
Loads a pre-trained Random Forest model at startup and performs real-time inference.
"""
import os
import time
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List
import joblib

# ── App ────────────────────────────────────────────────────────────────────
app = FastAPI(title="Travira Safety Score API", version="2.0.0")

# ── Model loading ──────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH   = os.path.join(SCRIPT_DIR, "model.pkl")
ENCODER_PATH = os.path.join(SCRIPT_DIR, "label_encoder.pkl")

clf = None
label_encoder = None

@app.on_event("startup")
def load_model():
    global clf, label_encoder
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
        clf = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
        print("✅ Safety Score ML model loaded successfully")
    else:
        print("⚠️  model.pkl not found — run train_model.py first. Using fallback arithmetic.")

# ── Request / Response models ──────────────────────────────────────────────
class ScoreRequest(BaseModel):
    geofence_risk: float = 1.0            # 0-10
    anomalies: int = 0                    # 0-5
    time_of_day: Optional[int] = None     # 0-23; defaults to current hour
    movement_speed_kmh: float = 4.0       # typical walking speed
    historical_incidents_nearby: int = 0
    # backward-compat field (ignored for inference but accepted)
    telemetry: Optional[dict] = None

ANOMALY_SPEED_THRESHOLD_KMH = 60    # impossible on foot
HIGH_RISK_ZONE_RISK_THRESHOLD = 7   # geofence_risk > this is "high-risk"

def _detect_anomalies(speed: float, geofence_risk: float, anomalies_count: int) -> List[str]:
    flags: List[str] = []
    if speed > ANOMALY_SPEED_THRESHOLD_KMH:
        flags.append(f"speed_anomaly: {speed:.1f} km/h is impossible on foot")
    if geofence_risk > HIGH_RISK_ZONE_RISK_THRESHOLD and anomalies_count == 0:
        flags.append(f"high_risk_zone: geofence risk score {geofence_risk:.1f}")
    return flags

def _score_from_label(label: str) -> int:
    """Convert categorical risk label to a numeric 0-100 safety score."""
    return {"safe": 85, "warning": 55, "danger": 20}.get(label, 50)

def _fallback_score(geofence_risk: float, anomalies: int) -> dict:
    """Arithmetic fallback used when model.pkl is absent."""
    score = max(0, 100 - int(geofence_risk * 10 + anomalies * 20))
    risk_level = "safe" if score >= 70 else ("warning" if score >= 40 else "danger")
    return {"safety_score": score, "confidence": 0.0, "risk_level": risk_level}

# ── Endpoints ──────────────────────────────────────────────────────────────
@app.get("/")
def root():
    model_status = "loaded" if clf is not None else "not loaded (using fallback)"
    return {"message": "Safety Score API is running", "model": model_status}

@app.post("/calculate")
def calculate_score(data: ScoreRequest):
    hour = data.time_of_day if data.time_of_day is not None else int(time.strftime("%H"))

    # Anomaly flags (independent of model prediction)
    anomaly_flags = _detect_anomalies(data.movement_speed_kmh, data.geofence_risk, data.anomalies)

    if clf is None:
        result = _fallback_score(data.geofence_risk, data.anomalies)
        result["anomaly_flags"] = anomaly_flags
        result["model"] = "fallback"
        return result

    # Feature vector matches training columns:
    # [geofence_risk, anomalies, time_of_day, movement_speed_kmh, historical_incidents_nearby]
    X = np.array([[
        data.geofence_risk,
        data.anomalies,
        hour,
        data.movement_speed_kmh,
        data.historical_incidents_nearby,
    ]])

    proba = clf.predict_proba(X)[0]          # shape: (n_classes,)
    pred_idx = int(np.argmax(proba))
    predicted_label = label_encoder.classes_[pred_idx]
    confidence = float(round(proba[pred_idx], 4))

    safety_score = _score_from_label(predicted_label)

    # Lower score further if anomaly flags triggered
    if anomaly_flags:
        safety_score = max(0, safety_score - 15 * len(anomaly_flags))
        if safety_score < 40:
            predicted_label = "danger"

    return {
        "safety_score": safety_score,
        "confidence": confidence,
        "risk_level": predicted_label,
        "anomaly_flags": anomaly_flags,
        "model": "random_forest",
        "probabilities": {
            label_encoder.classes_[i]: round(float(p), 4)
            for i, p in enumerate(proba)
        },
    }

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": clf is not None}
