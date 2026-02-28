"""
End-to-end test for the Safety Score FastAPI service.
Uses FastAPI TestClient — no running server required.

Run: python test_model.py
"""
from fastapi.testclient import TestClient
from main import app

# ── Test scenarios ──────────────────────────────────────────────────────────
# Each body maps directly to ScoreRequest fields.
scenarios = [
    {
        "name": "Safe tourist (daytime walk, low risk)",
        "body": {
            "geofence_risk": 1,
            "anomalies": 0,
            "time_of_day": 14,
            "movement_speed_kmh": 4.0,
            "historical_incidents_nearby": 0,
        },
        "expected_risk": "safe",
    },
    {
        "name": "Warning (moderate zone, evening)",
        "body": {
            "geofence_risk": 5,
            "anomalies": 1,
            "time_of_day": 19,
            "movement_speed_kmh": 12.0,
            "historical_incidents_nearby": 2,
        },
        "expected_risk": "warning",
    },
    {
        "name": "Danger (high-risk, night, many incidents)",
        "body": {
            "geofence_risk": 9,
            "anomalies": 4,
            "time_of_day": 2,
            "movement_speed_kmh": 6.0,
            "historical_incidents_nearby": 5,
        },
        "expected_risk": "danger",
    },
    {
        "name": "Speed anomaly (80 km/h - impossible on foot)",
        "body": {
            "geofence_risk": 2,
            "anomalies": 0,
            "time_of_day": 10,
            "movement_speed_kmh": 80.0,
            "historical_incidents_nearby": 0,
        },
        "expected_flag": "speed_anomaly",
    },
    {
        "name": "Backward-compat (old format, no new fields)",
        "body": {
            "geofence_risk": 3,
            "anomalies": 1,
            "telemetry": {"heartRate": 90},
        },
    },
]

PASS = "PASS"
FAIL = "FAIL"
results = []

print()
print("=" * 72)
print(f"{'SCENARIO':<45}  {'SCORE':>5}  {'CONF':>6}  {'RISK':<8}  STATUS")
print("=" * 72)

# 'with' keyword triggers @app.on_event("startup") so model loads before tests
with TestClient(app) as client:

    for s in scenarios:
        resp = client.post("/calculate", json=s["body"])
        assert resp.status_code == 200, f"HTTP {resp.status_code}: {resp.text}"
        d = resp.json()

        score  = d.get("safety_score", "?")
        conf   = d.get("confidence", 0)
        risk   = d.get("risk_level", "?")
        flags  = d.get("anomaly_flags", [])

        # Validate
        status = PASS
        if "expected_risk" in s and risk != s["expected_risk"]:
            status = FAIL
        if "expected_flag" in s:
            if not any(s["expected_flag"] in f for f in flags):
                status = FAIL

        conf_str = f"{conf * 100:.1f}%" if conf is not None else "?"
        results.append(status)
        prefix = "OK" if status == PASS else "XX"
        print(f"[{prefix}] {s['name']:<43}  {str(score):>5}  {conf_str:>6}  {risk:<8}  {status}")
        for fl in flags:
            print(f"       FLAG: {fl}")

    # Health + root
    print()
    print("--- /health ---")
    print(client.get("/health").json())
    print()
    print("--- / (root) ---")
    print(client.get("/").json())

# Summary
passed = results.count(PASS)
failed = results.count(FAIL)
print()
print("=" * 72)
emoji = "All tests passed!" if failed == 0 else f"{failed} test(s) FAILED"
print(f"  {passed}/{len(results)}  {emoji}")
print("=" * 72)
print()
