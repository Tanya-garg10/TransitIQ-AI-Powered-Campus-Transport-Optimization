import sys
import unittest
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from backend.data.campus_dataset import (
    get_initial_stops,
    get_initial_routes,
    get_initial_vehicles,
    get_initial_disruptions,
)
from backend.services.optimizer import (
    validate_hard_constraints,
    evaluate_objective,
    run_optimizer,
)
from backend.services.eta_engine import compute_etas

class TestTransitIQOptimizer(unittest.TestCase):
    def setUp(self):
        self.stops = get_initial_stops()
        self.routes = get_initial_routes()
        self.vehicles = get_initial_vehicles()
        self.disruptions = get_initial_disruptions()

    def test_initial_dataset_integrity(self):
        self.assertGreaterEqual(len(self.stops), 12, "Must contain at least 12 campus stops")
        self.assertGreaterEqual(len(self.routes), 5, "Must contain at least 5 routes")
        self.assertGreaterEqual(len(self.vehicles), 6, "Must contain at least 6 vehicles")
        self.assertGreaterEqual(len(self.disruptions), 3, "Must contain at least 3 disruption scenarios")

    def test_hard_constraints_validation_clean_pass(self):
        checks = validate_hard_constraints(self.routes, self.vehicles, self.stops)
        self.assertEqual(len(checks), 7, "All 7 hard constraints must be checked")
        for c in checks:
            self.assertTrue(c.passed, f"Constraint failed in nominal state: {c.constraintName}")

    def test_capacity_constraint_violation_detection(self):
        # Force vehicle 0 over capacity
        overloaded_veh = self.vehicles[0].model_copy(deep=True)
        overloaded_veh.currentOccupancy = overloaded_veh.capacity + 25
        test_vehs = [overloaded_veh] + self.vehicles[1:]

        checks = validate_hard_constraints(self.routes, test_vehs, self.stops)
        c1 = next(c for c in checks if "C1:" in c.constraintName)
        self.assertFalse(c1.passed, "Overloaded vehicle must trigger C1 constraint violation")
        self.assertEqual(c1.violationsCount, 1)

    def test_impossible_trip_detection(self):
        # Force impossible turnaround by making cycle time 5 minutes
        bad_route = self.routes[0].model_copy(deep=True)
        bad_route.cycleTimeMin = 5
        test_routes = [bad_route] + self.routes[1:]

        checks = validate_hard_constraints(test_routes, self.vehicles, self.stops)
        c2 = next(c for c in checks if "C2:" in c.constraintName)
        self.assertFalse(c2.passed, "Impossible cycle time must trigger C2 violation")

    def test_optimizer_execution_and_deltas(self):
        result = run_optimizer(self.routes, self.vehicles, self.stops, self.disruptions)
        self.assertIn("evaluation", result)
        self.assertIn("recommendations", result)
        self.assertIn("optimizedRoutes", result)

        eval_data = result["evaluation"]
        self.assertTrue(eval_data["hardConstraintsSatisfied"], "Proposed plan must satisfy all constraints")
        self.assertLessEqual(
            eval_data["optimized"]["avgWaitingTimeMin"],
            eval_data["baseline"]["avgWaitingTimeMin"],
            "Optimized wait time must be <= baseline wait time"
        )
        self.assertGreater(len(result["recommendations"]), 0, "Must produce actionable recommendations")

    def test_eta_mae_computation(self):
        res = compute_etas(self.vehicles, self.routes, self.stops)
        self.assertIn("predictions", res)
        self.assertIn("overallMaeMinutes", res)
        self.assertGreater(res["sampleCount"], 0)
        self.assertGreaterEqual(res["overallMaeMinutes"], 0.0)

        for p in res["predictions"]:
            self.assertIn("estimatedArrival", p)
            self.assertIn("arrivalWindowStart", p)
            self.assertIn("arrivalWindowEnd", p)
            self.assertGreaterEqual(p["errorMinutes"], 0.0)

if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestTransitIQOptimizer)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
