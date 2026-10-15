import pytest
from backend.data.campus_dataset import get_initial_stops, get_initial_routes, get_initial_vehicles
from backend.services.eta_engine import compute_etas

def test_eta_mae_calculation():
    stops = get_initial_stops()
    routes = get_initial_routes()
    vehicles = get_initial_vehicles()

    res = compute_etas(vehicles, routes, stops)
    assert "predictions" in res
    assert "overallMaeMinutes" in res
    assert res["overallMaeMinutes"] >= 0.0
    assert res["sampleCount"] > 0

    # Ensure every prediction has arrival windows and valid ISO/HH:MM times
    for p in res["predictions"]:
        assert len(p["estimatedArrival"]) == 5
        assert len(p["scheduledArrival"]) == 5
        assert p["errorMinutes"] >= 0.0
