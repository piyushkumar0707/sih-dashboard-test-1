"""
Train a Random Forest classifier for tourist safety scoring.
Run: python train_model.py
Output: model.pkl (loaded by main.py at startup)
"""
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib

# ── 1. Load (or generate) dataset ──────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(__file__)
DATASET_PATH = os.path.join(SCRIPT_DIR, "safety_dataset.csv")

if not os.path.exists(DATASET_PATH):
    print("Dataset not found — running generate_dataset.py first...")
    import generate_dataset  # noqa: F401  (side-effect: creates csv)

df = pd.read_csv(DATASET_PATH)
print(f"Loaded dataset: {len(df)} rows")
print(df["label"].value_counts())

# ── 2. Features & labels ───────────────────────────────────────────────────
FEATURE_COLS = [
    "geofence_risk",
    "anomalies",
    "time_of_day",
    "movement_speed_kmh",
    "historical_incidents_nearby",
]

X = df[FEATURE_COLS].values
y = df["label"].values

# Encode labels: safe=0, warning=1, danger=2
le = LabelEncoder()
y_enc = le.fit_transform(y)
print(f"Label classes order: {list(le.classes_)}")

# ── 3. Train / test split (80/20) ──────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
)

# ── 4. Train Random Forest ─────────────────────────────────────────────────
clf = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    min_samples_leaf=3,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1,
)
clf.fit(X_train, y_train)

# ── 5. Evaluate ────────────────────────────────────────────────────────────
y_pred = clf.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\n✅ Accuracy: {accuracy * 100:.2f}%")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# ── 6. Save model + label encoder ─────────────────────────────────────────
MODEL_PATH = os.path.join(SCRIPT_DIR, "model.pkl")
ENCODER_PATH = os.path.join(SCRIPT_DIR, "label_encoder.pkl")
joblib.dump(clf, MODEL_PATH)
joblib.dump(le, ENCODER_PATH)

print(f"Model saved  → {MODEL_PATH}")
print(f"Encoder saved → {ENCODER_PATH}")
print(f"Feature importance:")
for name, imp in sorted(zip(FEATURE_COLS, clf.feature_importances_), key=lambda x: -x[1]):
    print(f"  {name:35s}: {imp:.4f}")
