"""
Generate synthetic training dataset for the Safety Score ML model.
Produces 5000 rows with realistic feature distributions.
Run: python generate_dataset.py
"""
import numpy as np
import pandas as pd
import os

np.random.seed(42)
N = 5000

# Features
geofence_risk = np.random.randint(0, 11, N)           # 0-10
anomalies = np.random.randint(0, 6, N)                # 0-5
time_of_day = np.random.randint(0, 24, N)             # 0-23
movement_speed_kmh = np.clip(np.random.exponential(5, N), 0, 80)  # mostly slow, occasional fast
historical_incidents_nearby = np.random.poisson(1.5, N).clip(0, 10)

# Label generation with realistic heuristics
def assign_label(gr, an, tod, speed, hist):
    score = 0
    score += gr * 4                                   # 0-40
    score += an * 6                                   # 0-30
    score += hist * 2                                 # 0-20
    score += 3 if 22 <= tod or tod <= 5 else 0        # night penalty
    score += 10 if speed > 50 else (4 if speed > 20 else 0)  # speed penalty

    if score >= 40:
        return "danger"
    elif score >= 20:
        return "warning"
    else:
        return "safe"

labels = [
    assign_label(geofence_risk[i], anomalies[i], time_of_day[i],
                 movement_speed_kmh[i], historical_incidents_nearby[i])
    for i in range(N)
]

df = pd.DataFrame({
    "geofence_risk": geofence_risk,
    "anomalies": anomalies,
    "time_of_day": time_of_day,
    "movement_speed_kmh": movement_speed_kmh.round(2),
    "historical_incidents_nearby": historical_incidents_nearby,
    "label": labels
})

out_path = os.path.join(os.path.dirname(__file__), "safety_dataset.csv")
df.to_csv(out_path, index=False)

label_counts = df["label"].value_counts()
print(f"✅ Dataset saved to {out_path}")
print(f"   Total rows : {N}")
print(f"   safe       : {label_counts.get('safe', 0)}")
print(f"   warning    : {label_counts.get('warning', 0)}")
print(f"   danger     : {label_counts.get('danger', 0)}")
