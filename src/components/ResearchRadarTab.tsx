import React, { useState } from 'react';
import { ResearchDirection, ResearchMomentum } from '../types/research';
import { MaturityBadge } from './MaturityBadge';
import {
  Info,
  Compass,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Minus,
  ArrowDownRight,
  FlaskConical,
  BookOpen,
  Calendar,
  ExternalLink,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface ResearchRadarTabProps {
  directions: ResearchDirection[];
  onSelectDirection: (direction: ResearchDirection) => void;
}

const MOMENTUM_CONFIG: Record<
  ResearchMomentum,
  {
    label: string;
    arrow: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    hexColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  'FAST RISING': {
    label: 'Fast Rising',
    arrow: '↑',
    bgClass: 'bg-rose-600',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-300',
    hexColor: '#e11d48',
    icon: ArrowUpRight,
  },
  RISING: {
    label: 'Rising',
    arrow: '↗',
    bgClass: 'bg-indigo-600',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-300',
    hexColor: '#4f46e5',
    icon: TrendingUp,
  },
  STABLE: {
    label: 'Stable',
    arrow: '→',
    bgClass: 'bg-emerald-600',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-300',
    hexColor: '#059669',
    icon: Minus,
  },
  'LOW ACTIVITY': {
    label: 'Low Activity',
    arrow: '↓',
    bgClass: 'bg-slate-500',
    textClass: 'text-slate-600',
    borderClass: 'border-slate-300',
    hexColor: '#64748b',
    icon: ArrowDownRight,
  },
};

export const ResearchRadarTab: React.FC<ResearchRadarTabProps> = ({
  directions,
  onSelectDirection,
}) => {
  const [selectedDirId, setSelectedDirId] = useState<string>(directions[0]?.id || '');
  const [hoveredDir, setHoveredDir] = useState<ResearchDirection | null>(null);
  const [showMomentumInfo, setShowMomentumInfo] = useState(false);

  const selectedDirection = directions.find(d => d.id === selectedDirId) || directions[0];

  // Helper to map maturity level to X axis position (10% to 92%)
  const getMaturityX = (dir: ResearchDirection) => {
    const maturity = dir.maturity;
    switch (maturity) {
      case 'PRECLINICAL':
      case 'EMERGING SIGNAL':
        return 14;
      case 'EARLY CLINICAL':
        return 34;
      case 'MID CLINICAL':
        return 56;
      case 'LATE CLINICAL':
        return 76;
      case 'APPROVED':
        return 92;
      default:
        return 50;
    }
  };

  // Helper to map research activity to Y axis position (15% to 85%)
  // SVG / CSS Top percentage is inverted (0 is top = highest activity, 100 is bottom = lowest activity)
  const getActivityY = (dir: ResearchDirection) => {
    const score = dir.radarMetrics?.researchActivityScore || 50;
    // Map score (20-95) to top percentage (80% down to 18%)
    const invertedY = 92 - (score / 100) * 74;
    return Math.min(84, Math.max(16, invertedY));
  };

  // Deterministic bubble size calculation
  const getBubbleRadius = (dir: ResearchDirection) => {
    return dir.radarMetrics?.bubbleSizeScore || 24;
  };

  return (
    <div className="space-y-6">
      {/* Non-Efficacy Mandatory Disclaimer Banner */}
      <div
        id="radar-disclaimer-note"
        className="bg-white border-l-4 border-l-slate-900 border border-slate-200 p-4 rounded-xs flex items-start justify-between gap-3 text-xs text-slate-800 shadow-xs"
      >
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-900 uppercase font-mono tracking-wider text-[11px]">
              Translational Research Landscape & Maturity Radar
            </p>
            <p className="leading-relaxed font-serif text-slate-700">
              This visual radar plots oncology strategies along <strong>Clinical Maturity</strong> (X-axis) and <strong>Research Activity Density</strong> (Y-axis).{' '}
              <strong className="text-slate-900">
                Research activity and maturity do not indicate treatment efficacy or individual clinical benefit.
              </strong>
            </p>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowMomentumInfo(!showMomentumInfo)}
            onMouseEnter={() => setShowMomentumInfo(true)}
            onMouseLeave={() => setShowMomentumInfo(false)}
            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded-xs border border-slate-300"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Momentum Legend</span>
          </button>

          {showMomentumInfo && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 text-white p-3.5 rounded-xs border border-slate-700 shadow-xl z-50 text-xs space-y-1.5 animate-in fade-in zoom-in-95">
              <p className="font-mono font-bold uppercase text-[10px] text-amber-400">
                What is Research Momentum?
              </p>
              <p className="font-serif leading-relaxed text-slate-300">
                Research Momentum measures research velocity and trial accrual rate over time. It does <strong>not</strong> measure treatment efficacy or probability of success.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2D Research Radar Visualizer Panel */}
      <div className="bg-white rounded-xs border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif tracking-tight">
              2D Oncology Strategy Radar
            </h3>
            <p className="text-xs text-slate-600 font-serif italic">
              Click any bubble to view detailed clinical trial protocols, publications, and evidence timeline.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xs border border-slate-200">
            Mapping <strong className="text-slate-900">{directions.length}</strong> Research Directions
          </div>
        </div>

        {/* The 2D Radar Canvas Container */}
        <div className="relative w-full h-[460px] sm:h-[520px] bg-slate-50 rounded-xs border border-slate-300 p-4 overflow-hidden select-none">
          {/* Vertical Maturity Columns (5 Bands) */}
          <div className="absolute inset-0 grid grid-cols-5 pointer-events-none">
            <div className="border-r border-dashed border-slate-300 flex flex-col justify-end p-2 bg-slate-100/30">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Preclinical / Signal
              </span>
            </div>
            <div className="border-r border-dashed border-slate-300 flex flex-col justify-end p-2 bg-slate-100/10">
              <span className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                Phase I (Early)
              </span>
            </div>
            <div className="border-r border-dashed border-slate-300 flex flex-col justify-end p-2 bg-blue-50/20">
              <span className="text-[9px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                Phase II (Mid)
              </span>
            </div>
            <div className="border-r border-dashed border-slate-300 flex flex-col justify-end p-2 bg-indigo-50/20">
              <span className="text-[9px] font-mono font-bold text-indigo-900 uppercase tracking-wider">
                Phase III (Late)
              </span>
            </div>
            <div className="flex flex-col justify-end p-2 bg-emerald-500/5">
              <span className="text-[9px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                Approved / SoC
              </span>
            </div>
          </div>

          {/* Horizontal Activity Bands (3 levels) */}
          <div className="absolute inset-0 grid grid-rows-3 pointer-events-none">
            <div className="border-b border-dashed border-slate-200/80 p-2 text-right">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400">
                High Activity Density
              </span>
            </div>
            <div className="border-b border-dashed border-slate-200/80 p-2 text-right">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400">
                Moderate Activity
              </span>
            </div>
            <div className="p-2 text-right">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400">
                Emerging / Low Activity
              </span>
            </div>
          </div>

          {/* Axis Labels */}
          <div className="absolute top-2.5 left-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 bg-white/80 px-2 py-0.5 rounded-xs border border-slate-200 pointer-events-none">
            Y: Research Activity Density ↑
          </div>
          <div className="absolute bottom-2.5 right-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 bg-white/80 px-2 py-0.5 rounded-xs border border-slate-200 pointer-events-none">
            X: Clinical Maturity →
          </div>

          {/* Direction Nodes / Bubbles */}
          {directions.map((dir, idx) => {
            const xPercent = getMaturityX(dir);
            const yPercent = getActivityY(dir);
            const size = getBubbleRadius(dir);
            const isSelected = selectedDirId === dir.id;
            const momentum = dir.momentum || 'STABLE';
            const momConfig = MOMENTUM_CONFIG[momentum] || MOMENTUM_CONFIG.STABLE;

            return (
              <div
                key={dir.id || idx}
                id={`radar-bubble-${dir.id}`}
                style={{
                  left: `${xPercent}%`,
                  top: `${yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => {
                  setSelectedDirId(dir.id);
                  onSelectDirection(dir);
                }}
                onMouseEnter={() => setHoveredDir(dir)}
                onMouseLeave={() => setHoveredDir(null)}
                className={`absolute cursor-pointer transition-transform duration-200 group z-10 ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-115 hover:z-20'
                }`}
              >
                {/* Visual Bubble */}
                <div
                  style={{
                    width: `${size * 1.5}px`,
                    height: `${size * 1.5}px`,
                  }}
                  className={`rounded-full flex items-center justify-center font-mono font-bold text-white shadow-md border-2 ${
                    isSelected ? 'ring-4 ring-slate-900 border-white' : 'border-white/90'
                  } ${momConfig.bgClass}`}
                >
                  <span className="text-xs">{idx + 1}</span>
                </div>

                {/* Bubble label chip below */}
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-xs border border-slate-300 text-[10px] font-sans font-bold text-slate-900 shadow-xs pointer-events-none max-w-[120px] truncate">
                  {dir.name}
                </div>

                {/* Rich Hover Tooltip (Part 3) */}
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-slate-900 text-white text-xs p-3.5 rounded-xs shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 space-y-2 border border-slate-700">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Strategy #{idx + 1}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider text-white ${momConfig.bgClass}`}
                    >
                      {momConfig.arrow} {momConfig.label}
                    </span>
                  </div>

                  <p className="font-bold font-serif text-sm leading-snug text-white">
                    {dir.name}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono border-t border-slate-800 pt-2 text-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Maturity:</span>
                      <span className="font-bold text-white">{dir.maturity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Highest Phase:</span>
                      <span className="font-bold text-white">{dir.highestTrialPhase}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Trials:</span>
                      <span className="font-bold text-white">
                        {dir.trialCount} ({dir.recruitingTrialCount} recruiting)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Publications:</span>
                      <span className="font-bold text-white">{dir.publicationCount} papers</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1 flex items-center justify-between">
                    <span>Evidence Date:</span>
                    <span className="text-slate-200">{dir.latestEvidenceDate}</span>
                  </div>

                  <div className="text-[10px] font-serif italic text-amber-300 pt-0.5 text-center">
                    Click bubble to explore full evidence portfolio →
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Standardized Interactive Legend (Part 3) */}
        <div className="p-4 rounded-xs bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Legend 1: X Position */}
          <div className="space-y-1">
            <span className="font-mono font-bold uppercase text-[10px] text-slate-500 tracking-wider block">
              X-Axis: Clinical Maturity
            </span>
            <p className="text-slate-700 font-serif leading-relaxed">
              Left to right progression: Preclinical studies → Phase I → Phase II → Phase III → Regulatory Approval.
            </p>
          </div>

          {/* Legend 2: Y Position */}
          <div className="space-y-1">
            <span className="font-mono font-bold uppercase text-[10px] text-slate-500 tracking-wider block">
              Y-Axis: Research Activity
            </span>
            <p className="text-slate-700 font-serif leading-relaxed">
              Normalized score based on active trial accrual, publication velocity, and recent protocol updates.
            </p>
          </div>

          {/* Legend 3: Bubble Size */}
          <div className="space-y-1">
            <span className="font-mono font-bold uppercase text-[10px] text-slate-500 tracking-wider block">
              Bubble Size: Research Volume
            </span>
            <p className="text-slate-700 font-serif leading-relaxed">
              Deterministic bubble radius proportional to total volume of clinical trials and scientific publications.
            </p>
          </div>

          {/* Legend 4: Bubble Color / Momentum */}
          <div className="space-y-1.5">
            <span className="font-mono font-bold uppercase text-[10px] text-slate-500 tracking-wider block">
              Bubble Color: Momentum
            </span>
            <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                <span className="text-slate-800">Fast Rising (↑)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                <span className="text-slate-800">Rising (↗)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <span className="text-slate-800">Stable (→)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
                <span className="text-slate-800">Low Activity (↓)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Direction Quick Actions Strip */}
        {selectedDirection && (
          <div className="p-4 rounded-xs bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-xs bg-slate-800 text-slate-300 border border-slate-700">
                  Active Radar Selection
                </span>
                <MaturityBadge maturity={selectedDirection.maturity} size="sm" />
                {selectedDirection.momentum && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider text-white ${
                      MOMENTUM_CONFIG[selectedDirection.momentum]?.bgClass || 'bg-slate-700'
                    }`}
                  >
                    {MOMENTUM_CONFIG[selectedDirection.momentum]?.arrow}{' '}
                    {MOMENTUM_CONFIG[selectedDirection.momentum]?.label}
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold font-serif text-white">
                {selectedDirection.name}
              </h4>
              <p className="text-xs text-slate-300 font-serif italic line-clamp-1">
                {selectedDirection.description}
              </p>
            </div>

            <button
              id={`btn-radar-inspect-${selectedDirection.id}`}
              onClick={() => onSelectDirection(selectedDirection)}
              className="px-5 py-2.5 rounded-xs text-xs font-mono font-bold uppercase tracking-wider bg-white text-slate-900 hover:bg-slate-100 transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
            >
              <span>Explore Evidence Portfolio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
