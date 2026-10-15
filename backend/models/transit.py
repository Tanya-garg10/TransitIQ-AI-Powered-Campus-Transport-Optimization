from typing import List, Dict, Optional, Literal, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def model_dump(self) -> Dict[str, Any]:
            res = {}
            for k, v in self.__dict__.items():
                if isinstance(v, list):
                    res[k] = [item.model_dump() if hasattr(item, 'model_dump') else item for item in v]
                elif hasattr(v, 'model_dump'):
                    res[k] = v.model_dump()
                else:
                    res[k] = v
            return res
        def model_copy(self, deep: bool = True) -> 'BaseModel':
            import copy
            return copy.deepcopy(self) if deep else copy.copy(self)

    def Field(default_factory=None, **kwargs):
        return default_factory() if default_factory else None

class StopModel(BaseModel):
    id: str = ""
    name: str = ""
    code: str = ""
    lat: float = 0.0
    lng: float = 0.0
    zone: str = "Academic"
    waitingPassengers: int = 0
    hourlyDemand: Dict[str, int] = {}
    boardingRatePerMin: float = 12.0
    alightingRatePerMin: float = 12.0
    shelterCapacity: int = 50

class RouteSegmentModel(BaseModel):
    fromStopId: str = ""
    toStopId: str = ""
    distanceKm: float = 0.0
    baseTravelTimeMin: float = 0.0
    currentTravelTimeMin: float = 0.0
    trafficCongestionFactor: float = 1.0

class RouteModel(BaseModel):
    id: str = ""
    name: str = ""
    shortCode: str = ""
    color: str = "#06B6D4"
    stopIds: List[str] = []
    segments: List[RouteSegmentModel] = []
    scheduledHeadwayMin: int = 15
    operatingHours: str = "07:00 - 23:00"
    assignedVehicleIds: List[str] = []
    totalDistanceKm: float = 5.0
    cycleTimeMin: int = 30
    status: str = "Normal"

class VehicleModel(BaseModel):
    id: str = ""
    name: str = ""
    licensePlate: str = ""
    type: str = "Standard Bus"
    capacity: int = 45
    currentOccupancy: int = 0
    assignedRouteId: Optional[str] = None
    currentStopId: str = ""
    nextStopId: str = ""
    lat: float = 0.0
    lng: float = 0.0
    speedKmh: float = 20.0
    bearing: float = 0.0
    status: str = "In Service"
    batteryOrFuelPercent: int = 100
    lastGpsTimestamp: str = ""
    driverName: str = ""

class HardConstraintCheckModel(BaseModel):
    constraintName: str = ""
    passed: bool = True
    details: str = ""
    violationsCount: int = 0

class RecommendationModel(BaseModel):
    id: str = ""
    category: str = "Spare Dispatch"
    routeId: str = ""
    vehicleId: Optional[str] = None
    title: str = ""
    currentPlan: str = ""
    proposedPlan: str = ""
    reason: str = ""
    expectedBenefit: str = ""
    operationalTradeOffs: str = ""
    constraintsChecked: List[HardConstraintCheckModel] = []
    confidence: float = 0.95
    status: str = "Proposed"

class DisruptionScenarioModel(BaseModel):
    id: str = ""
    title: str = ""
    category: str = "Demand Surge"
    description: str = ""
    affectedRouteIds: List[str] = []
    affectedStopIds: List[str] = []
    affectedVehicleId: Optional[str] = None
    demandMultiplier: Optional[float] = None
    travelTimeDelayMin: Optional[float] = None
    active: bool = False

class ETAPredictionModel(BaseModel):
    stopId: str = ""
    stopName: str = ""
    routeId: str = ""
    vehicleId: str = ""
    scheduledArrival: str = ""
    estimatedArrival: str = ""
    arrivalWindowStart: str = ""
    arrivalWindowEnd: str = ""
    groundTruthArrival: str = ""
    errorMinutes: float = 0.0
    confidenceScore: float = 0.9
    isCongested: bool = False

class BaselineEvaluationModel(BaseModel):
    scenarioName: str = ""
    timestamp: str = ""
    baseline: Dict[str, float] = {}
    optimized: Dict[str, float] = {}
    deltas: Dict[str, float] = {}
    solverRuntimeMs: float = 0.0
    hardConstraintsSatisfied: bool = True
    validationReport: List[HardConstraintCheckModel] = []
