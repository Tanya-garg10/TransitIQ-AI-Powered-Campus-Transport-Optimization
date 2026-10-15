from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from ..data.campus_dataset import (
    get_initial_stops,
    get_initial_routes,
    get_initial_vehicles,
    get_initial_disruptions,
)
from ..services.optimizer import (
    validate_hard_constraints,
    evaluate_objective,
    run_optimizer,
)
from ..services.eta_engine import compute_etas
from ..models.transit import StopModel, RouteModel, VehicleModel

app = FastAPI(
    title="TransitIQ RoutePulse Optimization Backend",
    version="2.4.0",
    description="Campus transit constraint-aware optimizer and telemetry API."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory operational database
stops = get_initial_stops()
routes = get_initial_routes()
vehicles = get_initial_vehicles()
disruptions = get_initial_disruptions()

@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "engine": "TransitIQ FastAPI Optimization Engine",
        "version": "2.4.0",
    }

@app.get("/api/dashboard")
def get_dashboard():
    active_vehicles = sum(1 for v in vehicles if v.assignedRouteId and v.status == "In Service")
    available_vehicles = sum(1 for v in vehicles if v.status != "Maintenance")
    total_demand = sum(s.waitingPassengers for s in stops)
    overcrowding_alerts = sum(1 for s in stops if s.waitingPassengers > s.shelterCapacity * 0.8)
    delayed_trips = sum(1 for v in vehicles if v.status == "Delayed")
    obj = evaluate_objective(routes, vehicles, stops)
    active_dis = next((d.title for d in disruptions if d.active), None)

    return {
        "totalVehicles": len(vehicles),
        "availableVehicles": available_vehicles,
        "activeVehicles": active_vehicles,
        "totalRoutes": len(routes),
        "activeTrips": active_vehicles,
        "totalHourlyDemand": total_demand,
        "overcrowdingAlertsCount": overcrowding_alerts,
        "delayedTripsCount": delayed_trips,
        "avgPassengerWaitTimeMin": obj["avgWaitMin"],
        "fleetUtilizationPercent": obj["fleetUtilization"],
        "activeDisruptionName": active_dis,
    }

@app.get("/api/routes")
def get_routes():
    return [r.model_dump() for r in routes]

@app.post("/api/routes", status_code=201)
def create_route(route: RouteModel):
    routes.append(route)
    return route

@app.get("/api/stops")
def get_stops():
    return [s.model_dump() for s in stops]

@app.post("/api/stops", status_code=201)
def create_stop(stop: StopModel):
    stops.append(stop)
    return stop

@app.get("/api/vehicles")
def get_vehicles():
    return [v.model_dump() for v in vehicles]

@app.get("/api/demand")
def get_demand():
    return [
        {
            "stopId": s.id,
            "stopName": s.name,
            "zone": s.zone,
            "waitingPassengers": s.waitingPassengers,
            "shelterCapacity": s.shelterCapacity,
            "occupancyRatePercent": round((s.waitingPassengers / s.shelterCapacity) * 100),
            "isOvercrowded": s.waitingPassengers > s.shelterCapacity * 0.8,
            "hourlyProfile": s.hourlyDemand,
        }
        for s in stops
    ]

@app.get("/api/etas")
def get_etas():
    return compute_etas(vehicles, routes, stops)

class OptimizeRequest(BaseModel):
    applyDirectly: Optional[bool] = False

@app.post("/api/optimize")
def optimize_transport(req: Optional[OptimizeRequest] = None):
    res = run_optimizer(routes, vehicles, stops, disruptions)
    return res

class DisruptionRequest(BaseModel):
    disruptionId: str
    active: bool

@app.post("/api/simulate-disruption")
def simulate_disruption(payload: DisruptionRequest):
    global stops, routes, vehicles
    target = next((d for d in disruptions if d.id == payload.disruptionId), None)
    if not target:
        raise HTTPException(status_code=404, detail="Disruption not found")

    target.active = payload.active
    if target.active:
        if target.category == "Demand Surge" and target.demandMultiplier:
            for s in stops:
                if s.id in target.affectedStopIds:
                    s.waitingPassengers = int(s.waitingPassengers * target.demandMultiplier)
        elif target.category == "Traffic Congestion" and target.travelTimeDelayMin:
            for r in routes:
                if r.id in target.affectedRouteIds:
                    r.status = "Congested"
                    for seg in r.segments:
                        if seg.fromStopId in target.affectedStopIds or seg.toStopId in target.affectedStopIds:
                            seg.currentTravelTimeMin += target.travelTimeDelayMin
                            seg.trafficCongestionFactor = 1.9
        elif target.category == "Vehicle Breakdown" and target.affectedVehicleId:
            for v in vehicles:
                if v.id == target.affectedVehicleId:
                    v.status = "Maintenance"
                    v.speedKmh = 0
                    v.assignedRouteId = None
    else:
        stops = get_initial_stops()
        routes = get_initial_routes()
        vehicles = get_initial_vehicles()

    constraints = validate_hard_constraints(routes, vehicles, stops)
    obj = evaluate_objective(routes, vehicles, stops)
    return {
        "success": True,
        "scenario": target.model_dump(),
        "currentObjective": obj,
        "constraintsValidation": [c.model_dump() for c in constraints]
    }

@app.post("/api/evaluate")
def evaluate_system():
    res = run_optimizer(routes, vehicles, stops, disruptions)
    return res["evaluation"]
