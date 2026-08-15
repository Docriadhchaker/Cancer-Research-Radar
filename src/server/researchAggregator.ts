import {
  SearchQuery,
  ResearchDirection,
  ResearchPaper,
  RegulatoryApproval,
  DataSourceStatus,
  LandscapeSummary,
  DataMode,
} from '../types/research';
import { ClinicalTrial } from '../types/trials';
import { getNormalizedCohort } from '../data/demo/normalizedCohorts';
import { ClinicalTrialsGovProvider } from '../services/providers/ClinicalTrialsGovProvider';
import { CureCancerAIProvider } from '../services/providers/CureCancerAIProvider';
import { synthesizeResearchDirections } from './geminiService';
import {
  calculateResearchMomentum,
  calculateMaturityScore,
  calculateResearchActivity,
  calculateBubbleSize,
} from '../data/demo/metricsCalculator';

export interface LandscapeResponse {
  query: SearchQuery;
  summary: LandscapeSummary;
  researchDirections: ResearchDirection[];
  clinicalTrials: ClinicalTrial[];
  publications: ResearchPaper[];
  fdaApprovals: RegulatoryApproval[];
  dataSourceStatus: DataSourceStatus;
  dataMode: DataMode;
  searchLatencyMs?: number;
}

const ctGovProvider = new ClinicalTrialsGovProvider();
const cureCancerProvider = new CureCancerAIProvider();

export async function aggregateResearchLandscape(query: SearchQuery): Promise<LandscapeResponse> {
  const startTime = Date.now();
  const cancerType = query.cancerType?.trim() || 'Colorectal Cancer';
  const biomarkers = query.biomarkers || [];
  const location = query.location?.trim() || '';
  const biomarkerTerm = biomarkers.join(' ');

  const referenceCohort = getNormalizedCohort(cancerType);
  const hasCureCancerKey = !!process.env.CURE_CANCER_AI_API_KEY;

  // 1. Fetch from live sources in parallel
  const ctGovPromise = ctGovProvider.searchStudies(cancerType, biomarkerTerm, location);
  const cureResearchPromise = hasCureCancerKey
    ? cureCancerProvider.searchResearch(cancerType, biomarkerTerm)
    : Promise.resolve(null);
  const cureApprovalsPromise = hasCureCancerKey
    ? cureCancerProvider.searchApprovals(cancerType, biomarkers)
    : Promise.resolve(null);

  const [ctGovRes, cureResearchRes, cureApprovalsRes] = await Promise.allSettled([
    ctGovPromise,
    cureResearchPromise,
    cureApprovalsPromise,
  ]);

  // --- Domain 1: Clinical Trials (ClinicalTrials.gov) ---
  let clinicalTrials: ClinicalTrial[] = [];
  let isCtGovConnected = false;
  let isCtGovFallback = false;
  let ctGovMessage = '';

  if (ctGovRes.status === 'fulfilled' && ctGovRes.value) {
    const result = ctGovRes.value;
    if (result.success) {
      isCtGovConnected = true;
      isCtGovFallback = false;
      clinicalTrials = result.data;
      ctGovMessage = result.message;

      // If location filter returned 0 results, check for global trials
      if (clinicalTrials.length === 0 && location) {
        try {
          const globalCheck = await ctGovProvider.searchStudies(cancerType, biomarkerTerm);
          if (globalCheck.success && globalCheck.data.length > 0) {
            clinicalTrials = globalCheck.data;
            ctGovMessage = `0 trials registered directly in ${location}. Displaying ${globalCheck.data.length} global multi-center trials for ${cancerType}${biomarkerTerm ? ` (${biomarkerTerm})` : ''}.`;
          }
        } catch {
          // Keep original count
        }
      }
    } else {
      isCtGovConnected = false;
      isCtGovFallback = true;
      ctGovMessage = result.message || 'ClinicalTrials.gov temporarily unavailable.';
    }
  } else {
    isCtGovConnected = false;
    isCtGovFallback = true;
    ctGovMessage = 'ClinicalTrials.gov temporarily unavailable (Network timeout).';
  }

  // Fallback if ClinicalTrials.gov failed
  if (isCtGovFallback && referenceCohort) {
    clinicalTrials = referenceCohort.trials.map(t => ({
      ...t,
      isDemo: true,
      isFallback: true,
    }));
    ctGovMessage = 'ClinicalTrials.gov temporarily unavailable. Displaying DEMO FALLBACK reference records.';
  }

  // --- Domain 2: Research Publications (Cure Cancer With AI) ---
  let publications: ResearchPaper[] = [];
  let isResearchLive = false;
  let isResearchFallback = false;
  let isCureCancerRateLimited = false;
  let researchMessage = '';

  if (cureResearchRes.status === 'fulfilled' && cureResearchRes.value) {
    const res = cureResearchRes.value;
    if (res.success && res.data.length > 0) {
      isResearchLive = true;
      isResearchFallback = false;
      publications = res.data;
      researchMessage = res.message;
    } else {
      isResearchLive = false;
      isResearchFallback = true;
      isCureCancerRateLimited = res.rateLimited;
      researchMessage = res.message;
    }
  } else {
    isResearchLive = false;
    isResearchFallback = true;
    researchMessage = hasCureCancerKey
      ? 'Cure Cancer With AI research service unreachable.'
      : 'Cure Cancer With AI API key not configured. Using reference research index.';
  }

  // Fallback to reference cohort publications only if live call did not succeed
  if (!isResearchLive && referenceCohort) {
    publications = referenceCohort.publications.map(p => ({
      ...p,
      isDemo: true,
      isFallback: hasCureCancerKey,
    }));
  }

  // --- Domain 3: Regulatory Approvals (Cure Cancer With AI) ---
  let fdaApprovals: RegulatoryApproval[] = [];
  let isRegulatoryLive = false;
  let isRegulatoryFallback = false;
  let regulatoryMessage = '';

  if (cureApprovalsRes.status === 'fulfilled' && cureApprovalsRes.value) {
    const res = cureApprovalsRes.value;
    if (res.success && res.data.length > 0) {
      isRegulatoryLive = true;
      isRegulatoryFallback = false;
      fdaApprovals = res.data;
      regulatoryMessage = res.message;
    } else {
      isRegulatoryLive = false;
      isRegulatoryFallback = true;
      if (res.rateLimited) isCureCancerRateLimited = true;
      regulatoryMessage = res.message;
    }
  } else {
    isRegulatoryLive = false;
    isRegulatoryFallback = true;
    regulatoryMessage = hasCureCancerKey
      ? 'Cure Cancer With AI regulatory service unreachable.'
      : 'Cure Cancer With AI API key not configured. Using reference regulatory index.';
  }

  // Fallback to reference cohort approvals only if live call did not succeed
  if (!isRegulatoryLive && referenceCohort) {
    fdaApprovals = referenceCohort.approvals.map(a => ({
      ...a,
      isDemo: true,
      isFallback: hasCureCancerKey,
    }));
  }

  // --- Research Directions Synthesis & Clustering ---
  let researchDirections: ResearchDirection[] = [];
  let geminiGroundingActive = false;
  let geminiMessage = '';

  if (process.env.GEMINI_API_KEY && (isCtGovConnected || isResearchLive || isRegulatoryLive)) {
    try {
      const geminiRes = await synthesizeResearchDirections({
        cancerType,
        biomarkers,
        stage: query.stage || 'Not specified',
        trials: clinicalTrials,
        publications,
        approvals: fdaApprovals,
      });

      if (geminiRes.isGroundedByGemini && geminiRes.directions.length > 0) {
        researchDirections = geminiRes.directions;
        geminiGroundingActive = true;
        geminiMessage = geminiRes.message;
      }
    } catch (err: any) {
      console.warn('Gemini research direction synthesis skipped:', err.message);
    }
  }

  // If no Gemini synthesis or fallback, map live trials to base directions
  if (researchDirections.length === 0 && referenceCohort) {
    researchDirections = referenceCohort.directions.map(dir => {
      // Find matching live trials
      const matchingLiveTrials = clinicalTrials.filter(trial => {
        const titleLower = trial.title.toLowerCase();
        const intvLower = trial.interventions.map(i => i.name.toLowerCase()).join(' ');

        return (
          dir.keywords.some(k => titleLower.includes(k.toLowerCase()) || intvLower.includes(k.toLowerCase())) ||
          dir.biomarkers.some(bm => titleLower.includes(bm.toLowerCase()) || intvLower.includes(bm.toLowerCase()))
        );
      });

      const matchingLivePapers = publications.filter(paper => {
        const titleLower = paper.title.toLowerCase();
        return (
          dir.keywords.some(k => titleLower.includes(k.toLowerCase())) ||
          dir.biomarkers.some(bm => titleLower.includes(bm.toLowerCase()))
        );
      });

      const trialCount = isCtGovConnected ? matchingLiveTrials.length : dir.trialCount;
      const recruitingCount = isCtGovConnected
        ? matchingLiveTrials.filter(t => t.status === 'Recruiting').length
        : dir.recruitingTrialCount;
      const pubCount = isResearchLive ? matchingLivePapers.length : dir.publicationCount;

      const momentumRes = calculateResearchMomentum({
        trialCount,
        recruitingTrialCount: recruitingCount,
        publicationCount: pubCount,
        highestTrialPhase: dir.highestTrialPhase,
        maturity: dir.maturity,
      });

      const xScore = calculateMaturityScore(dir.maturity);
      const yScore = calculateResearchActivity({
        trialCount,
        recruitingTrialCount: recruitingCount,
        publicationCount: pubCount,
      });
      const bubbleSize = calculateBubbleSize({
        trialCount,
        publicationCount: pubCount,
      });

      return {
        ...dir,
        trialCount,
        recruitingTrialCount: recruitingCount,
        publicationCount: pubCount,
        momentum: momentumRes.momentum,
        momentumExplanation: momentumRes.explanation,
        radarMetrics: {
          ...dir.radarMetrics,
          clinicalMaturityScore: xScore,
          researchActivityScore: yScore,
          bubbleSizeScore: bubbleSize,
        },
      };
    });
  }

  // Map any unclassified live records
  const unmappedLiveTrials = clinicalTrials.filter(trial => {
    const isMapped = researchDirections.some(d =>
      d.sourceIds?.includes(trial.nctId) ||
      d.keywords?.some(k => trial.title.toLowerCase().includes(k.toLowerCase()))
    );
    return !isMapped;
  });

  if (unmappedLiveTrials.length > 0 && researchDirections.length > 0 && isCtGovConnected) {
    const unclassifiedRecruiting = unmappedLiveTrials.filter(t => t.status === 'Recruiting').length;
    const momentumRes = calculateResearchMomentum({
      trialCount: unmappedLiveTrials.length,
      recruitingTrialCount: unclassifiedRecruiting,
      publicationCount: 0,
      highestTrialPhase: 'Phase 1 / Phase 2',
      maturity: 'EMERGING SIGNAL',
    });

    const xScore = calculateMaturityScore('EMERGING SIGNAL');
    const yScore = calculateResearchActivity({
      trialCount: unmappedLiveTrials.length,
      recruitingTrialCount: unclassifiedRecruiting,
      publicationCount: 0,
    });
    const bubbleSize = calculateBubbleSize({
      trialCount: unmappedLiveTrials.length,
      publicationCount: 0,
    });

    researchDirections.push({
      id: 'unclassified-evidence',
      name: 'Unclassified Research Evidence',
      category: 'EARLY RESEARCH',
      description: `Active clinical protocols identified for ${cancerType} not yet categorized into a specific therapeutic consensus mechanism.`,
      whyResearchersInterested: 'Represents diverse novel investigation arms, exploratory biomarker baskets, and early-phase multi-agent combinations.',
      cancerTypes: [cancerType],
      biomarkers: biomarkers.length > 0 ? biomarkers : ['Exploratory'],
      maturity: 'EMERGING SIGNAL',
      momentum: momentumRes.momentum,
      momentumExplanation: momentumRes.explanation,
      highestTrialPhase: 'Phase 1 / Phase 2',
      trialCount: unmappedLiveTrials.length,
      recruitingTrialCount: unclassifiedRecruiting,
      publicationCount: 0,
      latestEvidenceDate: unmappedLiveTrials[0]?.lastUpdate || new Date().toISOString().split('T')[0],
      sourceIds: unmappedLiveTrials.map(t => t.nctId),
      radarMetrics: {
        clinicalMaturityScore: xScore,
        researchActivityScore: yScore,
        trialVolumeScore: Math.min(100, unmappedLiveTrials.length * 10),
        publicationActivityScore: 10,
        recencyScore: 80,
        regulatoryProgressScore: 10,
        bubbleSizeScore: bubbleSize,
      },
      keywords: ['unclassified', 'exploratory', 'novel'],
      isDemo: false,
    });
  }

  // Count active recruiting trials
  const activeRecruitingTrialsCount = clinicalTrials.filter(
    t => t.status === 'Recruiting' || t.status === 'Active, not recruiting'
  ).length;

  // Determine global DataMode strictly according to rule #4:
  // - ClinicalTrials.gov LIVE + Publications LIVE + Regulatory LIVE => LIVE DATA
  // - Any one source live while others fallback => PARTIAL LIVE DATA
  // - All fallback / demo => DEMO DATA
  const allThreeLive = isCtGovConnected && isResearchLive && isRegulatoryLive;
  const anyLive = isCtGovConnected || isResearchLive || isRegulatoryLive;

  let dataMode: DataMode = 'DEMO DATA';
  if (allThreeLive) {
    dataMode = 'LIVE DATA';
  } else if (anyLive) {
    dataMode = 'PARTIAL LIVE DATA';
  } else {
    dataMode = 'DEMO DATA';
  }

  const isCureCancerConnected = isResearchLive || isRegulatoryLive;

  const summary: LandscapeSummary = {
    activeRecruitingTrialsCount,
    recentPublicationsCount: publications.length,
    fdaApprovalsCount: fdaApprovals.length,
    emergingDirectionsCount: researchDirections.length,
    dataMode,
  };

  const dataSourceStatus: DataSourceStatus = {
    clinicalTrialsGov: {
      connected: isCtGovConnected,
      message: ctGovMessage || 'Connected to ClinicalTrials.gov v2 REST API (LIVE).',
      usingFallback: isCtGovFallback,
    },
    cureCancerAI: {
      connected: isCureCancerConnected,
      rateLimited: isCureCancerRateLimited,
      message: isCureCancerRateLimited
        ? 'Cure Cancer With AI request limit reached. Live publication or regulatory data may be temporarily unavailable.'
        : researchMessage || regulatoryMessage || (hasCureCancerKey ? 'Connected to Cure Cancer With AI (LIVE)' : 'Reference oncology cohort (DEMO)'),
      usingFallback: !allThreeLive,
    },
    geminiGrounding: {
      active: geminiGroundingActive,
      message: geminiMessage || 'Biomedical entity harmonization active.',
    },
  };

  return {
    query,
    summary,
    researchDirections,
    clinicalTrials,
    publications,
    fdaApprovals,
    dataSourceStatus,
    dataMode,
    searchLatencyMs: Date.now() - startTime,
  };
}
