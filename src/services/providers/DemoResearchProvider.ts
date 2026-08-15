import {
  ResearchDataProvider,
  LandscapeResponse,
} from './ResearchDataProvider';
import {
  SearchQuery,
  ResearchDirection,
  ResearchPaper,
  RegulatoryApproval,
  DataSourceStatus,
  LandscapeSummary,
  DataMode,
} from '../../types/research';
import { ClinicalTrial } from '../../types/trials';
import { getNormalizedCohort } from '../../data/demo/normalizedCohorts';

export class DemoResearchProvider implements ResearchDataProvider {
  readonly name = 'Demonstration Reference Provider';
  readonly mode: DataMode = 'DEMO DATA';
  readonly isConnected = false;

  async searchTrials(
    cancerType: string,
    biomarkers: string[] = [],
    location: string = ''
  ): Promise<{ data: ClinicalTrial[]; success: boolean; message: string }> {
    const cohort = getNormalizedCohort(cancerType);
    if (!cohort) {
      return {
        data: [],
        success: false,
        message: 'No demo trials found for the specified malignancy.',
      };
    }

    let trials = cohort.trials;
    if (biomarkers.length > 0) {
      trials = trials.filter(t =>
        biomarkers.some(bm =>
          t.title.toLowerCase().includes(bm.toLowerCase()) ||
          t.interventions.some(i => i.name.toLowerCase().includes(bm.toLowerCase()))
        )
      );
      if (trials.length === 0) trials = cohort.trials;
    }

    return {
      data: trials,
      success: true,
      message: 'Loaded verified oncology demonstration trial records.',
    };
  }

  async searchPublications(
    cancerType: string,
    query?: string
  ): Promise<{ data: ResearchPaper[]; success: boolean; message: string }> {
    const cohort = getNormalizedCohort(cancerType);
    if (!cohort) {
      return {
        data: [],
        success: false,
        message: 'No demo publications found.',
      };
    }
    return {
      data: cohort.publications,
      success: true,
      message: 'Loaded verified oncology demonstration publications.',
    };
  }

  async searchRegulatoryApprovals(
    cancerType: string
  ): Promise<{ data: RegulatoryApproval[]; success: boolean; message: string }> {
    const cohort = getNormalizedCohort(cancerType);
    if (!cohort) {
      return {
        data: [],
        success: false,
        message: 'No demo approvals found.',
      };
    }
    return {
      data: cohort.approvals,
      success: true,
      message: 'Loaded verified oncology demonstration FDA approval records.',
    };
  }

  async getLandscape(query: SearchQuery): Promise<LandscapeResponse> {
    const cancerType = query.cancerType?.trim() || 'Colorectal Cancer';
    const cohort = getNormalizedCohort(cancerType);

    if (!cohort) {
      throw new Error(`No demonstration oncology cohort available for ${cancerType}`);
    }

    let trials = [...cohort.trials];
    const location = query.location?.trim() || '';

    // If location provided, adjust distances in demo trials
    if (location.length > 0) {
      const locLower = location.toLowerCase();
      trials = trials.map(trial => {
        const hasLocal = trial.locations.some(
          l =>
            l.country.toLowerCase().includes(locLower) ||
            l.city.toLowerCase().includes(locLower) ||
            locLower.includes(l.country.toLowerCase())
        );
        if (hasLocal) {
          return {
            ...trial,
            locations: [
              ...trial.locations.filter(
                l =>
                  l.country.toLowerCase().includes(locLower) ||
                  l.city.toLowerCase().includes(locLower)
              ),
              ...trial.locations.filter(
                l =>
                  !l.country.toLowerCase().includes(locLower) &&
                  !l.city.toLowerCase().includes(locLower)
              ),
            ],
          };
        }
        return trial;
      });
    }

    const activeRecruiting = trials.filter(
      t => t.status === 'Recruiting' || t.status === 'Active, not recruiting'
    ).length;

    const summary: LandscapeSummary = {
      activeRecruitingTrialsCount: activeRecruiting,
      recentPublicationsCount: cohort.publications.length,
      fdaApprovalsCount: cohort.approvals.length,
      emergingDirectionsCount: cohort.directions.length,
      dataMode: 'DEMO DATA',
    };

    const dataSourceStatus: DataSourceStatus = {
      cureCancerAI: {
        connected: false,
        rateLimited: false,
        message: 'Not connected (Demo Mode active). External API key not configured.',
        usingFallback: true,
      },
      clinicalTrialsGov: {
        connected: false,
        message: 'Displaying curated ClinicalTrials.gov demonstration records.',
        usingFallback: true,
      },
      geminiGrounding: {
        active: false,
        message: 'Structured via deterministic oncology research categorization ontology.',
      },
    };

    return {
      query,
      summary,
      researchDirections: cohort.directions,
      clinicalTrials: trials,
      publications: cohort.publications,
      fdaApprovals: cohort.approvals,
      dataSourceStatus,
      dataMode: 'DEMO DATA',
    };
  }
}
