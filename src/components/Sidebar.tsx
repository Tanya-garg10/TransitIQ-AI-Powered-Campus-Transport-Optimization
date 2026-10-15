import React from 'react';
import {
  LayoutDashboard,
  Navigation,
  Sparkles,
  Users,
  MapPin,
  Clock,
  BarChart3,
  Flame,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export type PageTab =
  | 'overview'
  | 'simulation'
  | 'optimizer'
  | 'demand'
  | 'routes'
  | 'eta'
  | 'evaluation'
  | 'disruptions';

interface SidebarProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  disruptionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  disruptionsCount,
}) => {
  const navItems: { id: PageTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'simulation', label: 'Live Simulation', icon: Navigation, badge: 'GPS' },
    { id: 'optimizer', label: 'Route Optimizer', icon: Sparkles, badge: 'OR' },
    { id: 'demand', label: 'Demand & Capacity', icon: Users },
    { id: 'routes', label: 'Routes & Stops', icon: MapPin },
    { id: 'eta', label: 'ETA & Telemetry', icon: Clock, badge: 'MAE' },
    { id: 'evaluation', label: 'Performance & Eval', icon: BarChart3 },
    {
      id: 'disruptions',
      label: 'Disruption Lab',
      icon: Flame,
      badge: disruptionsCount > 0 ? `${disruptionsCount} Active` : undefined,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      <div className="p-4 border-b border-slate-800/80">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
          Optimization Engine
        </div>
        <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>7 Hard Constraints Active</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    item.id === 'disruptions' && disruptionsCount > 0
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/60 font-semibold'
                      : isActive
                      ? 'bg-cyan-950 text-cyan-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Deterministic Solver</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Objective minimizes passenger wait time & unmet demand while enforcing vehicle capacity and turnarounds.
          </p>
        </div>
      </div>
    </aside>
  );
};
