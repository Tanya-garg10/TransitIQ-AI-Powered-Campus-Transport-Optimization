import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import {
  INITIAL_STOPS,
  INITIAL_ROUTES,
  INITIAL_VEHICLES,
  INITIAL_DISRUPTIONS,
} from './src/data/mockTransitData.ts';
import {
  runConstraintAwareOptimizer,
  calculateObjectiveCost,
  validateHardConstraints,
} from './src/services/optimizer.ts';
import { computeVehicleETAs } from './src/services/etaEngine.ts';
import { Stop, Route, Vehicle, DisruptionScenario } from './src/types/transit.ts';

// In-memory application state
let stops: Stop[] = JSON.parse(JSON.stringify(INITIAL_STOPS));
let routes: Route[] = JSON.parse(JSON.stringify(INITIAL_ROUTES));
let vehicles: Vehicle[] = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
let disruptions: DisruptionScenario[] = JSON.parse(JSON.stringify(INITIAL_DISRUPTIONS));
let simulationTime = '08:42:00';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // 1. Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      system: 'TransitIQ RoutePulse Optimization Engine',
      version: '2.4.0',
      uptimeSec: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // 2. High-level dashboard metrics
  app.get('/api/dashboard', (_req: Request, res: Response) => {
    const activeVehicles = vehicles.filter((v) => v.assignedRouteId && v.status === 'In Service').length;
    const availableVehicles = vehicles.filter((v) => v.status !== 'Maintenance').length;
    const totalHourlyDemand = stops.reduce((sum, s) => sum + s.waitingPassengers, 0);
    const overcrowdingAlertsCount = stops.filter((s) => s.waitingPassengers > s.shelterCapacity * 0.8).length;
    const delayedTripsCount = vehicles.filter((v) => v.status === 'Delayed').length;

    const objective = calculateObjectiveCost(routes, vehicles, stops);
    const activeDisruption = disruptions.find((d) => d.active);

    res.json({
      totalVehicles: vehicles.length,
      availableVehicles,
      activeVehicles,
      totalRoutes: routes.length,
      activeTrips: activeVehicles,
      totalHourlyDemand,
      overcrowdingAlertsCount,
      delayedTripsCount,
      avgPassengerWaitTimeMin: objective.avgWaitMin,
      fleetUtilizationPercent: objective.fleetUtilization,
      activeDisruptionName: activeDisruption ? activeDisruption.title : null,
      currentTime: simulationTime,
    });
  });

  // 3. Routes endpoints (GET, POST, PUT, DELETE)
  app.get('/api/routes', (_req: Request, res: Response) => {
    res.json(routes);
  });

  app.post('/api/routes', (req: Request, res: Response) => {
    const newRoute: Route = req.body;
    if (!newRoute.id || !newRoute.name || !Array.isArray(newRoute.stopIds) || newRoute.stopIds.length < 2) {
      return res.status(400).json({ error: 'Invalid route data. ID, name, and at least 2 stops required.' });
    }
    routes.push(newRoute);
    res.status(201).json(newRoute);
  });

  app.put('/api/routes/:id', (req: Request, res: Response) => {
    const index = routes.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Route not found' });
    }
    routes[index] = { ...routes[index], ...req.body };
    res.json(routes[index]);
  });

  app.delete('/api/routes/:id', (req: Request, res: Response) => {
    const index = routes.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Route not found' });
    }
    const removed = routes.splice(index, 1);
    res.json({ success: true, removedRoute: removed[0] });
  });

  // 4. Stops endpoints (GET, POST, PUT, DELETE)
  app.get('/api/stops', (_req: Request, res: Response) => {
    res.json(stops);
  });

  app.post('/api/stops', (req: Request, res: Response) => {
    const newStop: Stop = req.body;
    if (!newStop.id || !newStop.name || typeof newStop.lat !== 'number' || typeof newStop.lng !== 'number') {
      return res.status(400).json({ error: 'Invalid stop data. ID, name, lat, and lng required.' });
    }
    stops.push(newStop);
    res.status(201).json(newStop);
  });

  app.put('/api/stops/:id', (req: Request, res: Response) => {
    const index = stops.findIndex((s) => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Stop not found' });
    }
    stops[index] = { ...stops[index], ...req.body };
    res.json(stops[index]);
  });

  app.delete('/api/stops/:id', (req: Request, res: Response) => {
    const index = stops.findIndex((s) => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Stop not found' });
    }
    const removed = stops.splice(index, 1);
    res.json({ success: true, removedStop: removed[0] });
  });

  // 5. Vehicles endpoint
  app.get('/api/vehicles', (_req: Request, res: Response) => {
    res.json(vehicles);
  });

  // 6. Demand analytics endpoint
  app.get('/api/demand', (_req: Request, res: Response) => {
    const demandMatrix = stops.map((s) => ({
      stopId: s.id,
      stopName: s.name,
      zone: s.zone,
      waitingPassengers: s.waitingPassengers,
      shelterCapacity: s.shelterCapacity,
      occupancyRatePercent: Math.round((s.waitingPassengers / (s.shelterCapacity || 1)) * 100),
      isOvercrowded: s.waitingPassengers > s.shelterCapacity * 0.8,
      hourlyProfile: s.hourlyDemand,
    }));
    res.json(demandMatrix);
  });

  // 7. ETAs endpoint
  app.get('/api/etas', (_req: Request, res: Response) => {
    const etaData = computeVehicleETAs(vehicles, routes, stops, simulationTime);
    res.json(etaData);
  });

  // 8. Run Optimizer endpoint
  app.post('/api/optimize', (req: Request, res: Response) => {
    const result = runConstraintAwareOptimizer(routes, vehicles, stops, disruptions);
    // Optionally update in-memory optimized state if requested
    if (req.body?.applyDirectly) {
      routes = result.optimizedRoutes;
      vehicles = result.optimizedVehicles;
    }
    res.json(result);
  });

  // 9. Simulate Disruption endpoint
  app.post('/api/simulate-disruption', (req: Request, res: Response) => {
    const { disruptionId, active } = req.body;
    const target = disruptions.find((d) => d.id === disruptionId);
    if (!target) {
      return res.status(404).json({ error: 'Disruption scenario not found.' });
    }

    target.active = Boolean(active);

    // Apply or reset disruption effects on stops/routes/vehicles
    if (target.active) {
      if (target.category === 'Demand Surge' && target.demandMultiplier) {
        stops.forEach((s) => {
          if (target.affectedStopIds.includes(s.id)) {
            s.waitingPassengers = Math.round(s.waitingPassengers * target.demandMultiplier!);
          }
        });
      } else if (target.category === 'Traffic Congestion' && target.travelTimeDelayMin) {
        routes.forEach((r) => {
          if (target.affectedRouteIds.includes(r.id)) {
            r.status = 'Congested';
            r.segments.forEach((seg) => {
              if (target.affectedStopIds.includes(seg.fromStopId) || target.affectedStopIds.includes(seg.toStopId)) {
                seg.currentTravelTimeMin += target.travelTimeDelayMin!;
                seg.trafficCongestionFactor = 1.9;
              }
            });
          }
        });
      } else if (target.category === 'Vehicle Breakdown' && target.affectedVehicleId) {
        const v = vehicles.find((veh) => veh.id === target.affectedVehicleId);
        if (v) {
          v.status = 'Maintenance';
          v.speedKmh = 0;
          v.assignedRouteId = null;
        }
      }
    } else {
      // Reset scenario to baseline state
      stops = JSON.parse(JSON.stringify(INITIAL_STOPS));
      routes = JSON.parse(JSON.stringify(INITIAL_ROUTES));
      vehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
    }

    // Revalidate and recompute metrics
    const constraints = validateHardConstraints(routes, vehicles, stops);
    const objective = calculateObjectiveCost(routes, vehicles, stops);

    res.json({
      success: true,
      scenario: target,
      currentObjective: objective,
      constraintsValidation: constraints,
    });
  });

  // 10. Comprehensive Baseline vs Optimized Evaluation endpoint
  app.post('/api/evaluate', (_req: Request, res: Response) => {
    const optResult = runConstraintAwareOptimizer(routes, vehicles, stops, disruptions);
    res.json(optResult.evaluation);
  });

  // Serve Vite or static build
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TransitIQ] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[TransitIQ] Fatal server startup error:', err);
});
