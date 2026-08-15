import { ONCOLOGY_DATABASE, OncologyCohort } from '../oncologyDatabase';
import { ResearchDirection } from '../../types/research';
import {
  calculateResearchMomentum,
  calculateMaturityScore,
  calculateResearchActivity,
  calculateBubbleSize,
} from './metricsCalculator';

export function normalizeDirection(raw: ResearchDirection): ResearchDirection {
  const momentumCalc = calculateResearchMomentum(raw);
  const clinicalMaturityScore = calculateMaturityScore(raw.maturity);
  const researchActivityScore = calculateResearchActivity(raw);
  const bubbleSizeScore = calculateBubbleSize(raw);

  // Regulatory Status text
  let regulatoryStatus = 'No formal FDA approval identified for this specific investigational indication';
  if (raw.maturity === 'APPROVED') {
    regulatoryStatus = 'FDA Approved standard-of-care indication identified';
  } else if (raw.timeline.some(t => t.type === 'approval')) {
    const appEvent = raw.timeline.find(t => t.type === 'approval');
    regulatoryStatus = `Accelerated approval or breakthrough designation milestone noted (${appEvent?.label || 'FDA Record'})`;
  }

  return {
    ...raw,
    momentum: raw.momentum || momentumCalc.momentum,
    momentumExplanation: raw.momentumExplanation || momentumCalc.explanation,
    regulatoryStatus: raw.regulatoryStatus || regulatoryStatus,
    isDemo: true,
    radarMetrics: {
      clinicalMaturityScore: raw.radarMetrics?.clinicalMaturityScore || clinicalMaturityScore,
      researchActivityScore: raw.radarMetrics?.researchActivityScore || researchActivityScore,
      trialVolumeScore: raw.radarMetrics?.trialVolumeScore || Math.min(95, (raw.trialCount || 1) * 6),
      publicationActivityScore: raw.radarMetrics?.publicationActivityScore || Math.min(95, (raw.publicationCount || 1) * 2),
      recencyScore: raw.radarMetrics?.recencyScore || 90,
      regulatoryProgressScore: raw.radarMetrics?.regulatoryProgressScore || (raw.maturity === 'APPROVED' ? 98 : 35),
      bubbleSizeScore: bubbleSizeScore,
    },
    timeline: (raw.timeline || []).map(t => ({
      ...t,
      isDemo: true,
    })),
  };
}

export function getNormalizedCohort(cancerType: string): OncologyCohort | null {
  const queryLower = cancerType.toLowerCase().trim();

  for (const [key, cohort] of Object.entries(ONCOLOGY_DATABASE)) {
    if (
      key.includes(queryLower) ||
      queryLower.includes(key) ||
      cohort.cancerType.toLowerCase().includes(queryLower) ||
      queryLower.includes(cohort.cancerType.toLowerCase())
    ) {
      return {
        ...cohort,
        directions: cohort.directions.map(normalizeDirection),
        trials: cohort.trials.map(t => ({ ...t, isDemo: true })),
        publications: cohort.publications.map(p => ({ ...p, isDemo: true })),
        approvals: cohort.approvals.map(a => ({ ...a, isDemo: true })),
      };
    }
  }

  // Fallback to Colorectal if not found
  const fallback = ONCOLOGY_DATABASE['colorectal cancer'];
  if (!fallback) return null;
  return {
    ...fallback,
    directions: fallback.directions.map(normalizeDirection),
    trials: fallback.trials.map(t => ({ ...t, isDemo: true })),
    publications: fallback.publications.map(p => ({ ...p, isDemo: true })),
    approvals: fallback.approvals.map(a => ({ ...a, isDemo: true })),
  };
}

export function getAllDemoCohorts(): Record<string, OncologyCohort> {
  const normalized: Record<string, OncologyCohort> = {};
  for (const [key, cohort] of Object.entries(ONCOLOGY_DATABASE)) {
    normalized[key] = {
      ...cohort,
      directions: cohort.directions.map(normalizeDirection),
      trials: cohort.trials.map(t => ({ ...t, isDemo: true })),
      publications: cohort.publications.map(p => ({ ...p, isDemo: true })),
      approvals: cohort.approvals.map(a => ({ ...a, isDemo: true })),
    };
  }
  return normalized;
}
