import { ClinicalTrialsGovProvider, ClinicalTrialsResult } from '../services/providers/ClinicalTrialsGovProvider';
import { ClinicalTrial } from '../types/trials';

const provider = new ClinicalTrialsGovProvider();

export type { ClinicalTrialsResult };

export async function searchClinicalTrialsGov(
  condition: string,
  extraTerm?: string,
  locationFilter?: string
): Promise<ClinicalTrialsResult> {
  return provider.searchStudies(condition, extraTerm, locationFilter);
}
