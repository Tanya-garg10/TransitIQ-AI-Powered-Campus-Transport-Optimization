import React, { useState } from 'react';
import { Route, Stop, Vehicle } from '../types/transit';
import { SimulationMap } from '../components/SimulationMap';
import {
  Bus,
  Clock,
  Battery,
  UserCheck,
  AlertTriangle,
  Radio,
  MapPin,
  ChevronRight,
  Gauge,
} from 'lucide-react';

interface LiveOperationsPageProps {
  stops: Stop[];
  routes: Route[];
  vehicles: Vehicle[];
  simulationTime: string;
}

export const LiveOperationsPage: React.FC<LiveOperationsPageProps> = ({
  stops,
  routes,
  vehicles,
  simulationTime,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('V-101');
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'All' | 'In Service' | 'Standby' | 'Delayed'>('All');

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const selectedStop = stops.find((s) => s.id === selectedStopId);
  const routeMap = new Map(routes.map((r) => [r.id, r]));
  const stopMap = new Map(stops.map((s) => [s.id, s]));

  const filteredVehicles = vehicles.filter((v) => {
    if (filterMode === 'All') return true;
    if (filterMode === 'In Service') return v.status === 'In Service';
    if (filterMode === 'Standby') return v.status === 'Standby / Spare';
    if (filterMode === 'Delayed') return v.status === 'Delayed';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#D8FF3E] uppercase block">
            Real-Time Telemetry & Spatial Control
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            THE NETWORK, NOW.
          </h1>
        </div>

        {/* Status Counters */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D8FF3E]" />
            <span>{vehicles.filter((v) => v.status === 'In Service').length} EN ROUTE</span>
          </div>
          <div className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-[#69737D]">
            <span>CLOCK: <strong className="text-white">{simulationTime}</strong></span>
          </div>
        </div>
      </div>

      {/* MAP-FIRST WORKSPACE (Occupies Primary Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Central Leaflet Map (8 cols) */}
        <div className="lg:col-span-8 h-[600px] rounded-xl overflow-hidden shadow-2xl">
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
            onSelectStop={(id) => setSelectedStopId(id)}
          />
        </div>

        {/* Selected Entity Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedVehicle && (
            <div className="bg-[#101820] border border-white/15 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white"
                    style={{
                      backgroundColor:
                        selectedVehicle.assignedRouteId
                          ? routeMap.get(selectedVehicle.assignedRouteId)?.color || '#69737D'
                          : '#69737D',
                    }}
                  >
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-base text-white">{selectedVehicle.name}</h3>
                    <p className="text-[11px] font-mono text-[#69737D]">
                      ID: {selectedVehicle.id} • {selectedVehicle.licensePlate}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    selectedVehicle.status === 'In Service'
                      ? 'bg-[#D8FF3E]/10 text-[#D8FF3E] border border-[#D8FF3E]/30'
                      : selectedVehicle.status === 'Delayed'
                      ? 'bg-[#E04838]/15 text-[#E04838] border border-[#E04838]/40'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {selectedVehicle.status}
                </span>
              </div>

              {/* Occupancy Bar */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#69737D]">Passenger Load</span>
                  <span className="text-white">
                    <strong
                      className={
                        selectedVehicle.currentOccupancy >= selectedVehicle.capacity
                          ? 'text-[#E04838]'
                          : 'text-[#D8FF3E]'
                      }
                    >
                      {selectedVehicle.currentOccupancy}
                    </strong>{' '}
                    / {selectedVehicle.capacity} seats ({Math.round((selectedVehicle.currentOccupancy / selectedVehicle.capacity) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded bg-black/60 overflow-hidden flex border border-white/10">
                  <div
                    className={`h-full transition-all duration-300 ${
                      selectedVehicle.currentOccupancy >= selectedVehicle.capacity
                        ? 'bg-[#E04838]'
                        : selectedVehicle.currentOccupancy / selectedVehicle.capacity > 0.8
                        ? 'bg-[#E58B20]'
                        : 'bg-[#D8FF3E]'
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

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-black/40 border border-white/10">
                  <span className="text-[10px] text-[#69737D] uppercase block">Assigned Corridor</span>
                  <div className="font-bold text-white mt-1 truncate">
                    {selectedVehicle.assignedRouteId
                      ? routeMap.get(selectedVehicle.assignedRouteId)?.name
                      : 'Standby Depot Reserve'}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/10">
                  <span className="text-[10px] text-[#69737D] uppercase block">Next Destination</span>
                  <div className="font-bold text-[#D8FF3E] mt-1 truncate">
                    {stopMap.get(selectedVehicle.nextStopId)?.code || selectedVehicle.nextStopId}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/10">
                  <span className="text-[10px] text-[#69737D] uppercase block">Ground Velocity</span>
                  <div className="font-bold text-white mt-1">
                    {selectedVehicle.speedKmh} km/h <span className="text-[#69737D] text-[10px]">({selectedVehicle.bearing}°)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/10">
                  <span className="text-[10px] text-[#69737D] uppercase block">Battery State</span>
                  <div className="font-bold text-[#D8FF3E] mt-1">
                    {selectedVehicle.batteryOrFuelPercent}% SoC
                  </div>
                </div>
              </div>

              {/* Driver & Telemetry Signature */}
              <div className="p-3 rounded bg-white/5 border border-white/5 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-[#69737D]">
                  <span>Operator:</span>
                  <span className="text-white font-medium">{selectedVehicle.driverName}</span>
                </div>
                <div className="flex justify-between text-[#69737D] text-[10px]">
                  <span>Last GPS Ping:</span>
                  <span>{selectedVehicle.lastGpsTimestamp}</span>
                </div>
              </div>
            </div>
          )}

          {/* Selected Stop Details (if stop clicked) */}
          {selectedStop && (
            <div className="bg-[#101820] border border-[#D8FF3E]/40 rounded-xl p-4 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D8FF3E]" />
                  <span className="font-bold text-white">{selectedStop.name}</span>
                </div>
                <span className="text-[#D8FF3E]">{selectedStop.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#69737D]">Waiting Passengers:</span>
                <span className="font-bold text-[#D8FF3E]">{selectedStop.waitingPassengers} pax</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#69737D]">Shelter Capacity:</span>
                <span className="text-white">{selectedStop.shelterCapacity} seats</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slim Vehicle Fleet Table Underneath */}
      <div className="bg-[#101820] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-headline font-bold text-sm text-white uppercase tracking-wider">
              Fleet Telemetry Registry
            </h3>
            <p className="text-xs text-[#69737D] mt-0.5">Click any shuttle row to sync map coordinates</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/10 text-xs font-mono">
            {(['All', 'In Service', 'Standby', 'Delayed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterMode(filter)}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  filterMode === filter
                    ? 'bg-[#D8FF3E] text-[#101820] font-bold'
                    : 'text-[#69737D] hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/40 text-[#69737D] text-[10px] uppercase border-b border-white/10">
              <tr>
                <th className="py-2.5 px-4">Vehicle</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Corridor</th>
                <th className="py-2.5 px-4">Occupancy</th>
                <th className="py-2.5 px-4">Speed</th>
                <th className="py-2.5 px-4">Next Stop</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Battery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVehicles.map((v) => {
                const route = v.assignedRouteId ? routeMap.get(v.assignedRouteId) : null;
                const isSelected = selectedVehicleId === v.id;
                return (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-[#F7F6F0]/80'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: route?.color || '#69737D' }} />
                      <span>{v.name}</span>
                      <span className="text-[10px] text-[#69737D]">({v.id})</span>
                    </td>
                    <td className="py-3 px-4 text-[#69737D] font-sans">{v.type}</td>
                    <td className="py-3 px-4 font-bold" style={{ color: route?.color || '#69737D' }}>
                      {route ? route.shortCode : 'Standby'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          v.currentOccupancy >= v.capacity
                            ? 'text-[#E04838] font-bold'
                            : v.currentOccupancy / v.capacity > 0.8
                            ? 'text-[#E58B20]'
                            : 'text-[#D8FF3E]'
                        }
                      >
                        {v.currentOccupancy} / {v.capacity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">{v.speedKmh} km/h</td>
                    <td className="py-3 px-4 text-white font-sans">{stopMap.get(v.nextStopId)?.code || v.nextStopId}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          v.status === 'In Service'
                            ? 'bg-[#D8FF3E]/10 text-[#D8FF3E]'
                            : v.status === 'Delayed'
                            ? 'bg-[#E04838]/15 text-[#E04838]'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#D8FF3E]">{v.batteryOrFuelPercent}%</td>
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
