import { ClinicalTrial, TrialLocation, TrialStatus } from '../../types/trials';

export const CT_GOV_API_BASE = 'https://clinicaltrials.gov/api/v2/studies';

export interface ClinicalTrialsResult {
  success: boolean;
  data: ClinicalTrial[];
  usingFallback: boolean;
  message: string;
  latencyMs?: number;
}

export interface IClinicalTrialsGovProvider {
  searchStudies(
    cancerType: string,
    biomarkerOrTerm?: string,
    locationFilter?: string
  ): Promise<ClinicalTrialsResult>;
}

export class ClinicalTrialsGovProvider implements IClinicalTrialsGovProvider {
  readonly baseUrl = CT_GOV_API_BASE;

  /**
   * Search ClinicalTrials.gov v2 REST API live.
   * Maps:
   *  cancerType -> query.cond
   *  biomarkerOrTerm -> query.term
   *  locationFilter -> query.locn
   */
  async searchStudies(
    cancerType: string,
    biomarkerOrTerm?: string,
    locationFilter?: string
  ): Promise<ClinicalTrialsResult> {
    const startTime = Date.now();

    try {
      const condition = cancerType.trim() || 'Oncology';
      const params = new URLSearchParams({
        'query.cond': condition,
        pageSize: '20',
        format: 'json',
        sort: 'LastUpdatePostDate:desc',
      });

      if (biomarkerOrTerm && biomarkerOrTerm.trim().length > 0) {
        params.append('query.term', biomarkerOrTerm.trim());
      }

      if (locationFilter && locationFilter.trim().length > 0) {
        params.append('query.locn', locationFilter.trim());
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);

      const requestUrl = `${this.baseUrl}?${params.toString()}`;
      const response = await fetch(requestUrl, {
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          data: [],
          usingFallback: true,
          message: `ClinicalTrials.gov API returned status: ${response.status} ${response.statusText}`,
          latencyMs,
        };
      }

      const json = await response.json();
      const rawStudies = json.studies || [];

      // If location filter was specified and returned 0, we can also check if global studies exist to provide context
      if (rawStudies.length === 0) {
        return {
          success: true,
          data: [],
          usingFallback: false,
          message: `Zero studies currently registered on ClinicalTrials.gov matching ${condition} ${biomarkerOrTerm ? `[${biomarkerOrTerm}]` : ''} ${locationFilter ? `in ${locationFilter}` : ''}.`,
          latencyMs,
        };
      }

      const normalizedTrials: ClinicalTrial[] = rawStudies.map((studyWrapper: any) => {
        const ps = studyWrapper.protocolSection || {};
        const idModule = ps.identificationModule || {};
        const statusModule = ps.statusModule || {};
        const sponsorModule = ps.sponsorCollaboratorsModule || {};
        const designModule = ps.designModule || {};
        const armsInterventions = ps.armsInterventionsModule || {};
        const eligibilityModule = ps.eligibilityModule || {};
        const locationsModule = ps.contactsLocationsModule || {};
        const conditionsModule = ps.conditionsModule || {};

        const nctId = idModule.nctId || 'Not reported';
        const officialTitle = idModule.officialTitle;
        const briefTitle = idModule.briefTitle;
        const title = officialTitle || briefTitle || 'Clinical Study (Title Not Reported)';
        const conditions = conditionsModule.conditions && conditionsModule.conditions.length > 0
          ? conditionsModule.conditions
          : [condition];

        // Normalizing Recruitment Status
        const rawStatus = (statusModule.overallStatus || 'UNKNOWN').toUpperCase();
        let status: TrialStatus = 'Unknown';
        if (rawStatus.includes('RECRUITING') && !rawStatus.includes('NOT')) {
          status = 'Recruiting';
        } else if (rawStatus.includes('ACTIVE') || rawStatus.includes('NOT_RECRUITING')) {
          status = 'Active, not recruiting';
        } else if (rawStatus.includes('NOT_YET')) {
          status = 'Not yet recruiting';
        } else if (rawStatus.includes('COMPLETED')) {
          status = 'Completed';
        } else if (rawStatus.includes('TERMINATED')) {
          status = 'Terminated';
        } else if (rawStatus.includes('WITHDRAWN')) {
          status = 'Withdrawn';
        }

        // Interventions
        const interventions = (armsInterventions.interventions || []).map((intv: any) => ({
          type: intv.type || 'Drug/Biologic',
          name: intv.name || 'Investigational Intervention',
          description: intv.description || undefined,
        }));

        // Phases
        const rawPhases = designModule.phases || [];
        const phase = rawPhases.length > 0
          ? rawPhases.map((p: string) => p.replace(/PHASE/gi, 'Phase ')).join(' / ')
          : (designModule.designInfo?.allocation ? 'Phase Not Reported' : 'Not reported');

        // Lead Sponsor
        const sponsor = sponsorModule.leadSponsor?.name || 'Not reported';
        const studyType = designModule.studyType || 'Interventional';

        // Eligibility
        const rawCriteria = eligibilityModule.eligibilityCriteria || 'Not reported. Refer to ClinicalTrials.gov record.';
        const criteriaSnippet = rawCriteria.length > 320
          ? rawCriteria.slice(0, 320).trim() + '...'
          : rawCriteria;

        const eligibility = {
          summary: criteriaSnippet,
          gender: eligibilityModule.sex || 'All',
          minimumAge: eligibilityModule.minimumAge || 'Not reported',
          maximumAge: eligibilityModule.maximumAge || 'Not reported',
          healthyVolunteers: eligibilityModule.healthyVolunteers === true,
          criteriaSnippet,
        };

        // Locations
        const rawLocations = locationsModule.locations || [];
        const locations: TrialLocation[] = rawLocations.slice(0, 15).map((loc: any) => ({
          country: loc.country || 'Not reported',
          city: loc.city || 'Not reported',
          facility: loc.facility || 'Clinical Research Facility',
        }));

        const lastUpdate = statusModule.lastUpdatePostDateStruct?.date ||
          statusModule.lastUpdateSubmitDate ||
          'Not reported';

        const startDate = statusModule.startDateStruct?.date || 'Not reported';
        const completionDate = statusModule.completionDateStruct?.date || 'Not reported';

        return {
          nctId,
          title,
          briefTitle: briefTitle || 'Not reported',
          conditions,
          interventions: interventions.length > 0 ? interventions : [{ type: 'Investigational', name: 'Clinical Regimen' }],
          phase,
          status,
          sponsor,
          studyType,
          eligibility,
          locations: locations.length > 0 ? locations : [{ country: 'Not reported', city: 'Not reported', facility: 'See ClinicalTrials.gov' }],
          lastUpdate,
          startDate,
          completionDate,
          sourceUrl: nctId !== 'Not reported' ? `https://clinicaltrials.gov/study/${nctId}` : 'https://clinicaltrials.gov',
          isDemo: false,
          isFallback: false,
        };
      });

      return {
        success: true,
        data: normalizedTrials,
        usingFallback: false,
        message: `Retrieved ${normalizedTrials.length} clinical studies live from ClinicalTrials.gov v2 REST API.`,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      return {
        success: false,
        data: [],
        usingFallback: true,
        message: `ClinicalTrials.gov temporarily unavailable: ${err.message || 'Connection error'}`,
        latencyMs,
      };
    }
  }
}
