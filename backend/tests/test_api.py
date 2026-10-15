import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_api_routes_and_stops():
    res_r = client.get("/api/routes")
    assert res_r.status_code == 200
    assert len(res_r.json()) >= 5

    res_s = client.get("/api/stops")
    assert res_s.status_code == 200
    assert len(res_s.json()) >= 12

def test_api_optimize():
    res = client.post("/api/optimize", json={"applyDirectly": False})
    assert res.status_code == 200
    data = res.json()
    assert "optimizedRoutes" in data
    assert "recommendations" in data
    assert "constraintsValidation" in data

def test_api_simulate_disruption():
    res = client.post("/api/simulate-disruption", json={"disruptionId": "DIS-01", "active": True})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
