import React from 'react';
import {
  Activity,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Cpu,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  simulationTime: string;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onResetSimulate: () => void;
  onFastForward: () => void;
  simulationSpeed: number;
  onSpeedChange: (speed: number) => void;
  activeDisruptionName: string | null;
  onQuickOptimize: () => void;
  isOptimizing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  simulationTime,
  isSimulating,
  onToggleSimulate,
  onResetSimulate,
  onFastForward,
  simulationSpeed,
  onSpeedChange,
  activeDisruptionName,
  onQuickOptimize,
  isOptimizing,
}) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Branding & Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Cpu className="w-5 h-5 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-white bg-clip-text text-transparent">
              TransitIQ
            </h1>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">
              RoutePulse Engine
            </span>
          </div>
          <p className="text-xs text-slate-400">Intelligent Campus Fleet & Constraint Optimizer</p>
        </div>
      </div>

      {/* Middle: Disruption Indicator Banner */}
      {activeDisruptionName ? (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-950/60 border border-amber-600/40 text-amber-300 text-xs animate-pulse">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">Active Disruption:</span>
          <span className="truncate max-w-xs text-amber-200">{activeDisruptionName}</span>
        </div>
      ) : (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Nominal Operations • All 7 Hard Constraints Satisfied</span>
        </div>
      )}

      {/* Right: Simulation Controls & Instant Optimizer Action */}
      <div className="flex items-center gap-3">
        {/* Simulation Clock & Controls */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 gap-1.5 shadow-inner">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-cyan-400">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <span>{simulationTime}</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={onToggleSimulate}
            title={isSimulating ? 'Pause Simulation' : 'Start Simulation'}
            className={`p-1.5 rounded transition ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onFastForward}
            title="Advance +5 min"
            className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onResetSimulate}
            title="Reset Simulation Time"
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800" />

          {/* Speed multiplier selector */}
          <div className="flex items-center text-[11px] font-mono pr-1">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-1.5 py-0.5 rounded transition ${
                  simulationSpeed === speed
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Instant Run Optimization button */}
        <button
          onClick={onQuickOptimize}
          disabled={isOptimizing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
          <span>{isOptimizing ? 'Optimizing...' : 'Run Optimizer'}</span>
        </button>
      </div>
    </header>
  );
};
