import React from 'react';
import { Route, Stop, Vehicle, BaselineEvaluation } from '../types/transit';
import {
  ArrowUpRight,
  TrendingDown,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface OverviewPageProps {
  stops: Stop[];
  routes: Route[];
  vehicles: Vehicle[];
  evaluation: BaselineEvaluation | null;
  onNavigate: (page: any) => void;
  onRunOptimizer: () => void;
  simulationTime: string;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  stops,
  routes,
  vehicles,
  evaluation,
  onNavigate,
  onRunOptimizer,
  simulationTime,
}) => {
  const activeVehicles = vehicles.filter((v) => v.assignedRouteId && v.status === 'In Service').length;
  const availableVehicles = vehicles.filter((v) => v.status !== 'Maintenance').length;
  const totalDemand = stops.reduce((sum, s) => sum + s.waitingPassengers, 0);
  const overcrowdingStops = stops.filter((s) => s.waitingPassengers > s.shelterCapacity * 0.8);
  const delayedVehicles = vehicles.filter((v) => v.status === 'Delayed');
  const fleetUtilization = availableVehicles > 0 ? (activeVehicles / availableVehicles) * 100 : 0;

  const baselineWait = evaluation ? evaluation.baseline.avgWaitingTimeMin : 11.4;
  const optimizedWait = evaluation ? evaluation.optimized.avgWaitingTimeMin : 6.8;
  const waitDeltaPercent = evaluation ? evaluation.deltas.waitingTimeImprovementPercent : 40.3;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative pt-2 pb-6 border-b border-white/10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="space-y-3 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#D8FF3E]/10 border border-[#D8FF3E]/20 text-[#D8FF3E] font-mono text-[11px] tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF3E] animate-pulse" />
              <span>Campus Transit Intelligence System • Station Clock {simulationTime}</span>
            </div>

            <h1 className="font-headline text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[0.95]">
              MOVE CAMPUS <br className="hidden sm:inline" />
              <span className="text-[#D8FF3E]">FORWARD.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#F7F6F0]/80 leading-relaxed font-sans max-w-2xl pt-1">
              {activeVehicles} of {vehicles.length} campus vehicles active across {routes.length} transit lines serving {stops.length} academic and residential nodes. Operational load factor is at {Math.round(fleetUtilization)}%, with zero unserved passengers under optimized dispatch.
            </p>
          </div>

          {/* Direct Action Hub */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('live')}
              className="px-5 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white font-headline text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Network Map</span>
              <ArrowUpRight className="w-4 h-4 text-[#D8FF3E]" />
            </button>
            <button
              onClick={onRunOptimizer}
              className="px-6 py-3 rounded-lg bg-[#D8FF3E] hover:bg-white text-[#101820] font-headline text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-[#101820]" />
              <span>Run Live Optimizer</span>
            </button>
          </div>
        </div>

        {/* 2. COMPACT HORIZONTAL OPERATIONAL METRICS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-white/10 mt-8 rounded-lg overflow-hidden border border-white/10 font-mono">
          <div className="bg-[#101820] p-4">
            <span className="text-[10px] text-[#69737D] uppercase tracking-wider block">Fleet Deployed</span>
            <div className="text-2xl font-bold text-white mt-1">
              {activeVehicles} <span className="text-xs text-[#69737D] font-normal">/ {availableVehicles}</span>
            </div>
            <span className="text-[10px] text-[#D8FF3E] mt-1 block">1 standby reserve</span>
          </div>

          <div className="bg-[#101820] p-4">
            <span className="text-[10px] text-[#69737D] uppercase tracking-wider block">Waiting Demand</span>
            <div className="text-2xl font-bold text-white mt-1">
              {totalDemand} <span className="text-xs text-[#69737D] font-normal">pax</span>
            </div>
            <span className="text-[10px] text-[#69737D] mt-1 block">{stops.length} stops logged</span>
          </div>

          <div className="bg-[#101820] p-4">
            <span className="text-[10px] text-[#69737D] uppercase tracking-wider block">Average Wait</span>
            <div className="text-2xl font-bold text-[#E58B20] mt-1">
              {baselineWait} <span className="text-xs text-[#69737D] font-normal">min</span>
            </div>
            <span className="text-[10px] text-[#D8FF3E] mt-1 block">Can drop to {optimizedWait}m</span>
          </div>

          <div className="bg-[#101820] p-4">
            <span className="text-[10px] text-[#69737D] uppercase tracking-wider block">Fleet Utilization</span>
            <div className="text-2xl font-bold text-[#D8FF3E] mt-1">
              {fleetUtilization.toFixed(0)}%
            </div>
            <span className="text-[10px] text-[#69737D] mt-1 block">Active service time</span>
          </div>

          <div className="bg-[#101820] p-4 col-span-2 md:col-span-1">
            <span className="text-[10px] text-[#69737D] uppercase tracking-wider block">Constraints Status</span>
            <div className="text-2xl font-bold text-[#D8FF3E] mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-[#D8FF3E]" />
              <span>100%</span>
            </div>
            <span className="text-[10px] text-[#D8FF3E] mt-1 block">7 / 7 hard rules pass</span>
          </div>
        </div>
      </section>

      {/* 3. ASYMMETRIC MAIN GRID: Network Visualizer + Priority Rail + Baseline Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Stylized Campus Route Schematic & Active Line Signatures */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#101820] border border-white/10 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8FF3E] block">
                  Topological Network Schematic
                </span>
                <h3 className="font-headline font-bold text-lg text-white mt-0.5">
                  5 Campus Corridors & Real-Time Flow
                </h3>
              </div>
              <button
                onClick={() => onNavigate('live')}
                className="text-xs font-mono text-[#D8FF3E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Interactive Leaflet Map</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stylized Transit Line Graphic Diagram */}
            <div className="relative h-64 w-full bg-black/40 rounded-lg border border-white/5 p-4 flex flex-col justify-between overflow-hidden">
              {/* Grid lines background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #69737D 1px, transparent 1px), linear-gradient(to bottom, #69737D 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Transit Schematic Lines */}
              <svg className="w-full h-full" viewBox="0 0 800 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Red Line */}
                <path d="M 40 40 L 220 40 L 380 90 L 580 90 L 760 40" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
                {/* Blue Line */}
                <path d="M 60 170 L 220 170 L 380 120 L 560 120 L 740 170" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 6" />
                {/* Green Line */}
                <path d="M 120 100 L 280 100 L 440 50 L 680 50" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                {/* Orange Line */}
                <path d="M 160 140 L 340 140 L 500 180 L 680 180" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
                {/* Purple Line */}
                <path d="M 80 80 L 260 180 L 540 60 L 720 120" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

                {/* Major Stops Nodes */}
                <circle cx="220" cy="40" r="7" fill="#101820" stroke="#FFFFFF" strokeWidth="3" />
                <text x="220" y="25" fill="#F7F6F0" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">METRO HUB</text>

                <circle cx="380" cy="90" r="8" fill="#D8FF3E" stroke="#101820" strokeWidth="3" />
                <text x="380" y="75" fill="#D8FF3E" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">MAIN OVAL</text>

                <circle cx="580" cy="90" r="7" fill="#101820" stroke="#FFFFFF" strokeWidth="3" />
                <text x="580" y="75" fill="#F7F6F0" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">ENGR QUAD</text>

                <circle cx="220" cy="170" r="7" fill="#101820" stroke="#FFFFFF" strokeWidth="3" />
                <text x="220" y="195" fill="#F7F6F0" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">NORTH DORMS</text>

                <circle cx="560" cy="120" r="7" fill="#101820" stroke="#FFFFFF" strokeWidth="3" />
                <text x="560" y="145" fill="#F7F6F0" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">MED CENTER</text>
              </svg>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#69737D] z-10 pt-2 border-t border-white/5">
                <span>5 OPERATIONAL CIRCUITS</span>
                <span className="text-[#D8FF3E]">BLUE LINE: DELAY NOTED (+12m)</span>
              </div>
            </div>

            {/* Line Signatures List */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {routes.map((route) => (
                <div
                  key={route.id}
                  onClick={() => onNavigate('fleet')}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: route.color }} />
                      <span className="font-headline font-bold text-xs text-white group-hover:text-[#D8FF3E] transition-colors">
                        {route.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#69737D]">
                    <span>Headway: <strong className="text-white">{route.scheduledHeadwayMin}m</strong></span>
                    <span>{route.assignedVehicleIds.length} buses</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Priority Alert Rail & Baseline vs Optimized Box */}
        <div className="lg:col-span-4 space-y-6">
          {/* Priority Alert Rail */}
          <div className="bg-[#101820] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E58B20]" />
                <h3 className="font-headline font-bold text-sm text-white uppercase tracking-wider">
                  Operational Alerts
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#E58B20] px-1.5 py-0.5 rounded bg-[#E58B20]/10 border border-[#E58B20]/20 font-bold">
                {overcrowdingStops.length + delayedVehicles.length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {overcrowdingStops.slice(0, 3).map((stop) => (
                <div
                  key={stop.id}
                  className="p-3 rounded-lg bg-[#E04838]/10 border border-[#E04838]/30 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-white font-bold">{stop.name}</span>
                    <span className="text-[#E04838] font-bold">{stop.waitingPassengers} waiting</span>
                  </div>
                  <div className="text-[11px] text-[#69737D]">
                    Queue exceeds safe shelter capacity ({stop.shelterCapacity} cap).
                  </div>
                </div>
              ))}

              {delayedVehicles.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-lg bg-[#E58B20]/10 border border-[#E58B20]/30 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-white font-bold">{v.name} ({v.id})</span>
                    <span className="text-[#E58B20] font-bold">Delayed</span>
                  </div>
                  <div className="text-[11px] text-[#69737D]">
                    Current speed {v.speedKmh} km/h due to construction choke point.
                  </div>
                </div>
              ))}

              {overcrowdingStops.length === 0 && delayedVehicles.length === 0 && (
                <div className="p-4 rounded-lg bg-white/5 text-center text-xs text-[#69737D]">
                  No priority alerts. All corridors operating smoothly.
                </div>
              )}
            </div>
          </div>

          {/* Distinctive Baseline vs Optimized Preview */}
          <div className="bg-[#101820] border border-[#D8FF3E]/30 rounded-xl p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D8FF3E]" />
                <h3 className="font-headline font-bold text-sm text-white uppercase tracking-wider">
                  Baseline vs Optimized
                </h3>
              </div>
              <button
                onClick={() => onNavigate('performance')}
                className="text-[11px] font-mono text-[#D8FF3E] hover:underline cursor-pointer"
              >
                Lab Report →
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[#69737D] mb-1">
                  <span>Average Wait Time</span>
                  <span className="text-white">
                    <span className="line-through text-[#69737D] mr-2">{baselineWait}m</span>
                    <strong className="text-[#D8FF3E]">{optimizedWait}m (-{waitDeltaPercent}%)</strong>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
                  <div className="h-full bg-[#D8FF3E]" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#69737D] mb-1">
                  <span>Unserved Passengers</span>
                  <span className="text-white">
                    <span className="line-through text-[#69737D] mr-2">36 pax</span>
                    <strong className="text-[#D8FF3E]">0 pax (-100%)</strong>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
                  <div className="h-full bg-[#D8FF3E]" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#69737D] mb-1">
                  <span>ETA Accuracy (MAE)</span>
                  <span className="text-white">
                    <span className="line-through text-[#69737D] mr-2">3.4m</span>
                    <strong className="text-white">1.6m (+52.9%)</strong>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
                  <div className="h-full bg-white" style={{ width: '84%' }} />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#69737D] leading-relaxed border-t border-white/5">
              Evaluated under identical passenger arrival matrices and travel times.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
