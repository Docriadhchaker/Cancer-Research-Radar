import React, { useState } from 'react';
import {
  Compass,
  FlaskConical,
  BookOpen,
  Award,
  Sparkles,
  HelpCircle,
  Info,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { DataSourceStatus, DataMode } from '../types/research';

export type AppRoute = 'dashboard' | 'trials' | 'research' | 'regulatory';

interface NavbarProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  onNewSearch: () => void;
  onLoadDemo: () => void;
  onOpenAbout: () => void;
  dataSourceStatus?: DataSourceStatus;
  dataMode?: DataMode;
  isSearching?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onRouteChange,
  onNewSearch,
  onLoadDemo,
  onOpenAbout,
  dataSourceStatus,
  dataMode = 'DEMO DATA',
  isSearching,
}) => {
  const [showDataModeTooltip, setShowDataModeTooltip] = useState(false);

  const navItems: { route: AppRoute; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { route: 'dashboard', label: 'Dashboard', icon: Compass },
    { route: 'trials', label: 'Clinical Trials', icon: FlaskConical },
    { route: 'research', label: 'Latest Research', icon: BookOpen },
    { route: 'regulatory', label: 'Regulatory', icon: Award },
  ];

  const isCtGovLive = dataSourceStatus?.clinicalTrialsGov?.connected && !dataSourceStatus?.clinicalTrialsGov?.usingFallback;
  const isCureCancerLive = dataSourceStatus?.cureCancerAI?.connected && !dataSourceStatus?.cureCancerAI?.usingFallback;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand / Logo */}
          <div
            id="btn-brand-home"
            onClick={() => {
              onRouteChange('dashboard');
              onNewSearch();
            }}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-8 h-8 bg-slate-900 rounded-xs flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
              <div className="w-3.5 h-3.5 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-slate-900 font-serif">
                  Cancer Research Radar
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-800 uppercase tracking-widest border border-slate-300 rounded-xs">
                  v1.0 POC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-serif italic hidden md:block">
                Mapping Emerging Oncology Strategies & Global Clinical Trials
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden sm:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  id={`nav-link-${item.route}`}
                  onClick={() => onRouteChange(item.route)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls & Data Mode Indicator */}
          <div className="flex items-center gap-3">
            {/* Global Explicit Data Mode Badge */}
            <div className="relative">
              <button
                id="badge-data-mode"
                type="button"
                onMouseEnter={() => setShowDataModeTooltip(true)}
                onMouseLeave={() => setShowDataModeTooltip(false)}
                onClick={() => setShowDataModeTooltip(!showDataModeTooltip)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs border text-[10px] font-mono font-bold uppercase tracking-wider cursor-help transition-all ${
                  dataMode === 'LIVE DATA'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : dataMode === 'PARTIAL LIVE DATA'
                    ? 'bg-sky-50 text-sky-900 border-sky-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    dataMode === 'LIVE DATA'
                      ? 'bg-emerald-500 animate-pulse'
                      : dataMode === 'PARTIAL LIVE DATA'
                      ? 'bg-sky-600 animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                <span>{dataMode}</span>
                <Info className="w-3 h-3 opacity-70" />
              </button>

              {/* Data Mode Tooltip Popup */}
              {showDataModeTooltip && (
                <div
                  id="data-mode-tooltip-popover"
                  className="absolute right-0 top-full mt-2 w-80 bg-slate-900 text-slate-100 p-4 rounded-xs border border-slate-700 shadow-xl z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-100 text-left"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5 text-slate-200 font-mono font-bold uppercase text-[10px] tracking-wider">
                      <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
                      <span>Data Pipeline: {dataMode}</span>
                    </div>
                  </div>

                  {/* Source Breakdown Table */}
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between p-1.5 rounded-xs bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-300">ClinicalTrials.gov:</span>
                      {isCtGovLive ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> LIVE REST v2
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> DEMO FALLBACK
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-xs bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-300">Publications (PubMed):</span>
                      {isCureCancerLive ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> LIVE API
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">
                          DEMO REFERENCE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-1.5 rounded-xs bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-300">Regulatory (FDA):</span>
                      {isCureCancerLive ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> LIVE API
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">
                          DEMO REFERENCE
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] font-serif italic text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
                    {dataMode === 'PARTIAL LIVE DATA'
                      ? 'Human clinical trial records are queried in real-time from the official ClinicalTrials.gov v2 REST API. Literature and regulatory standards of care utilize curated reference datasets until additional live keys are supplied.'
                      : dataMode === 'LIVE DATA'
                      ? 'All oncology research data sources are actively operating with live production API integrations.'
                      : 'Displaying verified reference oncology demonstration datasets.'}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Demo Trigger */}
            <button
              id="btn-nav-demo"
              onClick={onLoadDemo}
              disabled={isSearching}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-xs bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-300 transition-colors uppercase tracking-wider"
              title="Load reference cohort: Metastatic Colorectal Cancer (KRAS G12C)"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Load Reference Cohort</span>
            </button>

            {/* About / Methodology */}
            <button
              id="btn-nav-about"
              onClick={onOpenAbout}
              className="p-2 rounded-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
              title="About Cancer Research Radar, Sources, and Methodology"
              aria-label="About"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex sm:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1" aria-label="Mobile Navigation">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => onRouteChange(item.route)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold uppercase rounded-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
