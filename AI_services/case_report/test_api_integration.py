import os
import time

import jwt
import pytest
from fastapi.testclient import TestClient

os.environ["JWT_SECRET"] = "integration-test-secret-at-least-32-chars"
from main import app  # noqa: E402

client = TestClient(app)
SECRET = os.environ["JWT_SECRET"]
VALID_REPORT = {
    "incident_id": "IT-1",
    "type": "Other",
    "location": "Test Location",
    "severity": "Low",
    "description": "Integration test report",
}


def token(role="tourist", expires_at=None):
    return jwt.encode(
        {"sub": "integration-user", "role": role, "exp": expires_at or int(time.time()) + 60},
        SECRET,
        algorithm="HS256",
    )


@pytest.mark.parametrize(
    ("authorization", "status", "code"),
    [
        (None, 401, "UNAUTHENTICATED"),
        ("Bearer not-a-jwt", 401, "UNAUTHENTICATED"),
        (f"Bearer {token(expires_at=int(time.time()) - 60)}", 401, "UNAUTHENTICATED"),
        (f"Bearer {token(role='unrecognized')}", 403, "FORBIDDEN"),
        (f"Bearer {token()}", 200, None),
    ],
    ids=["missing", "invalid", "expired", "wrong-role", "valid"],
)
def test_auth_matrix(authorization, status, code):
    headers = {"Authorization": authorization} if authorization else {}
    response = client.post("/report", json=VALID_REPORT, headers=headers)
    assert response.status_code == status
    if code:
        assert response.json()["code"] == code
        assert isinstance(response.json()["error"], str)
    else:
        assert response.json()["status"] == "success"
        assert response.json()["pdf_base64"]


def test_validation_errors_use_consistent_shape():
    response = client.post(
        "/report",
        json={"incident_id": ""},
        headers={"Authorization": f"Bearer {token()}"},
    )
    assert response.status_code == 400
    assert response.json()["code"] == "VALIDATION_ERROR"
    assert isinstance(response.json()["error"], str)
    assert response.json()["details"]
