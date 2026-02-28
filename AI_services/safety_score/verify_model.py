"""
Comprehensive model verification — run directly to prove the model works.
Usage:  python verify_model.py
"""
import json
from fastapi.testclient import TestClient
from main import app

tests = [
    # (label, request_body, expected_risk, expected_flag_keyword or None)
    ("SAFE   | daytime walk, zero risk",
     {"geofence_risk": 0, "anomalies": 0, "time_of_day": 12,
      "movement_speed_kmh": 3.0, "historical_incidents_nearby": 0},
     "safe", None),

    ("SAFE   | typical tourist afternoon",
     {"geofence_risk": 1, "anomalies": 0, "time_of_day": 14,
      "movement_speed_kmh": 4.0, "historical_incidents_nearby": 0},
     "safe", None),

    ("WARN   | moderate zone, evening rush",
     {"geofence_risk": 5, "anomalies": 1, "time_of_day": 19,
      "movement_speed_kmh": 12.0, "historical_incidents_nearby": 2},
     "warning", None),

    ("WARN   | mid-range boundary",
     {"geofence_risk": 4, "anomalies": 1, "time_of_day": 11,
      "movement_speed_kmh": 15.0, "historical_incidents_nearby": 2},
     "warning", None),

    ("DANGER | high-risk zone at night",
     {"geofence_risk": 9, "anomalies": 4, "time_of_day": 2,
      "movement_speed_kmh": 6.0, "historical_incidents_nearby": 5},
     "danger", None),

    ("DANGER | all values maxed out",
     {"geofence_risk": 10, "anomalies": 5, "time_of_day": 3,
      "movement_speed_kmh": 5.0, "historical_incidents_nearby": 10},
     "danger", None),

    ("FLAG   | speed anomaly 80 km/h (impossible on foot)",
     {"geofence_risk": 1, "anomalies": 0, "time_of_day": 10,
      "movement_speed_kmh": 80.0, "historical_incidents_nearby": 0},
     None, "speed_anomaly"),

    ("FLAG   | speed + high-risk zone",
     {"geofence_risk": 8, "anomalies": 2, "time_of_day": 22,
      "movement_speed_kmh": 75.0, "historical_incidents_nearby": 3},
     None, "speed_anomaly"),

    ("COMPAT | backward-compat (old format, no new fields)",
     {"geofence_risk": 3, "anomalies": 1,
      "telemetry": {"heartRate": 90}},
     None, None),
]

PASS = "PASS"
FAIL = "FAIL"
results = []

with TestClient(app) as client:
    print()
    print("=" * 76)
    print(f"{'SCENARIO':<44}  {'SCORE':>5}  {'CONF':>6}  {'RISK':<8}  STATUS")
    print("=" * 76)

    for label, body, exp_risk, exp_flag in tests:
        r = client.post("/calculate", json=body)
        assert r.status_code == 200, f"HTTP {r.status_code}: {r.text}"
        d = r.json()

        score  = d["safety_score"]
        conf   = d["confidence"]
        risk   = d["risk_level"]
        model  = d["model"]
        flags  = d.get("anomaly_flags", [])
        probs  = d.get("probabilities", {})

        # Determine pass/fail
        status = PASS
        if exp_risk and risk != exp_risk:
            status = FAIL
        if exp_flag and not any(exp_flag in f for f in flags):
            status = FAIL

        conf_str = f"{conf * 100:.1f}%"
        tag = "OK" if status == PASS else "!!"
        results.append(status)

        print(f"[{tag}] {label:<42}  {score:>5}  {conf_str:>6}  {risk:<8}  {status}")
        if flags:
            for f in flags:
                print(f"     FLAG  -> {f}")
        if status == FAIL:
            print(f"     EXPECTED risk={exp_risk!r}  flag={exp_flag!r}")
            print(f"     GOT     risk={risk!r}  flags={flags!r}")

    print()
    print("── /health ──────────────────────────────────────────────────────────")
    h = client.get("/health").json()
    print(f"   model_loaded = {h['model_loaded']}   status = {h['status']}")

    print()
    print("── Sample full JSON response (/calculate) ───────────────────────────")
    sample = client.post("/calculate", json={
        "geofence_risk": 5, "anomalies": 2, "time_of_day": 21,
        "movement_speed_kmh": 8.0, "historical_incidents_nearby": 3
    }).json()
    print(json.dumps(sample, indent=2))

passed = results.count(PASS)
failed = results.count(FAIL)
print()
print("=" * 76)
if failed == 0:
    print(f"  {passed}/{len(results)} tests passed  -- Model is working correctly!")
else:
    print(f"  {passed}/{len(results)} passed  |  {failed} FAILED")
print("=" * 76)
print()
