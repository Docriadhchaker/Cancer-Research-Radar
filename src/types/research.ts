import { ClinicalTrial } from './trials';

export type MaturityLevel =
  | 'APPROVED'
  | 'LATE CLINICAL'
  | 'MID CLINICAL'
  | 'EARLY CLINICAL'
  | 'PRECLINICAL'
  | 'EMERGING SIGNAL';

export type ResearchMomentum = 'FAST RISING' | 'RISING' | 'STABLE' | 'LOW ACTIVITY';

export type DataMode = 'DEMO DATA' | 'LIVE DATA' | 'PARTIAL LIVE DATA';

export type CancerStage =
  | 'Not specified'
  | 'Localized'
  | 'Locally advanced'
  | 'Metastatic';

export interface RadarMetrics {
  clinicalMaturityScore: number; // 0-100 (maps to X axis)
  researchActivityScore?: number; // 0-100 (maps to Y axis: combination of trials, papers, and recency)
  trialVolumeScore: number; // 0-100
  publicationActivityScore: number; // 0-100
  recencyScore: number; // 0-100
  regulatoryProgressScore: number; // 0-100
  bubbleSizeScore?: number; // Calculated deterministically
}

export interface TimelineMilestone {
  year: number | string;
  label: string;
  type: 'approval' | 'phase3' | 'phase2' | 'phase1' | 'publication' | 'milestone';
  description: string;
  sourceId?: string;
  sourceUrl?: string;
  isDemo?: boolean;
}

export interface ResearchDirection {
  id: string;
  name: string;
  category: 'STANDARD / REGULATORY' | 'CLINICAL RESEARCH' | 'EARLY RESEARCH';
  description: string;
  whyResearchersInterested: string;
  cancerTypes: string[];
  biomarkers: string[];
  maturity: MaturityLevel;
  momentum?: ResearchMomentum;
  momentumExplanation?: string;
  highestTrialPhase: string;
  trialCount: number;
  recruitingTrialCount: number;
  publicationCount: number;
  publicationsLast12m?: number;
  latestEvidenceDate: string;
  mostRecentPublicationDate?: string;
  mostRecentTrialUpdate?: string;
  regulatoryStatus?: string;
  sourceIds: string[];
  radarMetrics: RadarMetrics;
  timeline?: TimelineMilestone[];
  keywords: string[];
  isDemo?: boolean;
}

export interface ResearchPaper {
  id: string;
  pubmedId?: string;
  doi?: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  abstract: string;
  plainLanguageSummary?: string;
  sourceUrl: string;
  treatmentType?: string;
  cancerType?: string;
  tags: {
    cancerType?: string[];
    treatmentType?: string[];
    biomarkers?: string[];
  };
  isDemo?: boolean;
  isFallback?: boolean;
}

export interface RegulatoryApproval {
  id: string;
  drug: string;
  genericName: string;
  indication: string;
  company: string;
  approvalDate: string;
  sourceUrl: string;
  biomarkers?: string[];
  relevanceCategory?: 'Relevant Approval' | 'Related Regulatory Evidence';
  isDemo?: boolean;
  isFallback?: boolean;
}

export interface SearchQuery {
  cancerType: string;
  cancerSubtype?: string;
  stage: CancerStage;
  biomarkers: string[];
  location?: string;
  radius?: number;
}

export interface DataSourceStatus {
  cureCancerAI: {
    connected: boolean;
    rateLimited: boolean;
    message: string;
    usingFallback: boolean;
  };
  clinicalTrialsGov: {
    connected: boolean;
    message: string;
    usingFallback: boolean;
  };
  geminiGrounding: {
    active: boolean;
    message: string;
  };
}

export interface LandscapeSummary {
  activeRecruitingTrialsCount: number;
  recentPublicationsCount: number;
  fdaApprovalsCount: number;
  emergingDirectionsCount: number;
  dataMode: DataMode;
}
