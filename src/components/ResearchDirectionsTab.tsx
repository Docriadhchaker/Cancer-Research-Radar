import React, { useState } from 'react';
import { ResearchDirection, ResearchMomentum } from '../types/research';
import { MaturityBadge } from './MaturityBadge';
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  Calendar,
  Layers,
  Sparkles,
  Tag,
  ShieldCheck,
  Info,
  TrendingUp,
  ArrowUpRight,
  Minus,
  ArrowDownRight,
  Award,
  HelpCircle,
} from 'lucide-react';

interface ResearchDirectionsTabProps {
  directions: ResearchDirection[];
  onSelectDirection: (direction: ResearchDirection) => void;
  isAIGrounded?: boolean;
}

const MOMENTUM_BADGE: Record<
  ResearchMomentum,
  { label: string; arrow: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  'FAST RISING': {
    label: 'Fast Rising',
    arrow: '↑',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
    icon: ArrowUpRight,
  },
  RISING: {
    label: 'Rising',
    arrow: '↗',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    icon: TrendingUp,
  },
  STABLE: {
    label: 'Stable',
    arrow: '→',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: Minus,
  },
  'LOW ACTIVITY': {
    label: 'Low Activity',
    arrow: '↓',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: ArrowDownRight,
  },
};

export const ResearchDirectionsTab: React.FC<ResearchDirectionsTabProps> = ({
  directions,
  onSelectDirection,
  isAIGrounded,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showMomentumTooltip, setShowMomentumTooltip] = useState<string | null>(null);

  const categories = ['ALL', 'STANDARD / REGULATORY', 'CLINICAL RESEARCH', 'EARLY RESEARCH'];

  const filteredDirections =
    filterCategory === 'ALL'
      ? directions
      : directions.filter(d => d.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Category filter pills & provenance info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              id={`filter-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xs text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? `All Strategies (${directions.length})` : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
          <span>Showing <strong className="text-slate-900">{filteredDirections.length}</strong> of {directions.length} directions</span>
        </div>
      </div>

      {/* Grid of Standardized Research Direction Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredDirections.map((dir, index) => {
          const momentum = dir.momentum || 'STABLE';
          const momConfig = MOMENTUM_BADGE[momentum] || MOMENTUM_BADGE.STABLE;

          return (
            <div
              key={dir.id || index}
              id={`research-direction-card-${dir.id}`}
              className="bg-white rounded-xs border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                {/* Header: Category, Maturity Badge, and Research Momentum Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-700 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300">
                      {dir.category}
                    </span>
                    <MaturityBadge maturity={dir.maturity} size="sm" />
                  </div>

                  {/* Research Momentum Badge with Tooltip */}
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setShowMomentumTooltip(dir.id)}
                      onMouseLeave={() => setShowMomentumTooltip(null)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs border text-[10px] font-mono font-bold uppercase tracking-wider ${momConfig.badgeClass}`}
                    >
                      <span>{momConfig.arrow} {momConfig.label}</span>
                      <Info className="w-3 h-3 opacity-60" />
                    </button>

                    {showMomentumTooltip === dir.id && (
                      <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 text-white text-xs p-3 rounded-xs shadow-xl z-30 space-y-1 animate-in fade-in">
                        <p className="font-mono font-bold uppercase text-[9px] text-amber-400">
                          Research Momentum: {momConfig.label}
                        </p>
                        <p className="font-serif leading-relaxed text-slate-300 text-[11px]">
                          {dir.momentumExplanation || 'Measures recent trial accrual velocity and publication density over time. Does not indicate clinical efficacy.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direction Name */}
                <h3 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
                  {dir.name}
                </h3>

                {/* Plain-Language Explanation */}
                <p className="text-sm text-slate-700 leading-relaxed font-serif">
                  {dir.description}
                </p>

                {/* Why Researchers are Interested */}
                {dir.whyResearchersInterested && (
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xs border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block font-mono uppercase text-[10px] tracking-wider">
                      Biological Rationale & Investigation Motive:
                    </span>
                    <p className="leading-relaxed font-serif italic">{dir.whyResearchersInterested}</p>
                  </div>
                )}

                {/* Target Biomarkers */}
                {dir.biomarkers && dir.biomarkers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 mr-1">
                      Target markers:
                    </span>
                    {dir.biomarkers.map(bm => (
                      <span
                        key={bm}
                        className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-xs bg-slate-100 text-slate-800 border border-slate-300"
                      >
                        {bm}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Comprehensive Metrics Grid (Part 4) */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Trials Metric */}
                  <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200 space-y-0.5">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider font-bold">
                      Clinical Trials
                    </span>
                    <span className="font-bold text-slate-900 font-mono text-xs block">
                      {dir.trialCount} <span className="text-[10px] text-emerald-800 font-semibold">({dir.recruitingTrialCount} recruiting)</span>
                    </span>
                  </div>

                  {/* Highest Phase */}
                  <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200 space-y-0.5">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider font-bold">
                      Highest Phase
                    </span>
                    <span className="font-bold text-slate-900 font-mono text-xs truncate block">
                      {dir.highestTrialPhase || 'Preclinical'}
                    </span>
                  </div>

                  {/* Publications */}
                  <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200 space-y-0.5">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider font-bold">
                      Publications
                    </span>
                    <span className="font-bold text-slate-900 font-mono text-xs block">
                      {dir.publicationCount} papers
                    </span>
                  </div>

                  {/* Latest Evidence Date */}
                  <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200 space-y-0.5">
                    <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider font-bold">
                      Latest Evidence
                    </span>
                    <span className="font-bold text-slate-900 font-mono text-xs truncate block">
                      {dir.latestEvidenceDate || '2025/2026'}
                    </span>
                  </div>
                </div>

                {/* Regulatory Status Pill / Text */}
                <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800">
                    <Award className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="truncate">
                      <strong>Regulatory Status:</strong> {dir.regulatoryStatus || 'Investigational / Not approved'}
                    </span>
                  </div>
                </div>

                {/* Footer Controls: Registry count & Explore Button */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-mono text-[11px] text-slate-500">
                    {dir.sourceIds?.length || 0} primary registry links
                  </span>

                  <button
                    id={`btn-explore-direction-${dir.id}`}
                    onClick={() => onSelectDirection(dir)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    <span>Explore Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
