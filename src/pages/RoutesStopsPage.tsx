import React, { useState } from 'react';
import { Route, Stop } from '../types/transit';
import { MapPin, Plus, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react';

interface RoutesStopsPageProps {
  routes: Route[];
  stops: Stop[];
  onAddStop: (stop: Stop) => void;
  onUpdateStop: (stop: Stop) => void;
  onDeleteStop: (stopId: string) => void;
  onAddRoute: (route: Route) => void;
  onUpdateRoute: (route: Route) => void;
  onDeleteRoute: (routeId: string) => void;
}

export const RoutesStopsPage: React.FC<RoutesStopsPageProps> = ({
  routes,
  stops,
  onAddStop,
  onUpdateStop,
  onDeleteStop,
  onAddRoute,
  onUpdateRoute,
  onDeleteRoute,
}) => {
  const [activeTab, setActiveTab] = useState<'routes' | 'stops'>('routes');
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);

  // Stop Form State
  const [newStopName, setNewStopName] = useState('');
  const [newStopCode, setNewStopCode] = useState('');
  const [newStopLat, setNewStopLat] = useState('37.4280');
  const [newStopLng, setNewStopLng] = useState('-122.1700');
  const [newStopZone, setNewStopZone] = useState<Stop['zone']>('Academic');
  const [newStopCapacity, setNewStopCapacity] = useState('50');

  // Route Form State
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteCode, setNewRouteCode] = useState('');
  const [newRouteColor, setNewRouteColor] = useState('#06B6D4');
  const [newRouteHeadway, setNewRouteHeadway] = useState('15');
  const [selectedRouteStopIds, setSelectedRouteStopIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopName || !newStopCode) {
      setFormError('Please provide both stop name and code.');
      return;
    }
    const lat = parseFloat(newStopLat);
    const lng = parseFloat(newStopLng);
    if (isNaN(lat) || isNaN(lng)) {
      setFormError('Invalid latitude/longitude coordinates.');
      return;
    }

    const created: Stop = {
      id: `ST-${String(stops.length + 1).padStart(2, '0')}`,
      name: newStopName,
      code: newStopCode.toUpperCase(),
      lat,
      lng,
      zone: newStopZone,
      waitingPassengers: 10,
      hourlyDemand: { '08:00': 40, '12:00': 35, '17:00': 50 },
      boardingRatePerMin: 12,
      alightingRatePerMin: 12,
      shelterCapacity: parseInt(newStopCapacity) || 45,
    };

    onAddStop(created);
    setShowAddStopModal(false);
    setNewStopName('');
    setNewStopCode('');
    setFormError(null);
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName || !newRouteCode) {
      setFormError('Please enter route name and code.');
      return;
    }
    if (selectedRouteStopIds.length < 2) {
      setFormError('A route must contain at least 2 ordered stops.');
      return;
    }

    // Build segments
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
    setFormError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white">Campus Routes & Stops Network Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure topological stop sequences, segment travel times, and vehicle headways.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('routes')}
              className={`px-3 py-1.5 rounded transition cursor-pointer ${
                activeTab === 'routes'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Routes ({routes.length})
            </button>
            <button
              onClick={() => setActiveTab('stops')}
              className={`px-3 py-1.5 rounded transition cursor-pointer ${
                activeTab === 'stops'
                  ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stops ({stops.length})
            </button>
          </div>

          {activeTab === 'routes' ? (
            <button
              onClick={() => {
                setShowAddRouteModal(true);
                setFormError(null);
              }}
              className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Route</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setShowAddStopModal(true);
                setFormError(null);
              }}
              className="px-3 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* Routes View */}
      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative group"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-900"
                    style={{ backgroundColor: route.color }}
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{route.name}</h3>
                    <span className="font-mono text-xs text-slate-400">
                      ID: {route.id} • {route.operatingHours}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      route.status === 'Normal'
                        ? 'bg-teal-950 text-teal-300 border border-teal-800/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                    }`}
                  >
                    {route.status}
                  </span>
                  <button
                    onClick={() => onDeleteRoute(route.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                    title="Delete Route"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Headway</span>
                  <span className="text-cyan-400 font-bold">{route.scheduledHeadwayMin} min</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Cycle Time</span>
                  <span className="text-slate-200">{route.cycleTimeMin} min</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Length</span>
                  <span className="text-slate-200">{route.totalDistanceKm} km</span>
                </div>
              </div>

              {/* Stop Sequence */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Ordered Stop Sequence ({route.stopIds.length} stops):
                </span>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                  {route.stopIds.map((sid, idx) => {
                    const st = stops.find((s) => s.id === sid);
                    return (
                      <React.Fragment key={sid}>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {st?.code || sid}
                        </span>
                        {idx < route.stopIds.length - 1 && (
                          <span className="text-slate-600">→</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stops View */}
      {activeTab === 'stops' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Stop ID</th>
                  <th className="py-2.5 px-4">Stop Name</th>
                  <th className="py-2.5 px-4">Zone</th>
                  <th className="py-2.5 px-4">Coordinates</th>
                  <th className="py-2.5 px-4">Shelter Cap</th>
                  <th className="py-2.5 px-4">Boarding Rate</th>
                  <th className="py-2.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {stops.map((stop) => (
                  <tr key={stop.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-cyan-400">{stop.id}</td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-200">
                      <div>{stop.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Code: {stop.code}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400">{stop.zone}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{stop.shelterCapacity} pax</td>
                    <td className="py-3 px-4 text-teal-400">{stop.boardingRatePerMin} pax/min</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onDeleteStop(stop.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        title="Delete Stop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Register New Campus Transit Stop</h3>
              <button
                onClick={() => setShowAddStopModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStop} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Stop Name</label>
                <input
                  type="text"
                  value={newStopName}
                  onChange={(e) => setNewStopName(e.target.value)}
                  placeholder="e.g. North Gate Innovation Lab"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Short Code</label>
                  <input
                    type="text"
                    value={newStopCode}
                    onChange={(e) => setNewStopCode(e.target.value)}
                    placeholder="e.g. INNO"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 uppercase font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Campus Zone</label>
                  <select
                    value={newStopZone}
                    onChange={(e) => setNewStopZone(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Latitude</label>
                  <input
                    type="text"
                    value={newStopLat}
                    onChange={(e) => setNewStopLat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Longitude</label>
                  <input
                    type="text"
                    value={newStopLng}
                    onChange={(e) => setNewStopLng(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                >
                  Save Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Create New Campus Transit Route</h3>
              <button
                onClick={() => setShowAddRouteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRoute} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Route Name</label>
                <input
                  type="text"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  placeholder="e.g. Yellow Line - Tech Shuttle"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Code</label>
                  <input
                    type="text"
                    value={newRouteCode}
                    onChange={(e) => setNewRouteCode(e.target.value)}
                    placeholder="YEL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono uppercase text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Color</label>
                  <input
                    type="color"
                    value={newRouteColor}
                    onChange={(e) => setNewRouteColor(e.target.value)}
                    className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg p-1 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Headway (min)</label>
                  <input
                    type="number"
                    value={newRouteHeadway}
                    onChange={(e) => setNewRouteHeadway(e.target.value)}
                    min="5"
                    max="40"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Select Ordered Stops (Click to add in sequence):
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
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
                        className={`p-1.5 rounded text-left transition flex items-center justify-between ${
                          isSelected ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        <span className="font-mono text-[10px] ml-1">{s.code}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  Selected sequence: {selectedRouteStopIds.length} stops
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
