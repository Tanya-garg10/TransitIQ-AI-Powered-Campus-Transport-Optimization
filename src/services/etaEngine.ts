import { Stop, Route, Vehicle, ETAPrediction } from '../types/transit';

/**
 * Calculates downstream ETAs for all vehicles and downstream stops,
 * computing confidence intervals, scheduled vs dynamic ETA, and MAE against simulated ground-truth.
 */
export function computeVehicleETAs(
  vehicles: Vehicle[],
  routes: Route[],
  stops: Stop[],
  currentTime = '08:42:00'
): {
  predictions: ETAPrediction[];
  overallMaeMinutes: number;
  maxAbsoluteErrorMinutes: number;
  sampleCount: number;
} {
  const stopMap = new Map(stops.map((s) => [s.id, s]));
  const routeMap = new Map(routes.map((r) => [r.id, r]));

  const predictions: ETAPrediction[] = [];
  const [currentH, currentM] = currentTime.split(':').map(Number);
  const currentTotalMin = currentH * 60 + currentM;

  vehicles.forEach((vehicle) => {
    if (!vehicle.assignedRouteId || vehicle.status === 'Standby / Spare' || vehicle.status === 'Maintenance') {
      return;
    }

    const route = routeMap.get(vehicle.assignedRouteId);
    if (!route) return;

    // Find index of current stop in route stopIds
    const currentStopIdx = route.stopIds.indexOf(vehicle.currentStopId);
    if (currentStopIdx === -1) return;

    let cumulativeTravelMin = 0;
    let scheduledCumulativeMin = 0;

    // Project arrivals for next stops along the cycle
    const totalStops = route.stopIds.length;
    for (let step = 1; step <= Math.min(4, totalStops - 1); step++) {
      const targetIdx = (currentStopIdx + step) % totalStops;
      const targetStopId = route.stopIds[targetIdx];
      const targetStop = stopMap.get(targetStopId);
      if (!targetStop) continue;

      // Find segment connecting previous to target
      const prevStopId = route.stopIds[(targetIdx - 1 + totalStops) % totalStops];
      const segment = route.segments.find(
        (s) => s.fromStopId === prevStopId && s.toStopId === targetStopId
      );

      const baseTravel = segment ? segment.baseTravelTimeMin : 4;
      const currentTravel = segment ? segment.currentTravelTimeMin : 4;
      const congestionFactor = segment ? segment.trafficCongestionFactor : 1.0;

      // Dwell time model: 20 seconds base + 2.5 seconds per boarding/alighting passenger
      const estimatedDwellMin = (20 + (targetStop.waitingPassengers * 0.15 * 2.5)) / 60;

      cumulativeTravelMin += currentTravel + estimatedDwellMin;
      scheduledCumulativeMin += baseTravel + 0.5;

      const predArrivalMin = currentTotalMin + cumulativeTravelMin;
      const schedArrivalMin = currentTotalMin + scheduledCumulativeMin;

      // Simulated ground truth: introduces slight micro-stochasticity (e.g. traffic light jitter ±0.6 min)
      // Deterministic seed based on vehicle & stop id for reproducibility
      const jitterHash = (vehicle.id.charCodeAt(3) * 7 + targetStopId.charCodeAt(4) * 11) % 9;
      const simulatedStochasticJitter = (jitterHash - 4) * 0.25; // between -1.0 and +1.0 min
      const groundTruthArrivalMin = predArrivalMin + (congestionFactor > 1.2 ? 0.8 : simulatedStochasticJitter);

      // Uncertainty window expands with cumulative distance (+- 1.5m to +- 3m)
      const uncertaintyRadius = Math.min(3.5, 1.2 + step * 0.6);

      const formatTime = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = Math.floor(totalMinutes % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      };

      const error = Math.abs(predArrivalMin - groundTruthArrivalMin);

      predictions.push({
        stopId: targetStopId,
        stopName: targetStop.name,
        routeId: route.id,
        vehicleId: vehicle.id,
        scheduledArrival: formatTime(schedArrivalMin),
        estimatedArrival: formatTime(predArrivalMin),
        arrivalWindowStart: formatTime(predArrivalMin - uncertaintyRadius),
        arrivalWindowEnd: formatTime(predArrivalMin + uncertaintyRadius),
        groundTruthArrival: formatTime(groundTruthArrivalMin),
        errorMinutes: Number(error.toFixed(2)),
        confidenceScore: Number(Math.max(0.72, 0.98 - step * 0.06).toFixed(2)),
        isCongested: congestionFactor > 1.15,
      });
    }
  });

  const totalError = predictions.reduce((sum, p) => sum + p.errorMinutes, 0);
  const overallMae = predictions.length > 0 ? totalError / predictions.length : 0;
  const maxError = predictions.reduce((max, p) => Math.max(max, p.errorMinutes), 0);

  return {
    predictions,
    overallMaeMinutes: Number(overallMae.toFixed(2)),
    maxAbsoluteErrorMinutes: Number(maxError.toFixed(2)),
    sampleCount: predictions.length,
  };
}
