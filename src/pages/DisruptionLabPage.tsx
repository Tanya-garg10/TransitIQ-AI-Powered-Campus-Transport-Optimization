import React from 'react';
import { DisruptionScenario, HardConstraintCheck } from '../types/transit';
import {
  Flame,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Zap,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface DisruptionLabPageProps {
  disruptions: DisruptionScenario[];
  onToggleDisruption: (id: string, active: boolean) => void;
  onResetDisruptions: () => void;
  onRunOptimizer: () => void;
  constraintsValidation: HardConstraintCheck[];
}

export const DisruptionLabPage: React.FC<DisruptionLabPageProps> = ({
  disruptions,
  onToggleDisruption,
  onResetDisruptions,
  onRunOptimizer,
  constraintsValidation,
}) => {
  const activeCount = disruptions.filter((d) => d.active).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-900/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Stress Test & Disruption Recovery Lab</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Real-World Campus Incident Simulator
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Test how RoutePulse reacts to sudden student rushes, traffic choke points, and vehicle breakdowns while strictly enforcing physical limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              onClick={onResetDisruptions}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 cursor-pointer transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset All Scenarios</span>
            </button>
          )}

          <button
            onClick={onRunOptimizer}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Resolve & Recover Plan</span>
          </button>
        </div>
      </div>

      {/* Disruption Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {disruptions.map((d) => (
          <div
            key={d.id}
            className={`p-5 rounded-xl border transition space-y-3 ${
              d.active
                ? 'bg-amber-950/20 border-amber-600/50 shadow-lg shadow-amber-950/30'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    d.active ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{d.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
                    Category: {d.category}
                  </span>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => onToggleDisruption(d.id, !d.active)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  d.active
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{d.active ? 'Active' : 'Simulate'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{d.description}</p>

            {/* Affected scope */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="text-slate-500">Affected:</span>
              {d.affectedRouteIds.map((rid) => (
                <span
                  key={rid}
                  className="px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800"
                >
                  {rid}
                </span>
              ))}
              {d.affectedStopIds.map((sid) => (
                <span
                  key={sid}
                  className="px-1.5 py-0.5 rounded bg-slate-950 text-teal-300 border border-slate-800"
                >
                  {sid}
                </span>
              ))}
              {d.affectedVehicleId && (
                <span className="px-1.5 py-0.5 rounded bg-slate-950 text-rose-300 border border-rose-900/50">
                  {d.affectedVehicleId}
                </span>
              )}
            </div>

            {/* Expected Optimizer Recovery Reaction */}
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Optimizer Recovery Strategy:</span>
              </div>
              <p className="text-slate-300">
                {d.category === 'Demand Surge'
                  ? 'Detects queued overflow at ST-02/ST-05 and dispatches 75-pax spare Shuttle Hotel (V-108).'
                  : d.category === 'Traffic Congestion'
                  ? 'Pads route cycle time to 44m and staggers departures to avoid cluster bunching.'
                  : d.category === 'Vehicle Breakdown'
                  ? 'De-schedules faulty bus V-103 and reallocates standby vehicle from depot reserve.'
                  : 'Activates dead reckoning trajectory estimation with expanded ±3.5m confidence intervals.'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Constraints Validation Under Stress */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-sm text-slate-100">
              System Constraint Resilience Verification
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {activeCount > 0 ? `${activeCount} incident(s) injecting stress` : 'Normal operating regime'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs font-mono">
          {constraintsValidation.map((c, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-lg border flex items-center justify-between ${
                c.passed
                  ? 'bg-slate-950/60 border-teal-900/40 text-teal-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {c.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                <span className="truncate">{c.constraintName.split(':')[0]}</span>
              </div>
              <span className="text-[10px] uppercase font-bold">{c.passed ? 'OK' : 'FAIL'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
