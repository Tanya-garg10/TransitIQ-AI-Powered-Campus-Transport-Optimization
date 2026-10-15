import pytest
from backend.data.campus_dataset import get_initial_stops, get_initial_routes, get_initial_vehicles, get_initial_disruptions
from backend.services.optimizer import validate_hard_constraints, evaluate_objective, run_optimizer

def test_initial_constraints_pass():
    stops = get_initial_stops()
    routes = get_initial_routes()
    vehicles = get_initial_vehicles()

    checks = validate_hard_constraints(routes, vehicles, stops)
    assert len(checks) == 7
    # Baseline vehicles must not exceed max capacity
    c1 = next(c for c in checks if "C1:" in c.constraintName)
    assert c1.passed is True
    assert c1.violationsCount == 0

def test_capacity_violation_detection():
    stops = get_initial_stops()
    routes = get_initial_routes()
    vehicles = get_initial_vehicles()

    # Artificially overload vehicle
    vehicles[0].currentOccupancy = vehicles[0].capacity + 20
    checks = validate_hard_constraints(routes, vehicles, stops)
    c1 = next(c for c in checks if "C1:" in c.constraintName)
    assert c1.passed is False
    assert c1.violationsCount == 1

def test_impossible_trip_detection():
    stops = get_initial_stops()
    routes = get_initial_routes()
    vehicles = get_initial_vehicles()

    # Route with cycle time smaller than travel time + 3 min buffer
    routes[0].cycleTimeMin = 10  # travel time is 22m!
    checks = validate_hard_constraints(routes, vehicles, stops)
    c2 = next(c for c in checks if "C2:" in c.constraintName)
    assert c2.passed is False
    assert c2.violationsCount > 0

def test_optimizer_improves_metrics():
    stops = get_initial_stops()
    routes = get_initial_routes()
    vehicles = get_initial_vehicles()
    disruptions = get_initial_disruptions()

    res = run_optimizer(routes, vehicles, stops, disruptions)
    eval_data = res["evaluation"]

    # Waiting time should be equal or improved
    assert eval_data["optimized"]["avgWaitingTimeMin"] <= eval_data["baseline"]["avgWaitingTimeMin"]
    # All hard constraints must be satisfied in proposed plan
    assert eval_data["hardConstraintsSatisfied"] is True
