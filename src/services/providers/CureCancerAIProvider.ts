import { ResearchPaper, RegulatoryApproval } from '../../types/research';
import {
  fetchCureCancerResearch,
  fetchCureCancerApprovals,
  CureCancerResult,
} from '../../server/cureCancerService';

export interface ICureCancerAIProvider {
  searchResearch(cancerType: string, search?: string): Promise<CureCancerResult<ResearchPaper[]>>;
  searchApprovals(cancerType: string, biomarkers?: string[]): Promise<CureCancerResult<RegulatoryApproval[]>>;
}

export class CureCancerAIProvider implements ICureCancerAIProvider {
  /**
   * Delegates securely to server-side cureCancerService which holds the API key in process.env.
   */
  async searchResearch(cancerType: string, search?: string): Promise<CureCancerResult<ResearchPaper[]>> {
    return fetchCureCancerResearch(cancerType, search);
  }

  async searchApprovals(cancerType: string, biomarkers?: string[]): Promise<CureCancerResult<RegulatoryApproval[]>> {
    return fetchCureCancerApprovals(cancerType, biomarkers);
  }
}
