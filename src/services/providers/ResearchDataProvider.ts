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

export interface LandscapeResponse {
  query: SearchQuery;
  summary: LandscapeSummary;
  researchDirections: ResearchDirection[];
  clinicalTrials: ClinicalTrial[];
  publications: ResearchPaper[];
  fdaApprovals: RegulatoryApproval[];
  dataSourceStatus: DataSourceStatus;
  dataMode: DataMode;
}

export interface ResearchDataProvider {
  readonly name: string;
  readonly mode: DataMode;
  readonly isConnected: boolean;

  searchTrials(
    cancerType: string,
    biomarkers?: string[],
    location?: string
  ): Promise<{ data: ClinicalTrial[]; success: boolean; message: string }>;

  searchPublications(
    cancerType: string,
    query?: string
  ): Promise<{ data: ResearchPaper[]; success: boolean; message: string }>;

  searchRegulatoryApprovals(
    cancerType: string
  ): Promise<{ data: RegulatoryApproval[]; success: boolean; message: string }>;

  getLandscape(query: SearchQuery): Promise<LandscapeResponse>;
}
