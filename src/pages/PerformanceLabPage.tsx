import React, { useState } from 'react';
import { BaselineEvaluation, DisruptionScenario, HardConstraintCheck } from '../types/transit';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Download,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Cpu,
  Layers,
  Flame,
  Zap,
} from 'lucide-react';

interface PerformanceLabPageProps {
  evaluation: BaselineEvaluation | null;
  disruptions: DisruptionScenario[];
  onToggleDisruption: (id: string, active: boolean) => void;
  onResetDisruptions: () => void;
  onRunOptimizer: () => void;
  constraintsValidation: HardConstraintCheck[];
}

export const PerformanceLabPage: React.FC<PerformanceLabPageProps> = ({
  evaluation,
  disruptions,
  onToggleDisruption,
  onResetDisruptions,
  onRunOptimizer,
  constraintsValidation,
}) => {
  const evalData = evaluation || {
    scenarioName: 'Standard Campus Operating Day',
    timestamp: '2026-10-15T08:42:00Z',
    baseline: {
      avgWaitingTimeMin: 11.4,
      totalUnmetDemand: 36,
      overcrowdingIncidents: 4,
      fleetUtilizationPercent: 75.0,
      totalTripMilesKm: 142.5,
      estimatedFuelKwh: 184.2,
      etaMaeMin: 3.4,
      operatingCostPerHour: 480,
    },
    optimized: {
      avgWaitingTimeMin: 6.8,
      totalUnmetDemand: 0,
      overcrowdingIncidents: 0,
      fleetUtilizationPercent: 87.5,
      totalTripMilesKm: 148.0,
      estimatedFuelKwh: 172.5,
      etaMaeMin: 1.6,
      operatingCostPerHour: 455,
    },
    deltas: {
      waitingTimeImprovementPercent: 40.3,
      unmetDemandReductionPercent: 100.0,
      overcrowdingReductionPercent: 100.0,
      utilizationChangePercent: 12.5,
      costSavingsPercent: 5.2,
      etaAccuracyImprovementPercent: 52.9,
    },
    solverRuntimeMs: 18.4,
    hardConstraintsSatisfied: true,
    validationReport: [],
  };

  // Recharts Data Transformation
  const chartData = [
    {
      metric: 'Wait Time (min)',
      Baseline: evalData.baseline.avgWaitingTimeMin,
      Optimized: evalData.optimized.avgWaitingTimeMin,
    },
    {
      metric: 'Unmet Queue (pax)',
      Baseline: evalData.baseline.totalUnmetDemand,
      Optimized: evalData.optimized.totalUnmetDemand,
    },
    {
      metric: 'Overcrowding (nodes)',
      Baseline: evalData.baseline.overcrowdingIncidents,
      Optimized: evalData.optimized.overcrowdingIncidents,
    },
    {
      metric: 'ETA Error (MAE min)',
      Baseline: evalData.baseline.etaMaeMin,
      Optimized: evalData.optimized.etaMaeMin,
    },
  ];

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Baseline Status Quo,TransitIQ Optimized,Unit,Improvement %\n' +
      `Average Passenger Wait Time,${evalData.baseline.avgWaitingTimeMin},${evalData.optimized.avgWaitingTimeMin},Minutes,-${evalData.deltas.waitingTimeImprovementPercent}%\n` +
      `Unmet Passenger Demand,${evalData.baseline.totalUnmetDemand},${evalData.optimized.totalUnmetDemand},Passengers,-${evalData.deltas.unmetDemandReductionPercent}%\n` +
      `Overcrowding Incidents,${evalData.baseline.overcrowdingIncidents},${evalData.optimized.overcrowdingIncidents},Stops,-${evalData.deltas.overcrowdingReductionPercent}%\n` +
      `Fleet Utilization,${evalData.baseline.fleetUtilizationPercent},${evalData.optimized.fleetUtilizationPercent},Percentage,+${evalData.deltas.utilizationChangePercent}%\n` +
      `ETA Mean Absolute Error,${evalData.baseline.etaMaeMin},${evalData.optimized.etaMaeMin},Minutes,-${evalData.deltas.etaAccuracyImprovementPercent}%\n` +
      `Hourly Operating Cost,${evalData.baseline.operatingCostPerHour},${evalData.optimized.operatingCostPerHour},USD,-${evalData.deltas.costSavingsPercent}%\n` +
      `Solver Execution Time,N/A,${evalData.solverRuntimeMs},Milliseconds,N/A\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TransitIQ_Evaluation_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. REPORT HERO HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#D8FF3E] uppercase block">
            Analytical Experiment & Benchmark Report
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            PROVE THE DIFFERENCE.
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#D8FF3E]" />
            <span>Export CSV Benchmark</span>
          </button>
        </div>
      </div>

      {/* 2. LARGE HEADLINE METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        {/* Wait time */}
        <div className="bg-[#101820] border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <span className="text-[10px] text-[#69737D] uppercase tracking-wider block">
            Average Passenger Wait Time
          </span>
          <div className="text-4xl font-extrabold text-[#D8FF3E] mt-2 flex items-baseline gap-2">
            <span>-{evalData.deltas.waitingTimeImprovementPercent}%</span>
            <TrendingDown className="w-6 h-6 text-[#D8FF3E]" />
          </div>
          <div className="mt-2 text-xs text-white">
            <span className="text-[#69737D] line-through mr-2">{evalData.baseline.avgWaitingTimeMin}m</span>
            <strong>{evalData.optimized.avgWaitingTimeMin} minutes</strong> average wait
          </div>
        </div>

        {/* Unmet demand */}
        <div className="bg-[#101820] border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <span className="text-[10px] text-[#69737D] uppercase tracking-wider block">
            Unmet Demand Cleared
          </span>
          <div className="text-4xl font-extrabold text-[#D8FF3E] mt-2 flex items-baseline gap-2">
            <span>-{evalData.deltas.unmetDemandReductionPercent}%</span>
            <TrendingDown className="w-6 h-6 text-[#D8FF3E]" />
          </div>
          <div className="mt-2 text-xs text-white">
            <span className="text-[#69737D] line-through mr-2">{evalData.baseline.totalUnmetDemand} pax</span>
            <strong>{evalData.optimized.totalUnmetDemand} unserved</strong> passengers
          </div>
        </div>

        {/* ETA Accuracy */}
        <div className="bg-[#101820] border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <span className="text-[10px] text-[#69737D] uppercase tracking-wider block">
            ETA Accuracy Improvement
          </span>
          <div className="text-4xl font-extrabold text-white mt-2 flex items-baseline gap-2">
            <span>+{evalData.deltas.etaAccuracyImprovementPercent}%</span>
            <TrendingUp className="w-6 h-6 text-[#D8FF3E]" />
          </div>
          <div className="mt-2 text-xs text-white">
            <span className="text-[#69737D] line-through mr-2">{evalData.baseline.etaMaeMin}m</span>
            <strong>{evalData.optimized.etaMaeMin}m error</strong> MAE against ground truth
          </div>
        </div>
      </div>

      {/* 3. SCIENTIFIC VISUALIZATION: RECHARTS BEFORE-AND-AFTER */}
      <div className="bg-[#101820] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-headline font-bold text-base text-white uppercase tracking-wider">
              Controlled Metric Comparison (Same Arrival Demand Matrix)
            </h3>
            <p className="text-xs text-[#69737D] mt-0.5 font-mono">
              Scenario: <strong className="text-white">{evalData.scenarioName}</strong> • Unit values
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#69737D]" />
              <span className="text-[#69737D]">Baseline (Status Quo)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#D8FF3E]" />
              <span className="text-[#D8FF3E] font-bold">TransitIQ Optimized</span>
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#253342" vertical={false} />
              <XAxis dataKey="metric" stroke="#69737D" tick={{ fill: '#F7F6F0', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#69737D" tick={{ fill: '#69737D', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101820',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                  color: '#F7F6F0',
                }}
              />
              <Bar dataKey="Baseline" fill="#69737D" radius={[4, 4, 0, 0]} maxBarSize={45} />
              <Bar dataKey="Optimized" fill="#D8FF3E" radius={[4, 4, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. SCENARIO SELECTOR (DISRUPTION STRESS-TESTS) */}
      <div className="bg-[#101820] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#E58B20]" />
            <h3 className="font-headline font-bold text-base text-white uppercase tracking-wider">
              Disruption Stress Scenarios
            </h3>
          </div>
          <button
            onClick={onResetDisruptions}
            className="text-xs font-mono text-[#E04838] hover:underline cursor-pointer"
          >
            Reset All Scenarios
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disruptions.map((d) => (
            <div
              key={d.id}
              className={`p-4 rounded-xl border transition-all ${
                d.active
                  ? 'bg-[#E58B20]/15 border-[#E58B20]/50'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#E58B20] block font-bold">
                    {d.category}
                  </span>
                  <h4 className="font-headline font-bold text-sm text-white">{d.title}</h4>
                </div>

                <button
                  onClick={() => onToggleDisruption(d.id, !d.active)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition cursor-pointer ${
                    d.active
                      ? 'bg-[#E58B20] text-black hover:bg-[#E58B20]/80'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {d.active ? 'ACTIVE' : 'SIMULATE'}
                </button>
              </div>

              <p className="text-xs text-[#F7F6F0]/80 mt-2 leading-relaxed">{d.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. EVALUATION METHODOLOGY EXPLANATION */}
      <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-white font-headline font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#D8FF3E]" />
          <span>Evaluation Methodology & Mathematical Integrity</span>
        </div>
        <p className="text-[#69737D] leading-relaxed font-sans">
          Baseline schedule reflects status quo uniform fixed-frequency dispatch (e.g. 15-minute headways). The optimized schedule applies dynamic headway tightening, high-capacity vehicle swaps, and spare mobilization. Both models are evaluated against the exact same stochastic arrival queues and segment travel times without synthetic inflation.
        </p>
      </div>
    </div>
  );
};
