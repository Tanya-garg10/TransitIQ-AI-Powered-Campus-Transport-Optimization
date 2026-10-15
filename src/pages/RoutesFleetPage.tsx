import React, { useState } from 'react';
import { Route, Stop, Vehicle } from '../types/transit';
import {
  MapPin,
  Bus,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Layers,
  Clock,
  X,
  AlertCircle,
} from 'lucide-react';

interface RoutesFleetPageProps {
  routes: Route[];
  stops: Stop[];
  vehicles: Vehicle[];
  onAddStop: (stop: Stop) => void;
  onDeleteStop: (stopId: string) => void;
  onAddRoute: (route: Route) => void;
  onDeleteRoute: (routeId: string) => void;
}

export const RoutesFleetPage: React.FC<RoutesFleetPageProps> = ({
  routes,
  stops,
  vehicles,
  onAddStop,
  onDeleteStop,
  onAddRoute,
  onDeleteRoute,
}) => {
  const [subView, setSubView] = useState<'routes' | 'fleet' | 'stops'>('routes');
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>('RT-RED');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal forms
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddStopModal, setShowAddStopModal] = useState(false);

  // New Route Form State
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteCode, setNewRouteCode] = useState('');
  const [newRouteColor, setNewRouteColor] = useState('#D8FF3E');
  const [newRouteHeadway, setNewRouteHeadway] = useState('15');
  const [selectedRouteStopIds, setSelectedRouteStopIds] = useState<string[]>([]);
  const [routeFormError, setRouteFormError] = useState<string | null>(null);

  // New Stop Form State
  const [newStopName, setNewStopName] = useState('');
  const [newStopCode, setNewStopCode] = useState('');
  const [newStopLat, setNewStopLat] = useState('37.4280');
  const [newStopLng, setNewStopLng] = useState('-122.1700');
  const [newStopZone, setNewStopZone] = useState<Stop['zone']>('Academic');
  const [newStopCap, setNewStopCap] = useState('50');

  const stopMap = new Map(stops.map((s) => [s.id, s]));
  const routeMap = new Map(routes.map((r) => [r.id, r]));

  const filteredRoutes = routes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVehicles = vehicles.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName || !newRouteCode) {
      setRouteFormError('Please enter route name and code.');
      return;
    }
    if (selectedRouteStopIds.length < 2) {
      setRouteFormError('A route must have at least 2 ordered stops.');
      return;
    }

    const segments = [];
    for (let i = 0; i < selectedRouteStopIds.length - 1; i++) {
      segments.push({
        fromStopId: selectedRouteStopIds[i],
        toStopId: selectedRouteStopIds[i + 1],
        distanceKm: 1.2,
        baseTravelTimeMin: 4,
        currentTravelTimeMin: 4,
        trafficCongestionFactor: 1.0,
      });
    }

    const created: Route = {
      id: `RT-${newRouteCode.toUpperCase()}`,
      name: newRouteName,
      shortCode: newRouteCode.toUpperCase(),
      color: newRouteColor,
      stopIds: selectedRouteStopIds,
      segments,
      scheduledHeadwayMin: parseInt(newRouteHeadway) || 15,
      operatingHours: '07:30 - 22:30',
      assignedVehicleIds: [],
      totalDistanceKm: Number((segments.length * 1.2).toFixed(1)),
      cycleTimeMin: segments.length * 4 + 4,
      status: 'Normal',
    };

    onAddRoute(created);
    setShowAddRouteModal(false);
    setNewRouteName('');
    setNewRouteCode('');
    setSelectedRouteStopIds([]);
    setRouteFormError(null);
  };

  const handleCreateStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopName || !newStopCode) return;

    const created: Stop = {
      id: `ST-${String(stops.length + 1).padStart(2, '0')}`,
      name: newStopName,
      code: newStopCode.toUpperCase(),
      lat: parseFloat(newStopLat) || 37.4285,
      lng: parseFloat(newStopLng) || -122.1700,
      zone: newStopZone,
      waitingPassengers: 12,
      hourlyDemand: { '08:00': 40, '12:00': 35, '17:00': 50 },
      boardingRatePerMin: 12,
      alightingRatePerMin: 12,
      shelterCapacity: parseInt(newStopCap) || 45,
    };

    onAddStop(created);
    setShowAddStopModal(false);
    setNewStopName('');
    setNewStopCode('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#D8FF3E] uppercase block">
            Infrastructure & Asset Management
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            ROUTES & FLEET.
          </h1>
        </div>

        {/* Sub-view Switches & Add Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-tab pills */}
          <div className="flex items-center bg-black/40 p-1 rounded-lg border border-white/10 text-xs font-mono">
            <button
              onClick={() => setSubView('routes')}
              className={`px-3 py-1.5 rounded transition cursor-pointer ${
                subView === 'routes'
                  ? 'bg-[#D8FF3E] text-[#101820] font-bold'
                  : 'text-[#69737D] hover:text-white'
              }`}
            >
              Routes ({routes.length})
            </button>
            <button
              onClick={() => setSubView('fleet')}
              className={`px-3 py-1.5 rounded transition cursor-pointer ${
                subView === 'fleet'
                  ? 'bg-[#D8FF3E] text-[#101820] font-bold'
                  : 'text-[#69737D] hover:text-white'
              }`}
            >
              Fleet ({vehicles.length})
            </button>
            <button
              onClick={() => setSubView('stops')}
              className={`px-3 py-1.5 rounded transition cursor-pointer ${
                subView === 'stops'
                  ? 'bg-[#D8FF3E] text-[#101820] font-bold'
                  : 'text-[#69737D] hover:text-white'
              }`}
            >
              Stops ({stops.length})
            </button>
          </div>

          {/* Action buttons */}
          {subView === 'routes' && (
            <button
              onClick={() => {
                setShowAddRouteModal(true);
                setRouteFormError(null);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#D8FF3E] hover:bg-white text-[#101820] font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#101820]" />
              <span>New Route</span>
            </button>
          )}

          {subView === 'stops' && (
            <button
              onClick={() => setShowAddStopModal(true)}
              className="px-3.5 py-2 rounded-lg bg-[#D8FF3E] hover:bg-white text-[#101820] font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#101820]" />
              <span>New Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69737D]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name, corridor code, or ID..."
          className="w-full bg-[#101820] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder:text-[#69737D] focus:outline-none focus:border-[#D8FF3E]"
        />
      </div>

      {/* SUB-VIEW 1: ROUTES DIRECTORY */}
      {subView === 'routes' && (
        <div className="space-y-4">
          {filteredRoutes.map((route) => {
            const isExpanded = expandedRouteId === route.id;
            return (
              <div
                key={route.id}
                className="bg-[#101820] border border-white/10 rounded-xl overflow-hidden shadow-lg transition-all"
              >
                <div
                  onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-[#101820]"
                      style={{ backgroundColor: route.color }}
                    />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-headline font-bold text-base text-white">{route.name}</h3>
                        <span className="font-mono text-xs text-[#69737D] font-bold">({route.shortCode})</span>
                      </div>
                      <p className="text-xs text-[#69737D] font-mono mt-0.5">
                        Operating: {route.operatingHours} • {route.stopIds.length} stops
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-[#69737D] uppercase block">Headway</span>
                      <strong className="text-[#D8FF3E]">{route.scheduledHeadwayMin}m</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#69737D] uppercase block">Cycle</span>
                      <strong className="text-white">{route.cycleTimeMin}m</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#69737D] uppercase block">Fleet Assigned</span>
                      <span className="text-white">{route.assignedVehicleIds.length} vehicles</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRoute(route.id);
                        }}
                        className="p-1.5 rounded text-[#69737D] hover:text-[#E04838] transition cursor-pointer"
                        title="Delete Route"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[#69737D]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#69737D]" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Ordered Stops & Travel Times */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-3 bg-black/30 font-mono text-xs">
                    <div className="text-[11px] font-headline font-bold text-white uppercase tracking-wider">
                      Ordered Stop Sequence & Segments:
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {route.stopIds.map((sid, idx) => {
                        const st = stopMap.get(sid);
                        return (
                          <React.Fragment key={sid}>
                            <div className="px-3 py-1.5 rounded bg-black/60 border border-white/10 text-white flex items-center gap-2">
                              <span className="text-[#69737D] text-[10px]">#{idx + 1}</span>
                              <span className="font-bold">{st?.name || sid}</span>
                              <span className="text-[10px] text-[#D8FF3E]">({st?.code || sid})</span>
                            </div>
                            {idx < route.stopIds.length - 1 && (
                              <span className="text-[#69737D]">→</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-VIEW 2: FLEET TABLE */}
      {subView === 'fleet' && (
        <div className="bg-[#101820] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/40 text-[#69737D] text-[10px] uppercase border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Vehicle ID</th>
                  <th className="py-3 px-4">Name / Plate</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Current Load</th>
                  <th className="py-3 px-4">Corridor</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">State of Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredVehicles.map((v) => {
                  const route = v.assignedRouteId ? routeMap.get(v.assignedRouteId) : null;
                  return (
                    <tr key={v.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 font-bold text-white">{v.id}</td>
                      <td className="py-3 px-4 font-sans text-white">
                        <div className="font-semibold">{v.name}</div>
                        <span className="text-[10px] font-mono text-[#69737D]">{v.licensePlate}</span>
                      </td>
                      <td className="py-3 px-4 text-[#69737D] font-sans">{v.type}</td>
                      <td className="py-3 px-4 text-white font-bold">{v.capacity} pax</td>
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
                          {v.currentOccupancy} seats
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {route ? (
                          <span className="font-bold" style={{ color: route.color }}>
                            {route.shortCode}
                          </span>
                        ) : (
                          <span className="text-[#69737D]">Reserve</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#F7F6F0]/80 font-sans">{v.driverName}</td>
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
      )}

      {/* SUB-VIEW 3: STOPS DIRECTORY */}
      {subView === 'stops' && (
        <div className="bg-[#101820] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/40 text-[#69737D] text-[10px] uppercase border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Node ID</th>
                  <th className="py-3 px-4">Name / Code</th>
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4">Coordinates</th>
                  <th className="py-3 px-4">Shelter Capacity</th>
                  <th className="py-3 px-4">Boarding Rate</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stops.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold text-white">{s.id}</td>
                    <td className="py-3 px-4 font-sans text-white">
                      <div className="font-semibold">{s.name}</div>
                      <span className="text-[10px] font-mono text-[#D8FF3E]">{s.code}</span>
                    </td>
                    <td className="py-3 px-4 text-[#69737D] font-sans">{s.zone}</td>
                    <td className="py-3 px-4 text-[#69737D] text-[11px]">
                      {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-white font-bold">{s.shelterCapacity} seats</td>
                    <td className="py-3 px-4 text-[#D8FF3E]">{s.boardingRatePerMin} pax/min</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onDeleteStop(s.id)}
                        className="p-1 rounded text-[#69737D] hover:text-[#E04838] transition cursor-pointer"
                        title="Delete Stop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Route */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101820] border border-white/15 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-headline font-bold text-white text-base">Create Campus Corridor</h3>
              <button onClick={() => setShowAddRouteModal(false)} className="text-[#69737D] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {routeFormError && (
              <div className="p-3 rounded bg-[#E04838]/15 border border-[#E04838]/40 text-[#E04838] text-xs font-mono">
                {routeFormError}
              </div>
            )}

            <form onSubmit={handleCreateRoute} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-[#69737D] block mb-1">Route Name</label>
                <input
                  type="text"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  placeholder="e.g. Yellow Line - Tech Express"
                  className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#D8FF3E]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[#69737D] block mb-1">Code</label>
                  <input
                    type="text"
                    value={newRouteCode}
                    onChange={(e) => setNewRouteCode(e.target.value)}
                    placeholder="YEL"
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-white uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#69737D] block mb-1">Color</label>
                  <input
                    type="color"
                    value={newRouteColor}
                    onChange={(e) => setNewRouteColor(e.target.value)}
                    className="w-full h-10 bg-black/40 border border-white/15 rounded-lg p-1 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[#69737D] block mb-1">Headway (m)</label>
                  <input
                    type="number"
                    value={newRouteHeadway}
                    onChange={(e) => setNewRouteHeadway(e.target.value)}
                    min="5"
                    max="40"
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#69737D] block mb-1">
                  Click Stops to Add in Sequence ({selectedRouteStopIds.length} chosen):
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-black/40 rounded-lg border border-white/10">
                  {stops.map((s) => {
                    const isSelected = selectedRouteStopIds.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedRouteStopIds(selectedRouteStopIds.filter((id) => id !== s.id));
                          } else {
                            setSelectedRouteStopIds([...selectedRouteStopIds, s.id]);
                          }
                        }}
                        className={`p-1.5 rounded text-left transition text-[11px] truncate cursor-pointer ${
                          isSelected ? 'bg-[#D8FF3E] text-[#101820] font-bold' : 'text-[#69737D] hover:text-white'
                        }`}
                      >
                        {s.code} - {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#D8FF3E] text-[#101820] font-headline font-bold uppercase"
                >
                  Save Corridor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Stop */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101820] border border-white/15 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-headline font-bold text-white text-base">Register Transit Node</h3>
              <button onClick={() => setShowAddStopModal(false)} className="text-[#69737D] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStop} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-[#69737D] block mb-1">Stop Name</label>
                <input
                  type="text"
                  value={newStopName}
                  onChange={(e) => setNewStopName(e.target.value)}
                  placeholder="e.g. Innovation Gate"
                  className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#69737D] block mb-1">Code</label>
                  <input
                    type="text"
                    value={newStopCode}
                    onChange={(e) => setNewStopCode(e.target.value)}
                    placeholder="INNO"
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-white uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#69737D] block mb-1">Zone</label>
                  <select
                    value={newStopZone}
                    onChange={(e) => setNewStopZone(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Residential">Residential</option>
                    <option value="Transit Hub">Transit Hub</option>
                    <option value="Research">Research</option>
                    <option value="Athletics">Athletics</option>
                    <option value="Medical">Medical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#D8FF3E] text-[#101820] font-headline font-bold uppercase"
                >
                  Save Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
