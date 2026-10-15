import React, { useState } from 'react';
import { Route, Stop, Vehicle } from '../types/transit';
import { Users, AlertTriangle, TrendingUp, ShieldAlert, BarChart2, Layers } from 'lucide-react';

interface DemandCapacityPageProps {
  stops: Stop[];
  routes: Route[];
  vehicles: Vehicle[];
}

export const DemandCapacityPage: React.FC<DemandCapacityPageProps> = ({
  stops,
  routes,
  vehicles,
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('08:00');

  const totalDemand = stops.reduce((sum, s) => sum + (s.hourlyDemand[selectedTimeSlot] || s.waitingPassengers), 0);
  const totalFleetCapacity = vehicles
    .filter((v) => v.status === 'In Service')
    .reduce((sum, v) => sum + v.capacity, 0);

  // Ranked stops by demand
  const rankedStops = [...stops].sort((a, b) => {
    const demA = a.hourlyDemand[selectedTimeSlot] || a.waitingPassengers;
    const demB = b.hourlyDemand[selectedTimeSlot] || b.waitingPassengers;
    return demB - demA;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls: Time Window Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white">Campus Passenger Demand & Capacity Audit</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict unserved queue accounting: passengers exceeding vehicle capacity are logged as unmet demand.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-400 px-2">Window:</span>
          {['08:00', '09:00', '12:00', '15:00', '17:00', '20:00'].map((slot) => (
            <button
              key={slot}
              onClick={() => setSelectedTimeSlot(slot)}
              className={`px-2.5 py-1 rounded transition cursor-pointer ${
                selectedTimeSlot === slot
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Capacity vs Demand Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 block mb-1">Total Window Demand</span>
          <div className="text-2xl font-bold font-mono text-cyan-400">{totalDemand} pax/hr</div>
          <p className="text-[11px] text-slate-400 mt-1">Aggregated across all 14 academic & residential stops</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 block mb-1">Instant Fleet Capacity</span>
          <div className="text-2xl font-bold font-mono text-teal-400">{totalFleetCapacity} seats</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {vehicles.filter((v) => v.status === 'In Service').length} vehicles actively in circulation
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-slate-400 block mb-1">Overcrowding Risk Level</span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {totalDemand > 900 ? 'High (Peak Rush)' : 'Moderate (Feasible)'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Capacity headroom: {Math.max(0, totalFleetCapacity * 4 - totalDemand)} pax reserve
          </p>
        </div>
      </div>

      {/* Ranked Demand Table with Visual Heat Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Ranked Stop Passenger Demand & Shelter Load
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Time: {selectedTimeSlot} hrs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Rank</th>
                <th className="py-2.5 px-4">Stop Name</th>
                <th className="py-2.5 px-4">Zone</th>
                <th className="py-2.5 px-4">Demand ({selectedTimeSlot})</th>
                <th className="py-2.5 px-4">Shelter Capacity</th>
                <th className="py-2.5 px-4">Demand vs Capacity Bar</th>
                <th className="py-2.5 px-4">Queue Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rankedStops.map((stop, idx) => {
                const dem = stop.hourlyDemand[selectedTimeSlot] || stop.waitingPassengers;
                const ratio = dem / (stop.shelterCapacity || 1);
                const isOvercrowded = ratio > 1.0;
                const isWarning = ratio > 0.8 && !isOvercrowded;

                return (
                  <tr key={stop.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono text-slate-400">#{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      <div className="font-bold">{stop.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">ID: {stop.id} • {stop.code}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{stop.zone}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-100">
                      {dem} <span className="text-[10px] text-slate-400 font-normal">pax</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{stop.shelterCapacity} seats</td>
                    <td className="py-3 px-4 w-60">
                      <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isOvercrowded ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-teal-400'
                          }`}
                          style={{ width: `${Math.min(100, ratio * 100)}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {Math.round(ratio * 100)}% load factor
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isOvercrowded ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800/50 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Overcrowded</span>
                        </span>
                      ) : isWarning ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800/50 w-fit block">
                          Near Capacity
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 w-fit block">
                          Nominal
                        </span>
                      )}
                    </td>
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
