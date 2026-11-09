# http://127.0.0.1:8001
"""
Safety Score FastAPI microservice.
Loads a pre-trained Random Forest model at startup and performs real-time inference.
"""
import os
import time
import numpy as np
from fastapi import Depends, FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import joblib
from auth import require_token

# ── App ────────────────────────────────────────────────────────────────────
app = FastAPI(title="Travira Safety Score API", version="2.0.0")


@app.exception_handler(HTTPException)
async def http_error_handler(_request, exc: HTTPException):
    code = {400: "BAD_REQUEST", 401: "UNAUTHENTICATED", 403: "FORBIDDEN", 500: "INTERNAL_ERROR", 503: "SERVICE_UNAVAILABLE"}.get(exc.status_code, "REQUEST_FAILED")
    return JSONResponse(status_code=exc.status_code, content={"error": str(exc.detail), "code": code})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_request, exc: RequestValidationError):
    return JSONResponse(status_code=400, content={
        "error": "Request validation failed",
        "code": "VALIDATION_ERROR",
        "details": [{"field": ".".join(map(str, issue["loc"])), "message": issue["msg"]} for issue in exc.errors()],
    })


@app.exception_handler(Exception)
async def unexpected_error_handler(_request, _exc: Exception):
    return JSONResponse(status_code=500, content={"error": "Internal server error", "code": "INTERNAL_ERROR"})

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
    geofence_risk: float = Field(default=1.0, ge=0, le=10)
    anomalies: int = Field(default=0, ge=0, le=5)
    time_of_day: Optional[int] = Field(default=None, ge=0, le=23)
    movement_speed_kmh: float = Field(default=4.0, ge=0, le=500)
    historical_incidents_nearby: int = Field(default=0, ge=0, le=100)
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
def calculate_score(data: ScoreRequest, _user=Depends(require_token)):
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
