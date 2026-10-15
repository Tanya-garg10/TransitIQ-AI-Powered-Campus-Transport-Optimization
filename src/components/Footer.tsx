import React from 'react';
import { PageId } from './Navigation';
import {
  ShieldCheck,
  Cpu,
  Layers,
  ArrowUpRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';

interface FooterProps {
  onSelectPage: (page: PageId) => void;
  simulationTime: string;
  activeDisruptionCount: number;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectPage,
  simulationTime,
  activeDisruptionCount,
}) => {
  return (
    <footer className="border-t border-white/10 bg-[#0c1218] text-[#F7F6F0] mt-12 select-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Grid: Brand & Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#D8FF3E] flex items-center justify-center font-bold text-xs text-[#101820]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="5" cy="19" r="2.5" fill="#101820" />
                  <circle cx="19" cy="5" r="2.5" fill="#101820" />
                  <path d="M5 16.5V11C5 8.79086 6.79086 7 9 7H16.5" stroke="#101820" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="12" cy="7" r="1.5" fill="#101820" />
                </svg>
              </div>
              <span className="font-headline font-extrabold text-lg tracking-tight text-white">
                TransitIQ
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#D8FF3E] font-bold bg-[#D8FF3E]/10 px-1.5 py-0.5 rounded border border-[#D8FF3E]/20">
                RoutePulse
              </span>
            </div>

            <p className="text-xs text-[#69737D] font-sans leading-relaxed max-w-sm">
              Intelligent campus transport optimization platform with constraint-aware routing, real-time simulated telemetry, and reproducible operational evaluations.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-[#D8FF3E] pt-1">
              <span className="w-2 h-2 rounded-full bg-[#D8FF3E] animate-pulse" />
              <span>MOVE CAMPUS FORWARD.</span>
            </div>
          </div>

          {/* Quick Navigation Links (4 cols) */}
          <div className="md:col-span-4 space-y-3 font-mono text-xs">
            <span className="text-[10px] uppercase tracking-widest text-[#69737D] font-bold block">
              Platform Modules
            </span>
            <div className="grid grid-cols-2 gap-2 text-[#F7F6F0]/80">
              <button
                onClick={() => onSelectPage('overview')}
                className="text-left hover:text-[#D8FF3E] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Overview</span>
              </button>
              <button
                onClick={() => onSelectPage('live')}
                className="text-left hover:text-[#D8FF3E] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Live Operations</span>
              </button>
              <button
                onClick={() => onSelectPage('demand')}
                className="text-left hover:text-[#D8FF3E] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Demand Intel</span>
              </button>
              <button
                onClick={() => onSelectPage('optimizer')}
                className="text-left hover:text-[#D8FF3E] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Route Optimizer</span>
              </button>
              <button
                onClick={() => onSelectPage('performance')}
                className="text-left hover:text-[#D8FF3E] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Performance Lab</span>
              </button>
              <button
                onClick={() => onSelectPage('fleet')}
                className="text-left hover:text-[#D8FF3E] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Fleet & Routes</span>
              </button>
            </div>
          </div>

          {/* Engine Specs (3 cols) */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <span className="text-[10px] uppercase tracking-widest text-[#69737D] font-bold block">
              Engine Specifications
            </span>
            <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-[#69737D]">
                <span>Hard Constraints:</span>
                <span className="text-[#D8FF3E] font-bold">7 / 7 Verified</span>
              </div>
              <div className="flex items-center justify-between text-[#69737D]">
                <span>Solver Algorithm:</span>
                <span className="text-white">MILP Deterministic</span>
              </div>
              <div className="flex items-center justify-between text-[#69737D]">
                <span>Telemetry Clock:</span>
                <span className="text-white">{simulationTime}</span>
              </div>
              <div className="flex items-center justify-between text-[#69737D]">
                <span>Status:</span>
                <span className={activeDisruptionCount > 0 ? 'text-[#E58B20]' : 'text-[#D8FF3E]'}>
                  {activeDisruptionCount > 0 ? `${activeDisruptionCount} Disruption` : 'Nominal Flow'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Standards */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#69737D]">
          <div>
            <span>TransitIQ • RoutePulse: Optimise Campus Transport Under Real Constraints</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#D8FF3E]">Physical Capacity Enforced (Ov ≤ Cv)</span>
            <span>•</span>
            <span>Zero Silent Passenger Drops</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
