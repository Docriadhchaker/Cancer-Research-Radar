export type TrialStatus =
  | 'Recruiting'
  | 'Active, not recruiting'
  | 'Not yet recruiting'
  | 'Completed'
  | 'Terminated'
  | 'Withdrawn'
  | 'Unknown';

export interface TrialLocation {
  country: string;
  city: string;
  facility: string;
  distanceKm?: number;
}

export interface TrialIntervention {
  type: string;
  name: string;
  description?: string;
}

export interface TrialEligibility {
  summary: string;
  gender?: string;
  minimumAge?: string;
  maximumAge?: string;
  healthyVolunteers?: boolean;
  criteriaSnippet?: string;
}

export interface ClinicalTrial {
  nctId: string;
  title: string;
  briefTitle?: string;
  conditions: string[];
  interventions: TrialIntervention[];
  phase: string;
  status: TrialStatus;
  sponsor: string;
  studyType?: string;
  eligibility: TrialEligibility;
  locations: TrialLocation[];
  lastUpdate: string;
  startDate?: string;
  completionDate?: string;
  sourceUrl: string;
  directionIds?: string[];
  isDemo?: boolean;
  isFallback?: boolean;
}

export interface TrialFilterOptions {
  recruitingOnly: boolean;
  phase: string;
  country: string;
  interventionType: string;
  lastUpdatedYear: string;
  sortBy: 'nearest' | 'newest' | 'highestPhase';
  searchKeyword?: string;
}
