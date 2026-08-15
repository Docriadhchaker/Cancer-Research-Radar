import React, { useState, useMemo } from 'react';
import { ClinicalTrial, TrialStatus } from '../types/trials';
import {
  Search,
  Filter,
  MapPin,
  ExternalLink,
  Building2,
  Calendar,
  Layers,
  FileText,
  UserCheck,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ClinicalTrialsTabProps {
  trials: ClinicalTrial[];
  userLocation?: string;
}

const STATUS_COLORS: Record<TrialStatus, string> = {
  Recruiting: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-mono font-bold',
  'Active, not recruiting': 'bg-blue-50 text-blue-800 border-blue-300 font-mono font-bold',
  'Not yet recruiting': 'bg-amber-50 text-amber-800 border-amber-300 font-mono font-bold',
  Completed: 'bg-slate-100 text-slate-700 border-slate-300 font-mono font-bold',
  Terminated: 'bg-rose-50 text-rose-800 border-rose-300 font-mono font-bold',
  Withdrawn: 'bg-rose-50 text-rose-800 border-rose-300 font-mono font-bold',
  Unknown: 'bg-slate-50 text-slate-600 border-slate-300 font-mono font-bold',
};

export const ClinicalTrialsTab: React.FC<ClinicalTrialsTabProps> = ({
  trials,
  userLocation,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [recruitingOnly, setRecruitingOnly] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [sortBy, setSortBy] = useState<'nearest' | 'newest' | 'highestPhase'>('newest');
  const [expandedNctId, setExpandedNctId] = useState<string | null>(null);

  // Extract unique countries
  const countries = useMemo(() => {
    const set = new Set<string>();
    trials.forEach(t => t.locations.forEach(l => l.country && l.country !== 'Not reported' && set.add(l.country)));
    return ['ALL', ...Array.from(set)];
  }, [trials]);

  // Extract unique phases
  const phases = ['ALL', 'Phase 3', 'Phase 2', 'Phase 1', 'Phase 1/Phase 2'];

  const isAnyFallback = trials.some(t => t.isFallback);

  const filteredTrials = useMemo(() => {
    let result = trials.filter(t => {
      // Recruiting only
      if (recruitingOnly && t.status !== 'Recruiting') return false;

      // Phase
      if (selectedPhase !== 'ALL' && !t.phase.toLowerCase().includes(selectedPhase.toLowerCase())) {
        return false;
      }

      // Country
      if (
        selectedCountry !== 'ALL' &&
        !t.locations.some(l => l.country.toLowerCase().includes(selectedCountry.toLowerCase()))
      ) {
        return false;
      }

      // Keyword
      if (searchKeyword.trim().length > 0) {
        const query = searchKeyword.toLowerCase();
        const matchesNct = t.nctId.toLowerCase().includes(query);
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesIntervention = t.interventions.some(i => i.name.toLowerCase().includes(query));
        const matchesSponsor = t.sponsor.toLowerCase().includes(query);
        if (!matchesNct && !matchesTitle && !matchesIntervention && !matchesSponsor) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.lastUpdate || '').localeCompare(a.lastUpdate || '');
      }
      if (sortBy === 'highestPhase') {
        const getPhaseScore = (phase: string) => {
          if (phase.includes('3') || phase.includes('4')) return 3;
          if (phase.includes('2')) return 2;
          if (phase.includes('1')) return 1;
          return 0;
        };
        return getPhaseScore(b.phase) - getPhaseScore(a.phase);
      }
      if (sortBy === 'nearest') {
        const getMinDist = (t: ClinicalTrial) => {
          const distances = t.locations.map(l => l.distanceKm ?? 99999);
          return Math.min(...distances);
        };
        return getMinDist(a) - getMinDist(b);
      }
      return 0;
    });

    return result;
  }, [trials, recruitingOnly, selectedPhase, selectedCountry, searchKeyword, sortBy]);

  return (
    <div className="space-y-6">
      {/* Fallback Notice Banner if API was unavailable */}
      {isAnyFallback && (
        <div
          id="banner-trials-fallback"
          className="bg-amber-50 border border-amber-300 p-4 rounded-xs text-xs text-amber-950 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-mono font-bold uppercase tracking-wider text-[11px] text-amber-900">
              ClinicalTrials.gov Temporarily Unavailable — Displaying DEMO FALLBACK:
            </p>
            <p className="leading-relaxed font-serif">
              Live ClinicalTrials.gov query encountered a network delay. The trial protocols displayed below represent <strong>curated reference oncology trials</strong> clearly tagged as <strong>DEMO FALLBACK</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xs border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <input
              id="input-trials-keyword"
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Search trials by drug, target biomarker, sponsor, or NCT ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xs border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-mono font-bold uppercase tracking-wider shrink-0">Sort:</span>
            <select
              id="select-trials-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xs border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono"
            >
              <option value="newest">Newest Registry Update</option>
              <option value="highestPhase">Highest Clinical Phase</option>
              {userLocation && <option value="nearest">Nearest to Location</option>}
            </select>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Recruiting Only Toggle */}
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xs border border-slate-300 cursor-pointer select-none bg-slate-50 hover:bg-slate-100">
              <input
                id="checkbox-recruiting-only"
                type="checkbox"
                checked={recruitingOnly}
                onChange={e => setRecruitingOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded-xs text-slate-900 focus:ring-slate-900"
              />
              <span className="font-mono font-bold text-slate-800 uppercase text-[11px]">Recruiting only</span>
            </label>

            {/* Phase Filter */}
            <select
              value={selectedPhase}
              onChange={e => setSelectedPhase(e.target.value)}
              className="px-2.5 py-1.5 rounded-xs border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono text-xs"
            >
              {phases.map(p => (
                <option key={p} value={p}>
                  {p === 'ALL' ? 'All Phases' : p}
                </option>
              ))}
            </select>

            {/* Country Filter */}
            {countries.length > 2 && (
              <select
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className="px-2.5 py-1.5 rounded-xs border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono text-xs"
              >
                {countries.map(c => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Countries' : c}
                  </option>
                ))}
              </select>
            )}
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Showing <strong className="text-slate-900">{filteredTrials.length}</strong> of{' '}
            {trials.length} protocol records
          </span>
        </div>
      </div>

      {/* Trials List */}
      {filteredTrials.length === 0 ? (
        <div className="bg-white rounded-xs border border-slate-200 p-8 text-center space-y-2">
          <p className="text-sm font-bold text-slate-900 font-serif">
            No active clinical trials matching this filter were identified in the registry index.
          </p>
          <p className="text-xs text-slate-500 font-serif italic">
            Try adjusting phase, biomarker, or geographical criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrials.map(trial => {
            const isExpanded = expandedNctId === trial.nctId;
            const statusClass = STATUS_COLORS[trial.status] || STATUS_COLORS['Unknown'];

            return (
              <div
                key={trial.nctId}
                id={`trial-card-${trial.nctId}`}
                className="bg-white rounded-xs border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Row: NCT ID, Source Badge, Status Pill, Phase, and Source Link */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300">
                      {trial.nctId}
                    </span>

                    {/* Live vs Demo Fallback Badge */}
                    {trial.isFallback ? (
                      <span className="px-2 py-0.5 rounded-xs bg-amber-50 text-amber-900 border border-amber-300 font-mono font-bold text-[10px] uppercase tracking-wider">
                        DEMO FALLBACK
                      </span>
                    ) : trial.isDemo ? (
                      <span className="px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 border border-slate-300 font-mono text-[10px] uppercase tracking-wider">
                        DEMO RECORD
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-xs bg-sky-50 text-sky-900 border border-sky-300 font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-sky-600" />
                        ClinicalTrials.gov (LIVE)
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded-xs border text-[11px] uppercase tracking-wider ${statusClass}`}>
                      {trial.status}
                    </span>
                    <span className="font-mono font-bold bg-slate-50 text-slate-800 px-2 py-0.5 rounded-xs border border-slate-200 text-[11px]">
                      {trial.phase || 'Phase Not Reported'}
                    </span>
                  </div>

                  <a
                    id={`link-ctgov-${trial.nctId}`}
                    href={trial.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-mono text-[11px] font-bold uppercase tracking-wider border-b border-slate-300 hover:border-slate-900 pb-0.5 transition-colors"
                  >
                    <span>ClinicalTrials.gov</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Official Title */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {trial.title}
                  </h3>
                  {trial.briefTitle && trial.briefTitle !== 'Not reported' && trial.briefTitle !== trial.title && (
                    <p className="text-xs text-slate-500 font-serif italic mt-0.5">
                      Brief title: {trial.briefTitle}
                    </p>
                  )}
                </div>

                {/* Interventions & Sponsor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
                      Interventions / Regimen
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {trial.interventions.map((intv, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-xs bg-slate-50 text-slate-800 font-mono text-[11px] border border-slate-200"
                        >
                          <strong>{intv.type}:</strong> {intv.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono block">
                      Lead Sponsor / Collaborators
                    </span>
                    <p className="text-slate-800 font-serif italic truncate">
                      {trial.sponsor}
                    </p>
                  </div>
                </div>

                {/* Locations Preview */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Clinical Study Sites ({trial.locations.length} reported)</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {trial.locations.slice(0, 3).map((loc, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-xs bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-mono"
                      >
                        {loc.facility} — {loc.city}, {loc.country}
                        {loc.distanceKm !== undefined && ` (${loc.distanceKm} km)`}
                      </span>
                    ))}
                    {trial.locations.length > 3 && (
                      <span className="text-[11px] font-mono text-slate-500 self-center">
                        +{trial.locations.length - 3} additional sites
                      </span>
                    )}
                  </div>
                </div>

                {/* Eligibility Summary & Expander */}
                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t border-slate-200 text-xs bg-slate-50 p-4 rounded-xs">
                    <div className="flex items-center gap-1.5 text-slate-900 font-mono font-bold uppercase text-[11px] tracking-wider">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-700" />
                      <span>Eligibility Criteria Summary</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-serif italic">
                      {trial.eligibility?.summary || 'Detailed summary not provided.'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono text-slate-600 border-t border-slate-200">
                      <div>
                        <strong>Gender / Sex:</strong> {trial.eligibility?.gender || 'All'}
                      </div>
                      <div>
                        <strong>Min Age:</strong> {trial.eligibility?.minimumAge || 'Not reported'}
                      </div>
                      <div>
                        <strong>Max Age:</strong> {trial.eligibility?.maximumAge || 'Not reported'}
                      </div>
                      <div>
                        <strong>Study Type:</strong> {trial.studyType || 'Interventional'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Controls: Toggle Details */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-mono text-slate-400">
                    Registry verification: {trial.lastUpdate || 'Not reported'}
                  </span>
                  <button
                    id={`btn-toggle-trial-details-${trial.nctId}`}
                    onClick={() => setExpandedNctId(isExpanded ? null : trial.nctId)}
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Criteria' : 'View Protocol Details'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
