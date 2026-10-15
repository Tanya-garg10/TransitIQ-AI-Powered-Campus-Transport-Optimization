import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  Sparkles,
  AlertTriangle,
  Menu,
  X,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export type PageId =
  | 'overview'
  | 'live'
  | 'demand'
  | 'optimizer'
  | 'performance'
  | 'fleet';

interface NavigationProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  simulationTime: string;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onResetSimulate: () => void;
  onFastForward: () => void;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
  activeDisruptionCount: number;
  activeDisruptionTitle: string | null;
  onRunOptimizer: () => void;
  isOptimizing: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activePage,
  onSelectPage,
  simulationTime,
  isSimulating,
  onToggleSimulate,
  onResetSimulate,
  onFastForward,
  simulationSpeed,
  onSpeedChange,
  activeDisruptionCount,
  activeDisruptionTitle,
  onRunOptimizer,
  isOptimizing,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: PageId; label: string; badge?: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'live', label: 'Live Operations', badge: 'Map' },
    { id: 'demand', label: 'Demand' },
    { id: 'optimizer', label: 'Optimizer', badge: 'MILP' },
    { id: 'performance', label: 'Performance' },
    { id: 'fleet', label: 'Fleet & Routes' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#101820]/95 backdrop-blur-md border-b border-white/10 select-none">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* 1. Left: Brand & Wordmark */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => onSelectPage('overview')}
            className="flex items-center gap-2.5 group cursor-pointer text-left"
          >
            {/* Geometric Transit Logo */}
            <div className="w-8 h-8 rounded-lg bg-[#D8FF3E] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="5" cy="19" r="2.5" fill="#101820" />
                <circle cx="19" cy="5" r="2.5" fill="#101820" />
                <path d="M5 16.5V11C5 8.79086 6.79086 7 9 7H16.5" stroke="#101820" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="7" r="1.5" fill="#101820" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-extrabold text-lg tracking-tight text-white group-hover:text-[#D8FF3E] transition-colors">
                  TransitIQ
                </span>
                <span className="text-[9px] font-mono tracking-widest uppercase text-[#D8FF3E] font-bold bg-[#D8FF3E]/10 px-1.5 py-0.5 rounded border border-[#D8FF3E]/20">
                  RoutePulse
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* 2. Middle: Navigation Links (Visible on Tablet and Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10">
          {navLinks.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`relative px-3 py-1.5 text-xs font-medium tracking-tight rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#101820] bg-[#D8FF3E] font-bold shadow-sm'
                    : 'text-[#F7F6F0]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                      isActive
                        ? 'bg-[#101820]/15 text-[#101820] font-bold'
                        : 'bg-white/10 text-[#D8FF3E]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 3. Right: Telemetry Clock, Quick Action & Mobile Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Active Disruption Pill (if triggered) */}
          {activeDisruptionCount > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E58B20]/15 border border-[#E58B20]/40 text-[#E58B20] text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E58B20] animate-pulse" />
              <span className="font-bold text-[11px]">{activeDisruptionCount} Disruption Active</span>
            </div>
          )}

          {/* Simulation Telemetry Clock & Transport Control Bar */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-1 gap-1">
            <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono text-[#D8FF3E]">
              <Clock className="w-3.5 h-3.5 text-[#D8FF3E]" />
              <span className="font-bold tracking-wider">{simulationTime}</span>
            </div>

            <div className="h-4 w-px bg-white/10" />

            <button
              onClick={onToggleSimulate}
              title={isSimulating ? 'Pause Telemetry Clock' : 'Play Telemetry Clock'}
              className={`p-1.5 rounded transition cursor-pointer ${
                isSimulating
                  ? 'bg-[#E58B20]/20 text-[#E58B20] hover:bg-[#E58B20]/30'
                  : 'bg-[#D8FF3E]/15 text-[#D8FF3E] hover:bg-[#D8FF3E]/25'
              }`}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onFastForward}
              title="Advance +5 minutes"
              className="p-1.5 rounded text-[#69737D] hover:text-[#D8FF3E] hover:bg-white/5 transition cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onResetSimulate}
              title="Reset Clock to 08:42:00"
              className="p-1.5 rounded text-[#69737D] hover:text-[#E04838] hover:bg-white/5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Speed Selector (1x / 2x / 5x) */}
            <div className="hidden sm:flex items-center text-[10px] font-mono pl-1 border-l border-white/10">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onSpeedChange(speed)}
                  className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                    simulationSpeed === speed
                      ? 'bg-[#D8FF3E] text-[#101820] font-bold'
                      : 'text-[#69737D] hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Button: Run Optimizer */}
          <button
            onClick={onRunOptimizer}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-[#D8FF3E] hover:bg-white text-[#101820] font-headline font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#101820] ${isOptimizing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isOptimizing ? 'Optimizing...' : 'Run Optimizer'}</span>
            <span className="sm:hidden">{isOptimizing ? '...' : 'Solve'}</span>
          </button>

          {/* Mobile Menu Hamburger (Visible on small screens < md) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#D8FF3E]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Only on small screens when hamburger is clicked) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#101820] px-4 py-3 space-y-1.5 shadow-2xl animate-in slide-in-from-top-2">
          {navLinks.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition ${
                  isActive
                    ? 'bg-[#D8FF3E] text-[#101820] font-bold'
                    : 'text-[#F7F6F0] hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-[#101820]/20 text-[#101820]' : 'bg-white/10 text-[#D8FF3E]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
