import React from 'react';
import { SearchQuery, LandscapeSummary, DataMode } from '../types/research';
import { Compass, FlaskConical, BookOpen, Award, ShieldAlert, Edit3 } from 'lucide-react';

interface DashboardHeaderProps {
  query: SearchQuery;
  summary: LandscapeSummary;
  dataMode?: DataMode;
  onModifySearch: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  query,
  summary,
  dataMode = 'DEMO DATA',
  onModifySearch,
}) => {
  return (
    <div className="space-y-6">
      {/* Editorial Dark Query Ribbon */}
      <div className="bg-slate-900 text-white p-5 sm:px-8 sm:py-4 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-slate-800">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
              Query Indication
            </span>
            <span className="text-sm sm:text-base font-bold tracking-tight text-white font-serif">
              {query.cancerType} {query.cancerSubtype ? `(${query.cancerSubtype})` : ''}
            </span>
          </div>

          <div className="hidden sm:block h-8 w-px bg-slate-700" />

          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
              Biomarker Focus
            </span>
            <span className="text-sm font-semibold text-slate-100 font-mono">
              {query.biomarkers && query.biomarkers.length > 0
                ? query.biomarkers.join(', ')
                : 'Broad Molecular Panel'}
            </span>
          </div>

          {query.stage && query.stage !== 'Not specified' && (
            <>
              <div className="hidden sm:block h-8 w-px bg-slate-700" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                  Clinical Stage
                </span>
                <span className="text-sm font-semibold text-slate-100">{query.stage}</span>
              </div>
            </>
          )}

          {query.location && (
            <>
              <div className="hidden sm:block h-8 w-px bg-slate-700" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                  Target Region
                </span>
                <span className="text-sm font-semibold text-emerald-300">
                  {query.location} {query.radius ? `(±${query.radius}km)` : ''}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4 justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>{dataMode}</span>
            </span>
          </div>

          <button
            id="btn-modify-search"
            onClick={onModifySearch}
            className="text-xs font-mono font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Edit3 className="w-3 h-3 text-slate-400" />
            <span>Refine Search</span>
          </button>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
            Oncology Research Landscape
          </h2>
          <p className="text-sm font-serif italic text-slate-600 mt-0.5">
            Systematic evidence synthesis for {query.cancerType}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
            INDEX STATUS:
          </span>
          <span className="text-xs font-mono font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300">
            {dataMode}
          </span>
        </div>
      </div>

      {/* 4 Standardized Metric Cards as per Part 8 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Research Directions */}
        <div
          id="metric-card-directions"
          className="bg-white border border-slate-200 p-5 rounded-xs shadow-xs space-y-1 relative hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
              Research Directions
            </span>
            <Compass className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono">
            {summary.emergingDirectionsCount}
          </div>
          <p className="text-xs font-serif italic text-slate-500">
            Distinct therapeutic & biological strategies mapped
          </p>
        </div>

        {/* Metric 2: Active / Recruiting Trials */}
        <div
          id="metric-card-trials"
          className="bg-white border border-slate-200 p-5 rounded-xs shadow-xs space-y-1 relative hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
              Active / Recruiting Trials
            </span>
            <FlaskConical className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono">
            {summary.activeRecruitingTrialsCount}
          </div>
          <p className="text-xs font-serif italic text-slate-500">
            Human clinical protocols on ClinicalTrials.gov
          </p>
        </div>

        {/* Metric 3: Recent Publications */}
        <div
          id="metric-card-publications"
          className="bg-white border border-slate-200 p-5 rounded-xs shadow-xs space-y-1 relative hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
              Recent Publications
            </span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono">
            {summary.recentPublicationsCount}
          </div>
          <p className="text-xs font-serif italic text-slate-500">
            Peer-reviewed papers & translational reports
          </p>
        </div>

        {/* Metric 4: Regulatory Developments */}
        <div
          id="metric-card-approvals"
          className="bg-white border border-slate-200 p-5 rounded-xs shadow-xs space-y-1 relative hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
              Regulatory Developments
            </span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-700 font-mono">
            {summary.fdaApprovalsCount < 10 ? `0${summary.fdaApprovalsCount}` : summary.fdaApprovalsCount}
          </div>
          <p className="text-xs font-serif italic text-slate-500">
            FDA approved standard-of-care indications
          </p>
        </div>
      </div>
    </div>
  );
};
