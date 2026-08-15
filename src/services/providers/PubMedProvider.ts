import { ResearchPaper } from '../../types/research';

export interface IPubMedProvider {
  searchArticles(term: string, limit?: number): Promise<ResearchPaper[]>;
}

export class PubMedProvider implements IPubMedProvider {
  readonly baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

  async searchArticles(term: string, limit: number = 20): Promise<ResearchPaper[]> {
    // Adapter prepared for NCBI E-utilities / PubMed API
    return [];
  }
}
