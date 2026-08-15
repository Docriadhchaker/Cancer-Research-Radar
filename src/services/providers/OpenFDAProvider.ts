import { RegulatoryApproval } from '../../types/research';

export interface IOpenFDAProvider {
  searchOncologyApprovals(substanceName: string): Promise<RegulatoryApproval[]>;
}

export class OpenFDAProvider implements IOpenFDAProvider {
  readonly baseUrl = 'https://api.fda.gov/drug/label.json';

  async searchOncologyApprovals(substanceName: string): Promise<RegulatoryApproval[]> {
    // Adapter prepared for openFDA drug label and approval APIs
    return [];
  }
}
