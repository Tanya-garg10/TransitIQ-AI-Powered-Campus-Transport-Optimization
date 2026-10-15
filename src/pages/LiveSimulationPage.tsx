import React, { useState } from 'react';
import { Route, Stop, Vehicle } from '../types/transit';
import { SimulationMap } from '../components/SimulationMap';
import {
  Bus,
  MapPin,
  Clock,
  Battery,
  UserCheck,
  AlertCircle,
  Radio,
  Layers,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface LiveSimulationPageProps {
  stops: Stop[];
  routes: Route[];
  vehicles: Vehicle[];
  simulationTime: string;
}

export const LiveSimulationPage: React.FC<LiveSimulationPageProps> = ({
  stops,
  routes,
  vehicles,
  simulationTime,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('V-101');
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Service' | 'Standby' | 'Delayed'>('All');

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const selectedStop = stops.find((s) => s.id === selectedStopId);
  const routeMap = new Map(routes.map((r) => [r.id, r]));
  const stopMap = new Map(stops.map((s) => [s.id, s]));

  const filteredVehicles = vehicles.filter((v) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'In Service') return v.status === 'In Service';
    if (statusFilter === 'Standby') return v.status === 'Standby / Spare';
    if (statusFilter === 'Delayed') return v.status === 'Delayed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div>
            <div className="text-xs font-bold text-slate-200">
              Campus Geospatial Telemetry Feed
            </div>
            <div className="text-[11px] text-slate-400">
              Simulated kinematic GPS coordinates updated every second • 14 campus stops mapped
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Simulation Clock:</span>
          <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-cyan-900 font-bold">
            {simulationTime}
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Telemetry Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Simulation Map */}
        <div className="lg:col-span-2 h-[540px]">
          <SimulationMap
            stops={stops}
            routes={routes}
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            selectedStopId={selectedStopId}
            onSelectVehicle={(id) => {
              setSelectedVehicleId(id);
              setSelectedStopId(null);
            }}
            onSelectStop={(id) => {
              setSelectedStopId(id);
            }}
          />
        </div>

        {/* Right Col: Selected Entity Telemetry Panel */}
        <div className="space-y-4">
          {/* Selected Vehicle Card */}
          {selectedVehicle && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                    style={{
                      backgroundColor:
                        selectedVehicle.assignedRouteId
                          ? routeMap.get(selectedVehicle.assignedRouteId)?.color || '#06B6D4'
                          : '#64748B',
                    }}
                  >
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{selectedVehicle.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      ID: {selectedVehicle.id} • {selectedVehicle.licensePlate}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    selectedVehicle.status === 'In Service'
                      ? 'bg-teal-950 text-teal-300 border border-teal-800/40'
                      : selectedVehicle.status === 'Delayed'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {selectedVehicle.status}
                </span>
              </div>

              {/* Occupancy Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Passenger Load</span>
                  <span className="font-mono text-slate-200">
                    <strong
                      className={
                        selectedVehicle.currentOccupancy >= selectedVehicle.capacity
                          ? 'text-rose-400'
                          : 'text-cyan-400'
                      }
                    >
                      {selectedVehicle.currentOccupancy}
                    </strong>{' '}
                    / {selectedVehicle.capacity} pax (
                    {Math.round((selectedVehicle.currentOccupancy / selectedVehicle.capacity) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      selectedVehicle.currentOccupancy >= selectedVehicle.capacity
                        ? 'bg-rose-500'
                        : selectedVehicle.currentOccupancy / selectedVehicle.capacity > 0.8
                        ? 'bg-amber-400'
                        : 'bg-cyan-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (selectedVehicle.currentOccupancy / selectedVehicle.capacity) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    <span>Driver</span>
                  </div>
                  <div className="font-medium text-slate-200 mt-0.5 truncate">
                    {selectedVehicle.driverName}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Battery className="w-3 h-3 text-emerald-400" />
                    <span>Battery / State</span>
                  </div>
                  <div className="font-mono font-medium text-emerald-400 mt-0.5">
                    {selectedVehicle.batteryOrFuelPercent}% SoC
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Current Speed</span>
                  </div>
                  <div className="font-mono font-medium text-slate-200 mt-0.5">
                    {selectedVehicle.speedKmh} km/h ({selectedVehicle.bearing}°)
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-400" />
                    <span>Next Stop</span>
                  </div>
                  <div className="font-medium text-teal-300 mt-0.5 truncate">
                    {stopMap.get(selectedVehicle.nextStopId)?.code || selectedVehicle.nextStopId}
                  </div>
                </div>
              </div>

              {/* Route & GPS Ping Info */}
              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Route:</span>
                  <span className="font-semibold text-slate-200">
                    {selectedVehicle.assignedRouteId
                      ? routeMap.get(selectedVehicle.assignedRouteId)?.name
                      : 'Unassigned Depot Standby'}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                  <span>GPS Timestamp:</span>
                  <span>{selectedVehicle.lastGpsTimestamp}</span>
                </div>
              </div>
            </div>
          )}

          {/* Selected Stop Details (if clicked) */}
          {selectedStop && (
            <div className="bg-slate-900 border border-teal-500/30 rounded-xl p-4 space-y-3 shadow-md animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <h3 className="font-bold text-xs text-slate-100">{selectedStop.name}</h3>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 bg-slate-800 text-teal-400 rounded">
                  {selectedStop.code}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Waiting Queue</span>
                  <span className="font-mono font-bold text-teal-400 text-sm">
                    {selectedStop.waitingPassengers} pax
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Shelter Cap</span>
                  <span className="font-mono font-medium text-slate-300 text-sm">
                    {selectedStop.shelterCapacity} pax
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Boarding throughput: <span className="text-slate-200">{selectedStop.boardingRatePerMin} pax/min</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fleet Telemetry Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-100">Simulated Fleet Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">Click any vehicle to center map tracking and telemetry</p>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {(['All', 'In Service', 'Standby', 'Delayed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Vehicle</th>
                <th className="py-2.5 px-4">Class</th>
                <th className="py-2.5 px-4">Line</th>
                <th className="py-2.5 px-4">Occupancy</th>
                <th className="py-2.5 px-4">Speed</th>
                <th className="py-2.5 px-4">Next Stop</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Battery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredVehicles.map((v) => {
                const route = v.assignedRouteId ? routeMap.get(v.assignedRouteId) : null;
                const isSelected = selectedVehicleId === v.id;
                return (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`cursor-pointer transition ${
                      isSelected ? 'bg-cyan-950/30 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-sans font-semibold flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: route?.color || '#64748B' }}
                      />
                      <span>{v.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">({v.id})</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-sans">{v.type}</td>
                    <td className="py-2.5 px-4">
                      {route ? (
                        <span style={{ color: route.color }} className="font-bold">
                          {route.shortCode}
                        </span>
                      ) : (
                        <span className="text-slate-500">Standby</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={
                          v.currentOccupancy >= v.capacity
                            ? 'text-rose-400 font-bold'
                            : v.currentOccupancy / v.capacity > 0.8
                            ? 'text-amber-400 font-medium'
                            : 'text-cyan-400'
                        }
                      >
                        {v.currentOccupancy}/{v.capacity}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">{v.speedKmh} km/h</td>
                    <td className="py-2.5 px-4 text-slate-300 font-sans">
                      {stopMap.get(v.nextStopId)?.name || v.nextStopId}
                    </td>
                    <td className="py-2.5 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          v.status === 'In Service'
                            ? 'bg-teal-950 text-teal-300 border border-teal-800/40'
                            : v.status === 'Delayed'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400">{v.batteryOrFuelPercent}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
