import React, { useState, useEffect, useCallback } from 'react';
import { SearchQuery, ResearchDirection } from './types/research';
import { LandscapeResponse } from './server/researchAggregator';
import { fetchLandscapeData } from './services/radarApi';
import { Navbar, AppRoute } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { SearchHero } from './components/SearchHero';
import { DashboardHeader } from './components/DashboardHeader';
import { ResearchDirectionsTab } from './components/ResearchDirectionsTab';
import { ResearchRadarTab } from './components/ResearchRadarTab';
import { ClinicalTrialsTab } from './components/ClinicalTrialsTab';
import { ResearchPapersTab } from './components/ResearchPapersTab';
import { RegulatoryApprovalsTab } from './components/RegulatoryApprovalsTab';
import { EvidenceDetailModal } from './components/EvidenceDetailModal';
import { AboutModal } from './components/AboutModal';
import {
  Compass,
  Radar,
  FlaskConical,
  BookOpen,
  Award,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('dashboard');
  const [dashboardSubTab, setDashboardSubTab] = useState<'directions' | 'radar'>('directions');
  const [query, setQuery] = useState<SearchQuery | null>(null);
  const [landscape, setLandscape] = useState<LandscapeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<ResearchDirection | null>(null);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

  // Default preloaded cohort: Metastatic Colorectal Cancer (KRAS G12C)
  const defaultDemoQuery: SearchQuery = {
    cancerType: 'Colorectal cancer',
    cancerSubtype: 'Metastatic Adenocarcinoma',
    stage: 'Metastatic',
    biomarkers: ['KRAS G12C'],
    location: 'Tunisia',
    radius: 500,
  };

  // Perform search
  const handlePerformSearch = useCallback(async (searchQuery: SearchQuery) => {
    setIsLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const data = await fetchLandscapeData(searchQuery);
      setLandscape(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to load oncology landscape:', err);
      setError(err.message || 'Unable to aggregate research landscape. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync URL routes
  const handleNavigate = (route: AppRoute) => {
    setCurrentRoute(route);
    let newPath = '/';
    if (route === 'trials') newPath = '/trials';
    else if (route === 'research') newPath = '/research';
    else if (route === 'regulatory') newPath = '/regulatory';

    window.history.pushState({ route }, '', newPath);

    // If navigated to a data view and no landscape is loaded, auto-load demo cohort
    if (!landscape && (route === 'trials' || route === 'research' || route === 'regulatory')) {
      handlePerformSearch(defaultDemoQuery);
    }
  };

  // Handle browser back/forward buttons & initial route parse
  useEffect(() => {
    const parsePath = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('trial')) {
        setCurrentRoute('trials');
        if (!landscape) handlePerformSearch(defaultDemoQuery);
      } else if (path.includes('research') || path.includes('paper')) {
        setCurrentRoute('research');
        if (!landscape) handlePerformSearch(defaultDemoQuery);
      } else if (path.includes('regulatory') || path.includes('approval')) {
        setCurrentRoute('regulatory');
        if (!landscape) handlePerformSearch(defaultDemoQuery);
      } else {
        setCurrentRoute('dashboard');
      }
    };

    parsePath();

    const onPopState = () => {
      parsePath();
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [handlePerformSearch]);

  const handleLoadDemo = () => {
    handlePerformSearch(defaultDemoQuery);
  };

  const handleResetSearch = () => {
    setQuery(null);
    setLandscape(null);
    setError(null);
    setCurrentRoute('dashboard');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onRouteChange={handleNavigate}
        onNewSearch={handleResetSearch}
        onLoadDemo={handleLoadDemo}
        onOpenAbout={() => setShowAboutModal(true)}
        dataSourceStatus={landscape?.dataSourceStatus}
        dataMode={landscape?.dataMode || 'DEMO DATA'}
        isSearching={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Error Banner */}
        {error && (
          <div
            id="error-notification"
            className="bg-rose-50 border border-rose-300 p-4 rounded-xs flex items-center justify-between gap-3 text-xs text-rose-900 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => query && handlePerformSearch(query)}
              className="px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xs bg-rose-100 text-rose-900 hover:bg-rose-200 border border-rose-300 transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* View 1: Search Hero (Dashboard when no active query) */}
        {!query && !landscape && currentRoute === 'dashboard' && (
          <SearchHero
            onSearch={handlePerformSearch}
            onLoadDemo={handleLoadDemo}
            isLoading={isLoading}
          />
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6 animate-pulse py-8">
            <div className="h-8 bg-slate-200 rounded-xs w-1/3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 bg-slate-200 rounded-xs border border-slate-300" />
              ))}
            </div>
            <div className="h-96 bg-slate-200 rounded-xs border border-slate-300" />
          </div>
        )}

        {/* View 2: Dashboard View with Data Loaded */}
        {!isLoading && landscape && query && currentRoute === 'dashboard' && (
          <div className="space-y-8">
            {/* Disclaimer strip */}
            <DisclaimerBanner compact />

            {/* Dashboard Header with 4 standardized metric cards */}
            <DashboardHeader
              query={landscape.query}
              summary={landscape.summary}
              dataMode={landscape.dataMode}
              onModifySearch={() => setQuery(null)}
            />

            {/* Sub-Tabs: Research Directions vs 2D Radar */}
            <div className="border-b border-slate-200">
              <nav className="flex space-x-2 sm:space-x-4 pb-px" aria-label="Dashboard Subtabs">
                <button
                  id="tab-btn-directions"
                  onClick={() => setDashboardSubTab('directions')}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-mono uppercase tracking-wider text-xs whitespace-nowrap transition-all ${
                    dashboardSubTab === 'directions'
                      ? 'border-slate-900 text-slate-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Research Directions</span>
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-xs bg-slate-100 text-slate-900 border border-slate-300 font-mono">
                    {landscape.researchDirections.length}
                  </span>
                </button>

                <button
                  id="tab-btn-radar"
                  onClick={() => setDashboardSubTab('radar')}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-mono uppercase tracking-wider text-xs whitespace-nowrap transition-all ${
                    dashboardSubTab === 'radar'
                      ? 'border-slate-900 text-slate-900 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Radar className="w-3.5 h-3.5" />
                  <span>Research Radar Visualizer</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-xs bg-slate-900 text-white uppercase">
                    2D Matrix
                  </span>
                </button>
              </nav>
            </div>

            {/* Subtab Contents */}
            <div>
              {dashboardSubTab === 'directions' ? (
                <ResearchDirectionsTab
                  directions={landscape.researchDirections}
                  onSelectDirection={dir => setSelectedDirection(dir)}
                  isAIGrounded={landscape.dataSourceStatus.geminiGrounding.active}
                />
              ) : (
                <ResearchRadarTab
                  directions={landscape.researchDirections}
                  onSelectDirection={dir => setSelectedDirection(dir)}
                />
              )}
            </div>
          </div>
        )}

        {/* View 3: Dedicated Clinical Trials Route */}
        {!isLoading && currentRoute === 'trials' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
                  Clinical Trial Protocols
                </h2>
                <p className="text-sm font-serif italic text-slate-600 mt-0.5">
                  Human clinical studies indexed from ClinicalTrials.gov v2 for {landscape?.query.cancerType || 'Oncology'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300">
                {landscape?.dataMode || 'DEMO DATA'}
              </span>
            </div>

            {landscape ? (
              <ClinicalTrialsTab
                trials={landscape.clinicalTrials}
                userLocation={landscape.query.location}
              />
            ) : (
              <div className="bg-white p-8 text-center rounded-xs border border-slate-200 space-y-3">
                <p className="text-sm text-slate-700 font-serif">Loading clinical trial records...</p>
                <button
                  onClick={handleLoadDemo}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-mono uppercase rounded-xs"
                >
                  Load Reference Cohort
                </button>
              </div>
            )}
          </div>
        )}

        {/* View 4: Dedicated Latest Research Route */}
        {!isLoading && currentRoute === 'research' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
                  Latest Research & Publications
                </h2>
                <p className="text-sm font-serif italic text-slate-600 mt-0.5">
                  Peer-reviewed reports, translational analyses, and PubMed literature records
                </p>
              </div>
              <span className="text-xs font-mono font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300">
                {landscape?.dataMode || 'DEMO DATA'}
              </span>
            </div>

            {landscape ? (
              <ResearchPapersTab publications={landscape.publications} />
            ) : (
              <div className="bg-white p-8 text-center rounded-xs border border-slate-200 space-y-3">
                <p className="text-sm text-slate-700 font-serif">Loading scientific publications...</p>
                <button
                  onClick={handleLoadDemo}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-mono uppercase rounded-xs"
                >
                  Load Reference Cohort
                </button>
              </div>
            )}
          </div>
        )}

        {/* View 5: Dedicated Regulatory Route */}
        {!isLoading && currentRoute === 'regulatory' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
                  Regulatory Approvals & Standards of Care
                </h2>
                <p className="text-sm font-serif italic text-slate-600 mt-0.5">
                  FDA approved oncology indications and approved therapeutic regimens
                </p>
              </div>
              <span className="text-xs font-mono font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300">
                {landscape?.dataMode || 'DEMO DATA'}
              </span>
            </div>

            {landscape ? (
              <RegulatoryApprovalsTab approvals={landscape.fdaApprovals} />
            ) : (
              <div className="bg-white p-8 text-center rounded-xs border border-slate-200 space-y-3">
                <p className="text-sm text-slate-700 font-serif">Loading regulatory approvals...</p>
                <button
                  onClick={handleLoadDemo}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-mono uppercase rounded-xs"
                >
                  Load Reference Cohort
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 py-8 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-serif italic text-slate-800 text-sm">
            Cancer Research Radar — Open-Source Oncology Exploration & Trial Discovery Engine
          </p>
          <p className="max-w-2xl mx-auto text-slate-500 text-[11px] font-sans leading-relaxed">
            Data sourced from ClinicalTrials.gov v2 REST API, Cure Cancer With AI, PubMed, and FDA Oncology Indexes. This platform is not a medical device, diagnostic tool, or treatment recommendation system.
          </p>
        </div>
      </footer>

      {/* Evidence Explorer Modal (Detail Page / View) */}
      {selectedDirection && (
        <EvidenceDetailModal
          direction={selectedDirection}
          allTrials={landscape?.clinicalTrials || []}
          allPublications={landscape?.publications || []}
          allApprovals={landscape?.fdaApprovals || []}
          onClose={() => setSelectedDirection(null)}
        />
      )}

      {/* About & Methodology Modal */}
      {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}
    </div>
  );
}
export default App;
