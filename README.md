# Cancer Research Radar 🔬🛰️

> An open-source biomedical research exploration and clinical trial discovery platform for oncology.

[![Open Source](https://img.shields.io/badge/Open%20Source-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![ClinicalTrials.gov v2](https://img.shields.io/badge/ClinicalTrials.gov-LIVE%20v2%20REST-emerald.svg)](https://clinicaltrials.gov/)
[![Cure Cancer With AI](https://img.shields.io/badge/Cure%20Cancer%20AI-Integration%20Ready-indigo.svg)](https://www.curecancerwithai.com/)
[![React Vite TypeScript](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Node%20Express-slate.svg)]()

---

## 1. What is Cancer Research Radar?

**Cancer Research Radar** is a transparent, technically credible open-source Proof of Concept (POC) designed to synthesize, ground, and visualize emerging oncology research strategies, active clinical trials, and regulatory standards.

The application answers one fundamental question for oncology researchers, clinicians, and patients:
> *"For this cancer type and genomic biomarker profile, what novel therapeutic approaches are actively being investigated, what is their clinical maturity, and where are matching human clinical trials taking place?"*

---

## 2. Why It Was Created

Navigating translational oncology is fraught with information fragmentation:
- **Registry Silos**: Registry trial protocols (ClinicalTrials.gov) are difficult to aggregate and categorize by biological mechanism.
- **AI Hallucinations**: Standard LLMs frequently invent clinical trial IDs, hallucinate drug approval statuses, or conflate early preclinical signals with proven therapies.
- **Commercial vs. Experimental Confusion**: Patients and researchers struggle to distinguish commercial standards of care from exploratory Phase 1/2 clinical regimens.

Cancer Research Radar solves this by combining **real-time public registry APIs (ClinicalTrials.gov v2)**, **deterministic metric algorithms**, **server-side API proxies**, and **strict evidence grounding** where every metric links to an authentic NCT ID, PubMed PMID, or FDA record.

---

## 3. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React + Vite)                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │ Research Radar  │  │ Direction Cards  │  │ Trials Tab │  │
│  └─────────────────┘  └──────────────────┘  └────────────┘  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │ Evidence Trace  │  │ Regulatory Views │  │ Search/Geo │  │
│  └─────────────────┘  └──────────────────┘  └────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    Server (Node.js / Express)               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Research Aggregator Engine              │  │
│  └───────┬───────────────────┬───────────────────┬───────┘  │
│          │                   │                   │          │
│  ┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼───────┐  │
│  │ ClinicalTrials │  │  Cure Cancer   │  │    Gemini     │  │
│  │  Gov Provider  │  │  AI Provider   │  │ Grounding     │  │
│  │   (LIVE REST)  │  │  (Server API)  │  │  (Server API) │  │
│  └───────┬────────┘  └───────┬────────┘  └───────┬───────┘  │
└──────────┼───────────────────┼───────────────────┼──────────┘
           │                   │                   │
┌──────────▼────────┐  ┌───────▼────────┐  ┌───────▼───────┐
│ ClinicalTrials.gov│  │ Cure Cancer AI │  │ Google Gemini │
│  v2 REST API      │  │ Public Endpts  │  │ Grounding AI  │
└───────────────────┘  └────────────────┘  └───────────────┘
```

---

## 4. Data Sources & Live vs Demo Modes

| Source | Channel | Authentication | Status |
|---|---|---|---|
| **ClinicalTrials.gov** | Official v2 REST API (`https://clinicaltrials.gov/api/v2/studies`) | None (Public) | **LIVE** |
| **Cure Cancer With AI** | Server Proxy (`/api/v1/research`, `/api/v1/fda-approvals`) | `Bearer <KEY>` | Prepared |
| **Curated Reference DB** | High-fidelity oncology reference cohorts | None (Local fallback) | **FALLBACK** |

### Explicit Pipeline Modes:
- **`PARTIAL LIVE DATA`**: Real-time ClinicalTrials.gov query active; literature and regulatory milestones loaded from validated reference cohorts.
- **`LIVE DATA`**: All registries and external APIs connected live.
- **`DEMO DATA` / `DEMO FALLBACK`**: Offline reference datasets with explicit badge tagging.

---

## 5. How to Run Locally

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Setup
```bash
# 1. Clone the repository
git clone https://github.com/your-username/cancer-research-radar.git
cd cancer-research-radar

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for ClinicalTrials.gov live)
cp .env.example .env

# 4. Start development server (port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 6. How to Configure API Keys

All keys remain strictly server-side:

```env
# Optional: Google Gemini API key for dynamic entity harmonization
GEMINI_API_KEY=""

# Optional: Cure Cancer With AI API key for live literature and FDA streams
CURE_CANCER_AI_API_KEY=""
```

*Note: ClinicalTrials.gov runs live out of the box with zero keys required.*

---

## 7. Known Limitations

- **Location Filtering**: If a very specific local geography (e.g., Tunisia) has zero registered clinical sites for a rare biomarker, the system displays the local 0 count and surfaces global multi-center trials.
- **Historical Data**: ClinicalTrials.gov v2 queries return currently registered study protocols; historical or unregistered non-US trials may not appear.
- **Maturity Scoring**: Maturity scores are algorithmic representations of clinical trial phases and publication volume, not statistical predictions of clinical efficacy.

---

## 8. Safety & Non-Prescriptive Disclaimer

> **CRITICAL SCIENTIFIC NOTICE**:  
> Cancer Research Radar is strictly an exploratory biomedical informatics tool.  
> - It does **NOT** provide medical advice or treatment recommendations.  
> - It does **NOT** determine patient eligibility for clinical trials.  
> - Research maturity or high trial volume must **NEVER** be interpreted as treatment efficacy.  
> - Always consult a board-certified oncologist regarding treatment options and clinical trial participation.

---

## 9. Screenshots Placeholder

| Research Radar 2D Map | Clinical Trials Explorer (LIVE) |
|---|---|
| *(Screenshot Placeholder: 2D Maturity vs Activity Radar)* | *(Screenshot Placeholder: ClinicalTrials.gov live integration)* |

---

## 10. Future Roadmap

- [x] Phase 1: Real-time public ClinicalTrials.gov v2 REST API integration.
- [x] Phase 2: Evidence traceability and deterministic research direction mapping.
- [ ] Phase 3: Live Cure Cancer With AI API integration for peer-reviewed literature and FDA approvals.
- [ ] Phase 4: Geographic radius filtering and travel distance calculation for trial sites.
- [ ] Phase 5: Exportable clinical summary briefs for multidisciplinary tumor boards.

---

## 📄 License

MIT License — Copyright (c) 2026 Dr Riadh Chaker.
