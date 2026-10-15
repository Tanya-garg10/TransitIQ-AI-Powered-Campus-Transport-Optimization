import React, { useState, useEffect, useRef } from 'react';
import {
  Route,
  Stop,
  Vehicle,
  DisruptionScenario,
  BaselineEvaluation,
  HardConstraintCheck,
  OptimizationRecommendation,
} from './types/transit';
import {
  INITIAL_STOPS,
  INITIAL_ROUTES,
  INITIAL_VEHICLES,
  INITIAL_DISRUPTIONS,
} from './data/mockTransitData';
import {
  runConstraintAwareOptimizer,
  validateHardConstraints,
} from './services/optimizer';
import { computeVehicleETAs } from './services/etaEngine';

import { Navigation, PageId } from './components/Navigation';
import { OverviewPage } from './pages/OverviewPage';
import { LiveOperationsPage } from './pages/LiveOperationsPage';
import { DemandIntelligencePage } from './pages/DemandIntelligencePage';
import { RouteOptimizerPage } from './pages/RouteOptimizerPage';
import { PerformanceLabPage } from './pages/PerformanceLabPage';
import { RoutesFleetPage } from './pages/RoutesFleetPage';
import confetti from 'canvas-confetti';

import { Footer } from './components/Footer';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');

  // Core transit state
  const [stops, setStops] = useState<Stop[]>(INITIAL_STOPS);
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [disruptions, setDisruptions] = useState<DisruptionScenario[]>(INITIAL_DISRUPTIONS);

  // Simulation controls state
  const [simulationSeconds, setSimulationSeconds] = useState(8 * 3600 + 42 * 60); // 08:42:00 AM
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Optimizer & evaluation state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [evaluation, setEvaluation] = useState<BaselineEvaluation | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [constraintsValidation, setConstraintsValidation] = useState<HardConstraintCheck[]>([]);

  // Format clock time HH:MM:SS
  const formatSimulationTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600) % 24;
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.floor(totalSec % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const simulationTimeStr = formatSimulationTime(simulationSeconds);

  // Initial optimization & constraint check
  useEffect(() => {
    const initialResult = runConstraintAwareOptimizer(routes, vehicles, stops, disruptions);
    setEvaluation(initialResult.evaluation);
    setRecommendations(initialResult.recommendations);
    setConstraintsValidation(initialResult.constraintsValidation);
  }, []);

  // Telemetry kinematic movement loop
  useEffect(() => {
    if (isSimulating) {
      timerRef.current = setInterval(() => {
        setSimulationSeconds((prev) => {
          const nextSec = prev + simulationSpeed;

          setVehicles((prevVehicles) => {
            return prevVehicles.map((v) => {
              if (!v.assignedRouteId || v.status === 'Standby / Spare' || v.status === 'Maintenance') {
                return v;
              }

              const curStop = stops.find((s) => s.id === v.currentStopId);
              const nxtStop = stops.find((s) => s.id === v.nextStopId);
              if (!curStop || !nxtStop) return v;

              const stepFactor = 0.008 * (v.speedKmh / 20) * simulationSpeed;
              const dLat = nxtStop.lat - v.lat;
              const dLng = nxtStop.lng - v.lng;
              const dist = Math.sqrt(dLat * dLat + dLng * dLng);

              if (dist < 0.0005) {
                const route = routes.find((r) => r.id === v.assignedRouteId);
                if (route) {
                  const currentIdx = route.stopIds.indexOf(v.nextStopId);
                  const newNextIdx = (currentIdx + 1) % route.stopIds.length;
                  return {
                    ...v,
                    currentStopId: v.nextStopId,
                    nextStopId: route.stopIds[newNextIdx],
                    lat: nxtStop.lat,
                    lng: nxtStop.lng,
                    lastGpsTimestamp: new Date().toISOString(),
                  };
                }
              }

              return {
                ...v,
                lat: v.lat + dLat * stepFactor,
                lng: v.lng + dLng * stepFactor,
                lastGpsTimestamp: new Date().toISOString(),
              };
            });
          });

          return nextSec;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulating, simulationSpeed, routes, stops]);

  // Solver trigger
  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applyDirectly: false }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvaluation(data.evaluation);
        setRecommendations(data.recommendations);
        setConstraintsValidation(data.constraintsValidation);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      const result = runConstraintAwareOptimizer(routes, vehicles, stops, disruptions);
      setEvaluation(result.evaluation);
      setRecommendations(result.recommendations);
      setConstraintsValidation(result.constraintsValidation);
    } finally {
      setIsOptimizing(false);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#D8FF3E', '#FFFFFF', '#101820'],
        });
      } catch {
        // ignore
      }
    }
  };

  // Apply single recommendation
  const handleApplyRecommendation = (recId: string) => {
    const rec = recommendations.find((r) => r.id === recId);
    if (!rec) return;

    if (rec.category === 'Spare Dispatch') {
      const spare = vehicles.find((v) => v.status === 'Standby / Spare');
      if (spare && rec.routeId) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === spare.id
              ? {
                  ...v,
                  status: 'In Service',
                  assignedRouteId: rec.routeId,
                  currentStopId: 'ST-05',
                  nextStopId: 'ST-08',
                }
              : v
          )
        );
        setRoutes((prev) =>
          prev.map((r) =>
            r.id === rec.routeId
              ? {
                  ...r,
                  assignedVehicleIds: [...r.assignedVehicleIds, spare.id],
                  scheduledHeadwayMin: 11,
                }
              : r
          )
        );
      }
    } else if (rec.category === 'Frequency Boost' && rec.routeId) {
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === rec.routeId
            ? { ...r, scheduledHeadwayMin: 9, cycleTimeMin: 27 }
            : r
        )
      );
    } else if (rec.category === 'Time Shifting' && rec.routeId) {
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === rec.routeId ? { ...r, scheduledHeadwayMin: 22 } : r
        )
      );
    }

    const refreshedChecks = validateHardConstraints(routes, vehicles, stops);
    setConstraintsValidation(refreshedChecks);
  };

  // Toggle Disruption
  const handleToggleDisruption = async (id: string, active: boolean) => {
    try {
      await fetch('/api/simulate-disruption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disruptionId: id, active }),
      });
    } catch {
      // fallback
    }

    setDisruptions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, active } : d))
    );

    const target = disruptions.find((d) => d.id === id);
    if (!target) return;

    if (active) {
      if (target.category === 'Demand Surge' && target.demandMultiplier) {
        setStops((prev) =>
          prev.map((s) =>
            target.affectedStopIds.includes(s.id)
              ? { ...s, waitingPassengers: Math.round(s.waitingPassengers * target.demandMultiplier!) }
              : s
          )
        );
      } else if (target.category === 'Traffic Congestion' && target.travelTimeDelayMin) {
        setRoutes((prev) =>
          prev.map((r) =>
            target.affectedRouteIds.includes(r.id)
              ? {
                  ...r,
                  status: 'Congested',
                  segments: r.segments.map((seg) =>
                    target.affectedStopIds.includes(seg.fromStopId) ||
                    target.affectedStopIds.includes(seg.toStopId)
                      ? {
                          ...seg,
                          currentTravelTimeMin: seg.currentTravelTimeMin + target.travelTimeDelayMin!,
                          trafficCongestionFactor: 1.9,
                        }
                      : seg
                  ),
                }
              : r
          )
        );
      } else if (target.category === 'Vehicle Breakdown' && target.affectedVehicleId) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === target.affectedVehicleId
              ? { ...v, status: 'Maintenance', speedKmh: 0, assignedRouteId: null }
              : v
          )
        );
      }
    } else {
      setStops(INITIAL_STOPS);
      setRoutes(INITIAL_ROUTES);
      setVehicles(INITIAL_VEHICLES);
    }

    setConstraintsValidation(validateHardConstraints(routes, vehicles, stops));
  };

  const handleResetDisruptions = () => {
    setDisruptions((prev) => prev.map((d) => ({ ...d, active: false })));
    setStops(INITIAL_STOPS);
    setRoutes(INITIAL_ROUTES);
    setVehicles(INITIAL_VEHICLES);
    setConstraintsValidation(validateHardConstraints(INITIAL_ROUTES, INITIAL_VEHICLES, INITIAL_STOPS));
  };

  // CRUD for Stops
  const handleAddStop = (newStop: Stop) => {
    setStops((prev) => [...prev, newStop]);
  };
  const handleDeleteStop = (stopId: string) => {
    setStops((prev) => prev.filter((s) => s.id !== stopId));
  };

  // CRUD for Routes
  const handleAddRoute = (newRoute: Route) => {
    setRoutes((prev) => [...prev, newRoute]);
  };
  const handleDeleteRoute = (routeId: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== routeId));
  };

  const activeDisruption = disruptions.find((d) => d.active);

  return (
    <div className="min-h-screen bg-[#101820] text-[#F7F6F0] flex flex-col font-sans">
      {/* Navigation Shell */}
      <Navigation
        activePage={activePage}
        onSelectPage={setActivePage}
        simulationTime={simulationTimeStr}
        isSimulating={isSimulating}
        onToggleSimulate={() => setIsSimulating(!isSimulating)}
        onResetSimulate={() => {
          setIsSimulating(false);
          setSimulationSeconds(8 * 3600 + 42 * 60);
        }}
        onFastForward={() => setSimulationSeconds((prev) => prev + 300)}
        simulationSpeed={simulationSpeed}
        onSpeedChange={setSimulationSpeed}
        activeDisruptionCount={disruptions.filter((d) => d.active).length}
        activeDisruptionTitle={activeDisruption ? activeDisruption.title : null}
        onRunOptimizer={handleRunOptimizer}
        isOptimizing={isOptimizing}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activePage === 'overview' && (
          <OverviewPage
            stops={stops}
            routes={routes}
            vehicles={vehicles}
            evaluation={evaluation}
            onNavigate={setActivePage}
            onRunOptimizer={handleRunOptimizer}
            simulationTime={simulationTimeStr}
          />
        )}

        {activePage === 'live' && (
          <LiveOperationsPage
            stops={stops}
            routes={routes}
            vehicles={vehicles}
            simulationTime={simulationTimeStr}
          />
        )}

        {activePage === 'demand' && (
          <DemandIntelligencePage
            stops={stops}
            routes={routes}
            vehicles={vehicles}
          />
        )}

        {activePage === 'optimizer' && (
          <RouteOptimizerPage
            routes={routes}
            vehicles={vehicles}
            stops={stops}
            constraintsValidation={constraintsValidation}
            recommendations={recommendations}
            evaluation={evaluation}
            onRunOptimizer={handleRunOptimizer}
            onApplyRecommendation={handleApplyRecommendation}
            isOptimizing={isOptimizing}
          />
        )}

        {activePage === 'performance' && (
          <PerformanceLabPage
            evaluation={evaluation}
            disruptions={disruptions}
            onToggleDisruption={handleToggleDisruption}
            onResetDisruptions={handleResetDisruptions}
            onRunOptimizer={handleRunOptimizer}
            constraintsValidation={constraintsValidation}
          />
        )}

        {activePage === 'fleet' && (
          <RoutesFleetPage
            routes={routes}
            stops={stops}
            vehicles={vehicles}
            onAddStop={handleAddStop}
            onDeleteStop={handleDeleteStop}
            onAddRoute={handleAddRoute}
            onDeleteRoute={handleDeleteRoute}
          />
        )}
      </main>

      {/* Footer Component */}
      <Footer
        onSelectPage={setActivePage}
        simulationTime={simulationTimeStr}
        activeDisruptionCount={disruptions.filter((d) => d.active).length}
      />
    </div>
  );
}
