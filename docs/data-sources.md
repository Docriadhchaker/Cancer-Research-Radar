# Data Sources and Integration Specifications

## 1. ClinicalTrials.gov (v2 REST API)

- **Official Base URL**: `https://clinicaltrials.gov/api/v2/studies`
- **Authentication**: None required (Public registry maintained by US National Library of Medicine).
- **Search Parameter Mappings**:
  - Cancer Condition: `query.cond=<cancerType>`
  - Biomarker / Keyword: `query.term=<biomarker>`
  - Geographic Location: `query.locn=<location>`
  - Pagination / Format: `pageSize=20&format=json&sort=LastUpdatePostDate:desc`

### Normalized Data Fields
| Domain Field | ClinicalTrials.gov Protocol Section Path | Fallback Value |
|---|---|---|
| `nctId` | `protocolSection.identificationModule.nctId` | `Not reported` |
| `title` | `officialTitle` \|\| `briefTitle` | `Clinical Study (Title Not Reported)` |
| `briefTitle` | `protocolSection.identificationModule.briefTitle` | `Not reported` |
| `conditions` | `protocolSection.conditionsModule.conditions` | `[condition]` |
| `interventions`| `protocolSection.armsInterventionsModule.interventions` | `Investigational Intervention` |
| `phase` | `protocolSection.designModule.phases` | `Phase Not Reported` |
| `status` | `protocolSection.statusModule.overallStatus` | `Unknown` |
| `sponsor` | `protocolSection.sponsorCollaboratorsModule.leadSponsor.name` | `Not reported` |
| `studyType` | `protocolSection.designModule.studyType` | `Interventional` |
| `locations` | `protocolSection.contactsLocationsModule.locations` | `Not reported` |
| `startDate` | `protocolSection.statusModule.startDateStruct.date` | `Not reported` |
| `lastUpdate` | `protocolSection.statusModule.lastUpdatePostDateStruct.date` | `Not reported` |
| `sourceUrl` | `https://clinicaltrials.gov/study/${nctId}` | `https://clinicaltrials.gov` |

---

## 2. Cure Cancer With AI API (Prepared Integration)

- **Base URL**: `https://www.curecancerwithai.com`
- **Authentication**: `Authorization: Bearer <CURE_CANCER_AI_API_KEY>` (Server-side only)
- **Endpoints**:
  - `/api/v1/research?cancerType={type}&limit=20&search={biomarker}`
  - `/api/v1/fda-approvals?cancerType={type}`
- **Fallback Behavior**:
  - In absence of `CURE_CANCER_AI_API_KEY`, the application loads curated oncology reference cohorts (mCRC KRAS G12C, PDAC KRAS G12D, TNBC Trop-2, EGFR NSCLC) tagged with `DEMO REFERENCE`.

---

## 3. Google Gemini (Server-Side Synthesis & Grounding)

- **Role**: Biomedical entity harmonization, synthesis of exploratory mechanisms, structured radar metric weighting.
- **Security**: Strictly initialized server-side with `process.env.GEMINI_API_KEY`.
- **Constraint**: Deterministic schema parsing with fallback metrics calculator.
