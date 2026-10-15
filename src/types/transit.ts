export interface Stop {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  zone: 'Academic' | 'Residential' | 'Transit Hub' | 'Athletics' | 'Research' | 'Medical';
  waitingPassengers: number;
  hourlyDemand: Record<string, number>; // e.g. "08:00": 45
  boardingRatePerMin: number; // pax/min
  alightingRatePerMin: number;
  shelterCapacity: number;
}

export interface RouteSegment {
  fromStopId: string;
  toStopId: string;
  distanceKm: number;
  baseTravelTimeMin: number;
  currentTravelTimeMin: number;
  trafficCongestionFactor: number; // 1.0 = clear, 1.8 = severe delay
}

export interface Route {
  id: string;
  name: string;
  shortCode: string;
  color: string;
  stopIds: string[];
  segments: RouteSegment[];
  scheduledHeadwayMin: number;
  operatingHours: string;
  assignedVehicleIds: string[];
  totalDistanceKm: number;
  cycleTimeMin: number;
  status: 'Normal' | 'Delayed' | 'Rerouted' | 'Congested';
}

export type VehicleType = 'Electric Shuttle' | 'Standard Bus' | 'Articulated High-Capacity' | 'Accessible Van';

export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  type: VehicleType;
  capacity: number; // Hard max capacity
  currentOccupancy: number;
  assignedRouteId: string | null;
  currentStopId: string;
  nextStopId: string;
  lat: number;
  lng: number;
  speedKmh: number;
  bearing: number;
  status: 'In Service' | 'Standby / Spare' | 'Maintenance' | 'Charging' | 'Delayed';
  batteryOrFuelPercent: number;
  lastGpsTimestamp: string;
  driverName: string;
}

export interface TripSchedule {
  tripId: string;
  routeId: string;
  vehicleId: string;
  scheduledDepartureTime: string;
  estimatedDepartureTime: string;
  actualDepartureTime?: string;
  estimatedArrivalTime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed' | 'Cancelled';
  passengerLoad: number;
  unmetDemand: number;
}

export interface DisruptionScenario {
  id: string;
  title: string;
  category: 'Demand Surge' | 'Traffic Congestion' | 'Vehicle Breakdown' | 'GPS Telemetry Loss';
  description: string;
  affectedRouteIds: string[];
  affectedStopIds: string[];
  affectedVehicleId?: string;
  demandMultiplier?: number;
  travelTimeDelayMin?: number;
  active: boolean;
}

export interface ETAPrediction {
  stopId: string;
  stopName: string;
  routeId: string;
  vehicleId: string;
  scheduledArrival: string;
  estimatedArrival: string;
  arrivalWindowStart: string; // -2 min
  arrivalWindowEnd: string;   // +2 min
  groundTruthArrival: string; // Simulated actual arrival
  errorMinutes: number;       // Absolute error
  confidenceScore: number;    // 0 to 1
  isCongested: boolean;
}

export interface HardConstraintCheck {
  constraintName: string;
  passed: boolean;
  details: string;
  violationsCount: number;
}

export interface OptimizationRecommendation {
  id: string;
  category: 'Vehicle Reallocation' | 'Frequency Boost' | 'Time Shifting' | 'Spare Dispatch';
  routeId: string;
  vehicleId?: string;
  title: string;
  currentPlan: string;
  proposedPlan: string;
  reason: string;
  expectedBenefit: string;
  operationalTradeOffs: string;
  constraintsChecked: HardConstraintCheck[];
  confidence: number;
  status: 'Proposed' | 'Accepted' | 'Implemented';
}

export interface BaselineEvaluation {
  scenarioName: string;
  timestamp: string;
  baseline: {
    avgWaitingTimeMin: number;
    totalUnmetDemand: number;
    overcrowdingIncidents: number;
    fleetUtilizationPercent: number;
    totalTripMilesKm: number;
    estimatedFuelKwh: number;
    etaMaeMin: number;
    operatingCostPerHour: number;
  };
  optimized: {
    avgWaitingTimeMin: number;
    totalUnmetDemand: number;
    overcrowdingIncidents: number;
    fleetUtilizationPercent: number;
    totalTripMilesKm: number;
    estimatedFuelKwh: number;
    etaMaeMin: number;
    operatingCostPerHour: number;
  };
  deltas: {
    waitingTimeImprovementPercent: number;
    unmetDemandReductionPercent: number;
    overcrowdingReductionPercent: number;
    utilizationChangePercent: number;
    costSavingsPercent: number;
    etaAccuracyImprovementPercent: number;
  };
  solverRuntimeMs: number;
  hardConstraintsSatisfied: boolean;
  validationReport: HardConstraintCheck[];
}

export interface DashboardMetrics {
  totalVehicles: number;
  availableVehicles: number;
  activeVehicles: number;
  totalRoutes: number;
  activeTrips: number;
  totalHourlyDemand: number;
  overcrowdingAlertsCount: number;
  delayedTripsCount: number;
  avgPassengerWaitTimeMin: number;
  fleetUtilizationPercent: number;
  activeDisruptionName: string | null;
}
