import React, { useState } from 'react';
import { Search, Sparkles, MapPin, Tag, Sliders, ArrowRight, Dna, CheckCircle2, X } from 'lucide-react';
import { SearchQuery, CancerStage } from '../types/research';
import { DisclaimerBanner } from './DisclaimerBanner';

interface SearchHeroProps {
  onSearch: (query: SearchQuery) => void;
  onLoadDemo: () => void;
  isLoading?: boolean;
}

const COMMON_CANCER_TYPES = [
  'Colorectal cancer',
  'Breast cancer',
  'Lung cancer',
  'Pancreatic cancer',
  'Melanoma',
  'Gastric cancer',
  'Ovarian cancer',
  'Prostate cancer',
];

const SUGGESTED_BIOMARKERS = [
  'KRAS G12C',
  'KRAS G12D',
  'BRAF V600E',
  'HER2',
  'EGFR',
  'ALK',
  'BRCA1',
  'BRCA2',
  'MSI-H',
  'MSS',
  'PD-L1',
  'ctDNA',
];

const STAGE_OPTIONS: CancerStage[] = [
  'Not specified',
  'Localized',
  'Locally advanced',
  'Metastatic',
];

export const SearchHero: React.FC<SearchHeroProps> = ({
  onSearch,
  onLoadDemo,
  isLoading = false,
}) => {
  const [cancerType, setCancerType] = useState('');
  const [cancerSubtype, setCancerSubtype] = useState('');
  const [stage, setStage] = useState<CancerStage>('Not specified');
  const [biomarkers, setBiomarkers] = useState<string[]>([]);
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState<number | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (trimmed && !biomarkers.includes(trimmed)) {
      setBiomarkers([...biomarkers, trimmed]);
      setCurrentTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setBiomarkers(biomarkers.filter(t => t !== tagToRemove));
  };

  const handleKeyDownTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (currentTagInput.trim()) {
        handleAddTag(currentTagInput);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancerType.trim()) return;

    onSearch({
      cancerType: cancerType.trim(),
      cancerSubtype: cancerSubtype.trim() || undefined,
      stage,
      biomarkers,
      location: location.trim() || undefined,
      radius,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-4 sm:py-8">
      {/* Top Disclaimer Card */}
      <DisclaimerBanner />

      {/* Hero Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-white text-slate-700 text-xs font-mono font-bold uppercase tracking-widest border border-slate-200 shadow-xs">
          <Dna className="w-3.5 h-3.5 text-indigo-600" />
          <span>Biomedical Intelligence Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
          Explore what oncology research is investigating now.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-serif italic">
          Discover emerging therapeutic strategies, recent clinical trials, regulatory decisions, and translational reports — with primary source citations.
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="bg-white rounded-xs border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Input: Cancer Type */}
          <div className="space-y-2">
            <label
              htmlFor="input-cancer-type"
              className="block text-xs font-bold uppercase tracking-widest text-slate-900 font-mono flex items-center justify-between"
            >
              <span>Cancer type <span className="text-rose-600">*</span></span>
              <span className="text-[11px] font-normal font-sans text-slate-500">Required (e.g. Colorectal cancer, Breast cancer)</span>
            </label>
            <div className="relative">
              <input
                id="input-cancer-type"
                type="text"
                value={cancerType}
                onChange={e => setCancerType(e.target.value)}
                placeholder="Enter cancer type (e.g., Colorectal cancer, Breast cancer, Melanoma...)"
                required
                className="w-full pl-11 pr-4 py-3 text-base rounded-xs border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
              <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400 mr-1">Suggestions:</span>
              {COMMON_CANCER_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCancerType(type)}
                  className={`text-xs px-2.5 py-0.5 rounded-xs border transition-all ${
                    cancerType.toLowerCase() === type.toLowerCase()
                      ? 'bg-slate-900 border-slate-900 text-white font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Refinement Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Cancer Subtype */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-cancer-subtype"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono"
              >
                Cancer subtype <span className="text-slate-400 font-normal font-sans">(Optional)</span>
              </label>
              <input
                id="input-cancer-subtype"
                type="text"
                value={cancerSubtype}
                onChange={e => setCancerSubtype(e.target.value)}
                placeholder="e.g. Adenocarcinoma, TNBC, Invasive ductal"
                className="w-full px-3.5 py-2 text-sm rounded-xs border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>

            {/* Stage Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor="select-stage"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono"
              >
                Stage <span className="text-slate-400 font-normal font-sans">(Optional)</span>
              </label>
              <select
                id="select-stage"
                value={stage}
                onChange={e => setStage(e.target.value as CancerStage)}
                className="w-full px-3.5 py-2 text-sm rounded-xs border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                {STAGE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Biomarkers / Molecular Alterations (Tag Input) */}
          <div className="space-y-2 pt-1">
            <label
              htmlFor="input-biomarkers"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Biomarkers / molecular alterations</span>
                <span className="text-slate-400 font-normal font-sans">(Optional)</span>
              </div>
              <span className="text-[11px] font-sans text-slate-400">Press Enter or comma to add</span>
            </label>

            <div className="p-2 min-h-[46px] rounded-xs border border-slate-300 bg-white flex flex-wrap items-center gap-1.5 focus-within:ring-1 focus-within:ring-slate-900">
              {biomarkers.map(bm => (
                <span
                  key={bm}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-slate-100 text-slate-900 border border-slate-300 text-xs font-mono font-bold"
                >
                  <span>{bm}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(bm)}
                    className="hover:text-red-500 p-0.5"
                    aria-label={`Remove ${bm}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                id="input-biomarkers"
                type="text"
                value={currentTagInput}
                onChange={e => setCurrentTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                onBlur={() => {
                  if (currentTagInput.trim()) handleAddTag(currentTagInput);
                }}
                placeholder={biomarkers.length === 0 ? 'Type biomarker (e.g. KRAS G12C, HER2, EGFR)...' : 'Add another...'}
                className="flex-1 min-w-[140px] bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none px-1 py-0.5 font-mono"
              />
            </div>

            {/* Biomarker quick pick tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400">Popular markers:</span>
              {SUGGESTED_BIOMARKERS.map(bm => (
                <button
                  key={bm}
                  type="button"
                  onClick={() => handleAddTag(bm)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-xs border transition-colors ${
                    biomarkers.includes(bm)
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  + {bm}
                </button>
              ))}
            </div>
          </div>

          {/* Location & Radius */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="input-location"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Patient / research location</span>
                <span className="text-slate-400 font-normal font-sans">(Optional)</span>
              </label>
              <input
                id="input-location"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Country or city (e.g. Tunisia, Paris, France, Boston, USA)"
                className="w-full px-3.5 py-2 text-sm rounded-xs border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="input-radius"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono"
              >
                Radius (km) <span className="text-slate-400 font-normal font-sans">(Optional)</span>
              </label>
              <input
                id="input-radius"
                type="number"
                value={radius || ''}
                onChange={e => setRadius(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 500"
                min={10}
                max={20000}
                className="w-full px-3.5 py-2 text-sm rounded-xs border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Row: Primary Button & Preloaded Demo */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
            {/* One-click preloaded demo button */}
            <button
              id="btn-hero-preloaded-demo"
              type="button"
              onClick={onLoadDemo}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xs border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Preloaded Demo: Metastatic CRC (KRAS G12C) in Tunisia</span>
            </button>

            {/* Primary Submit Button */}
            <button
              id="btn-explore-research"
              type="submit"
              disabled={isLoading || !cancerType.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-xs bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Aggregating Landscape...</span>
                </>
              ) : (
                <>
                  <span>Explore Research</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Informational Guidance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-left">
        <div className="p-4 rounded-xs border border-slate-200 bg-white shadow-xs space-y-1.5">
          <div className="font-bold text-xs text-slate-900 uppercase font-mono tracking-widest">
            1. Strategy Synthesis
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
            Organizes hundreds of fragmented trials and papers into structured therapeutic strategies (e.g. KRAS+EGFR combos, ctDNA guidance, ADCs).
          </p>
        </div>

        <div className="p-4 rounded-xs border border-slate-200 bg-white shadow-xs space-y-1.5">
          <div className="font-bold text-xs text-slate-900 uppercase font-mono tracking-widest">
            2. Transparent Maturity
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
            Every direction is classified by clinical phase maturity with clear disclaimers that research maturity ≠ proven treatment benefit.
          </p>
        </div>

        <div className="p-4 rounded-xs border border-slate-200 bg-white shadow-xs space-y-1.5">
          <div className="font-bold text-xs text-slate-900 uppercase font-mono tracking-widest">
            3. Grounded Sources
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
            Traceable directly to ClinicalTrials.gov NCT records, PubMed identifiers, and FDA regulatory databases.
          </p>
        </div>
      </div>
    </div>
  );
};
