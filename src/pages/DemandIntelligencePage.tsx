import React, { useState } from 'react';
import { Route, Stop, Vehicle } from '../types/transit';
import {
  Users,
  AlertTriangle,
  Flame,
  Filter,
  BarChart2,
  TrendingUp,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface DemandIntelligencePageProps {
  stops: Stop[];
  routes: Route[];
  vehicles: Vehicle[];
}

export const DemandIntelligencePage: React.FC<DemandIntelligencePageProps> = ({
  stops,
  routes,
  vehicles,
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('08:00');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const timeSlots = ['08:00', '09:00', '12:00', '15:00', '17:00', '20:00'];
  const zones = ['All', 'Academic', 'Residential', 'Transit Hub', 'Athletics', 'Research', 'Medical'];

  // Filter stops
  const filteredStops = stops.filter((s) => {
    if (selectedZone === 'All') return true;
    return s.zone === selectedZone;
  });

  // Ranked stops by demand in selected time slot
  const rankedStops = [...filteredStops].sort((a, b) => {
    const demA = a.hourlyDemand[selectedTimeSlot] || a.waitingPassengers;
    const demB = b.hourlyDemand[selectedTimeSlot] || b.waitingPassengers;
    return demB - demA;
  });

  const activeStop = stops.find((s) => s.id === selectedStopId) || rankedStops[0];

  const totalDemandInSlot = filteredStops.reduce(
    (acc, s) => acc + (s.hourlyDemand[selectedTimeSlot] || s.waitingPassengers),
    0
  );

  const totalFleetCapacity = vehicles
    .filter((v) => v.status === 'In Service')
    .reduce((sum, v) => sum + v.capacity, 0);

  // Helper for Heatmap cell color intensity
  const getHeatmapColor = (demand: number) => {
    if (demand > 130) return 'bg-[#E04838] text-white font-bold'; // Severe peak
    if (demand > 90) return 'bg-[#E58B20] text-black font-semibold'; // High
    if (demand > 50) return 'bg-[#D8FF3E]/70 text-black font-medium'; // Moderate
    if (demand > 25) return 'bg-[#D8FF3E]/20 text-[#D8FF3E]'; // Low
    return 'bg-white/5 text-[#69737D]'; // Minimal
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#D8FF3E] uppercase block">
            Spatial Demand & Capacity Analytics
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            WHERE DEMAND BUILDS.
          </h1>
        </div>

        {/* Global Window Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Slot Picker */}
          <div className="flex items-center bg-black/40 p-1 rounded-lg border border-white/10 text-xs font-mono">
            <span className="text-[#69737D] px-2 text-[10px] uppercase">Window:</span>
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedTimeSlot(slot)}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  selectedTimeSlot === slot
                    ? 'bg-[#D8FF3E] text-[#101820] font-bold'
                    : 'text-[#69737D] hover:text-white'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>

          {/* Zone Filter */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-[#101820] border border-white/15 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#D8FF3E]"
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                Zone: {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top High-Contrast Insight Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-[#101820] border border-white/10 rounded-xl p-5">
          <span className="text-[#69737D] text-[10px] uppercase tracking-wider block">Total Slot Passenger Demand</span>
          <div className="text-3xl font-extrabold text-white mt-1">
            {totalDemandInSlot} <span className="text-xs text-[#69737D] font-normal">pax/hour</span>
          </div>
          <span className="text-[11px] text-[#D8FF3E] mt-1 block">
            Peak corridor: {rankedStops[0]?.name} ({rankedStops[0]?.hourlyDemand[selectedTimeSlot] || 0} pax)
          </span>
        </div>

        <div className="bg-[#101820] border border-white/10 rounded-xl p-5">
          <span className="text-[#69737D] text-[10px] uppercase tracking-wider block">Circulating Seat Capacity</span>
          <div className="text-3xl font-extrabold text-[#D8FF3E] mt-1">
            {totalFleetCapacity} <span className="text-xs text-[#69737D] font-normal">seats / cycle</span>
          </div>
          <span className="text-[11px] text-[#69737D] mt-1 block">
            {vehicles.filter((v) => v.status === 'In Service').length} active shuttles running
          </span>
        </div>

        <div className="bg-[#101820] border border-white/10 rounded-xl p-5">
          <span className="text-[#69737D] text-[10px] uppercase tracking-wider block">Demand / Capacity Margin</span>
          <div className="text-3xl font-extrabold text-[#E58B20] mt-1">
            {totalDemandInSlot > totalFleetCapacity * 2 ? 'SURGE STATE' : 'BALANCED'}
          </div>
          <span className="text-[11px] text-[#69737D] mt-1 block">
            Unmet demand tracking enabled (zero silent drops)
          </span>
        </div>
      </div>

      {/* PROMINENT STOP-BY-TIME DEMAND HEATMAP MATRIX */}
      <div className="bg-[#101820] border border-white/10 rounded-xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="font-headline font-bold text-sm text-white uppercase tracking-wider">
              Stop-by-Time Demand Heatmap Matrix (Hourly Flow)
            </h3>
            <p className="text-xs text-[#69737D]">
              Click any stop cell to inspect localized shelter crowding and serving corridors
            </p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#69737D]">
            <span>Low</span>
            <span className="w-3 h-3 rounded bg-[#D8FF3E]/20" />
            <span className="w-3 h-3 rounded bg-[#D8FF3E]/70" />
            <span className="w-3 h-3 rounded bg-[#E58B20]" />
            <span className="w-3 h-3 rounded bg-[#E04838]" />
            <span>Overload (&gt;130)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/40 text-[#69737D] text-[10px] uppercase border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Campus Node</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3">Shelter Cap</th>
                {timeSlots.map((ts) => (
                  <th
                    key={ts}
                    className={`py-2.5 px-3 text-center ${selectedTimeSlot === ts ? 'text-[#D8FF3E] font-bold' : ''}`}
                  >
                    {ts}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStops.map((stop) => {
                const isSelected = selectedStopId === stop.id;
                return (
                  <tr
                    key={stop.id}
                    onClick={() => setSelectedStopId(stop.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-semibold text-white">
                      <div>{stop.name}</div>
                      <span className="text-[10px] font-mono text-[#69737D]">{stop.code}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#69737D]">{stop.zone}</td>
                    <td className="py-2.5 px-3 text-white">{stop.shelterCapacity}</td>
                    {timeSlots.map((ts) => {
                      const val = stop.hourlyDemand[ts] || 0;
                      return (
                        <td key={ts} className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block w-12 py-1 rounded text-center text-[11px] ${getHeatmapColor(
                              val
                            )}`}
                          >
                            {val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASYMMETRIC LOWER SECTION: Ranked Capacity vs Occupancy + Stop Drilldown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ranked Demand & Capacity Bars (7 cols) */}
        <div className="lg:col-span-7 bg-[#101820] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="font-headline font-bold text-sm text-white uppercase tracking-wider">
              Top Ranked Stops: Demand vs Capacity Headroom
            </h3>
            <p className="text-xs text-[#69737D] mt-0.5">Time Window: {selectedTimeSlot} Hours</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {rankedStops.slice(0, 6).map((stop, i) => {
              const demand = stop.hourlyDemand[selectedTimeSlot] || stop.waitingPassengers;
              const cap = stop.shelterCapacity;
              const ratio = demand / cap;
              const isOvercrowded = ratio > 1.0;

              return (
                <div
                  key={stop.id}
                  onClick={() => setSelectedStopId(stop.id)}
                  className="p-3 rounded-lg bg-black/40 border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[#69737D]">#{i + 1}</span>
                      <strong className="text-white font-sans">{stop.name}</strong>
                      <span className="text-[10px] text-[#69737D]">({stop.zone})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={isOvercrowded ? 'text-[#E04838] font-bold' : 'text-[#D8FF3E]'}>
                        {demand} pax
                      </span>
                      <span className="text-[#69737D]">/ {cap} cap</span>
                    </div>
                  </div>

                  {/* Horizontal Load Bar */}
                  <div className="w-full h-2 rounded bg-white/10 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOvercrowded ? 'bg-[#E04838]' : ratio > 0.8 ? 'bg-[#E58B20]' : 'bg-[#D8FF3E]'
                      }`}
                      style={{ width: `${Math.min(100, ratio * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Stop Drilldown & Serving Corridors (5 cols) */}
        <div className="lg:col-span-5 bg-[#101820] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8FF3E] block">
              Node Deep-Dive
            </span>
            <h3 className="font-headline font-bold text-base text-white mt-0.5">{activeStop.name}</h3>
            <p className="text-xs text-[#69737D] font-mono">
              Code: {activeStop.code} • Zone: {activeStop.zone}
            </p>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded bg-black/40 border border-white/10 flex justify-between">
              <span className="text-[#69737D]">Currently Waiting:</span>
              <strong className="text-white">{activeStop.waitingPassengers} passengers</strong>
            </div>

            <div className="p-3 rounded bg-black/40 border border-white/10 flex justify-between">
              <span className="text-[#69737D]">Safe Shelter Capacity:</span>
              <span className="text-white">{activeStop.shelterCapacity} seats</span>
            </div>

            <div className="p-3 rounded bg-black/40 border border-white/10 flex justify-between">
              <span className="text-[#69737D]">Boarding Throughput:</span>
              <span className="text-[#D8FF3E]">{activeStop.boardingRatePerMin} pax / minute</span>
            </div>

            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] font-headline font-bold text-white uppercase tracking-wider block mb-2">
                Serving Transit Lines
              </span>
              <div className="space-y-1.5">
                {routes
                  .filter((r) => r.stopIds.includes(activeStop.id))
                  .map((r) => (
                    <div
                      key={r.id}
                      className="p-2 rounded bg-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                        <span className="text-white font-medium">{r.name}</span>
                      </div>
                      <span className="text-[#D8FF3E]">{r.scheduledHeadwayMin}m headway</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
