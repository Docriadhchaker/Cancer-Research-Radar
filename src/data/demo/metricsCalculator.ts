import { ResearchDirection, ResearchMomentum, MaturityLevel } from '../../types/research';

export function calculateResearchMomentum(dir: Partial<ResearchDirection>): {
  momentum: ResearchMomentum;
  explanation: string;
} {
  const trialCount = dir.trialCount || 0;
  const recruitingTrialCount = dir.recruitingTrialCount || 0;
  const publicationCount = dir.publicationCount || 0;
  const recruitingRatio = trialCount > 0 ? recruitingTrialCount / trialCount : 0;
  const highestPhase = (dir.highestTrialPhase || '').toLowerCase();

  if (
    (recruitingRatio >= 0.6 && trialCount >= 6) ||
    (highestPhase.includes('phase 3') && recruitingRatio >= 0.4) ||
    (publicationCount >= 35 && recruitingRatio >= 0.5)
  ) {
    return {
      momentum: 'FAST RISING',
      explanation: `Fast-rising research velocity with ${recruitingTrialCount} active recruiting trials (${Math.round(recruitingRatio * 100)}% recruiting rate) and ${publicationCount} scientific publications.`,
    };
  }

  if (
    (recruitingRatio >= 0.4 && trialCount >= 4) ||
    publicationCount >= 20 ||
    highestPhase.includes('phase 2')
  ) {
    return {
      momentum: 'RISING',
      explanation: `Steady upward trajectory with ongoing clinical trial accrual (${recruitingTrialCount} recruiting) and sustained publication volume (${publicationCount} papers).`,
    };
  }

  if (dir.maturity === 'APPROVED' || highestPhase.includes('approved') || trialCount >= 3) {
    return {
      momentum: 'STABLE',
      explanation: `Established research activity with steady standard-of-care protocol maintenance and ${publicationCount} indexed reference citations.`,
    };
  }

  return {
    momentum: 'LOW ACTIVITY',
    explanation: `Early-stage or specialized research domain with limited concurrent protocol registrations (${trialCount} trials identified).`,
  };
}

export function calculateMaturityScore(maturity: MaturityLevel): number {
  switch (maturity) {
    case 'PRECLINICAL':
    case 'EMERGING SIGNAL':
      return 18;
    case 'EARLY CLINICAL':
      return 38;
    case 'MID CLINICAL':
      return 62;
    case 'LATE CLINICAL':
      return 82;
    case 'APPROVED':
      return 95;
    default:
      return 50;
  }
}

export function calculateResearchActivity(dir: Partial<ResearchDirection>): number {
  const trialCount = dir.trialCount || 0;
  const recruitingCount = dir.recruitingTrialCount || 0;
  const pubCount = dir.publicationCount || 0;

  // Normalized 15-95 score
  const trialScore = Math.min(45, trialCount * 2.2);
  const recruitingBonus = trialCount > 0 ? (recruitingCount / trialCount) * 20 : 0;
  const pubScore = Math.min(30, pubCount * 0.45);

  const total = Math.round(trialScore + recruitingBonus + pubScore + 8);
  return Math.min(95, Math.max(20, total));
}

export function calculateBubbleSize(dir: Partial<ResearchDirection>): number {
  const trialCount = dir.trialCount || 1;
  const pubCount = dir.publicationCount || 1;
  // Deterministic bubble radius (16px to 36px)
  const score = Math.round(Math.sqrt(trialCount * 4 + pubCount * 1.5) * 3.0);
  return Math.min(36, Math.max(16, score));
}
