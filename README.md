# Cancer Research Radar 🔬🛰️

> **Mapping emerging therapeutic strategies in oncology using live biomedical evidence.**

Cancer Research Radar is an open-source biomedical evidence exploration platform that aggregates **clinical trials**, **scientific publications**, and **regulatory evidence** into a unified, transparent, and traceable oncology research landscape.

Unlike traditional literature search engines, Cancer Research Radar organizes evidence into **emerging therapeutic strategies** rather than isolated publications, allowing clinicians, researchers, students, and innovators to rapidly understand where cancer research is heading.

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![ClinicalTrials.gov](https://img.shields.io/badge/ClinicalTrials.gov-LIVE-success.svg)](https://clinicaltrials.gov/)
[![Cure Cancer With AI](https://img.shields.io/badge/Cure_Cancer_With_AI-LIVE-success.svg)](https://www.curecancerwithai.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)]()
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933)]()
[![Status](https://img.shields.io/badge/Project-Research_POC-orange)]()

---

# Architecture

<p align="center">
  <img src="docs/screenshots/architecture.svg" alt="Cancer Research Radar Architecture" width="100%">
</p>

The platform follows a modular provider architecture that combines multiple biomedical evidence sources through a unified **Research Aggregator Engine**, ensuring full provenance, transparent source attribution, and graceful degradation whenever one provider becomes unavailable.

---

# What is Cancer Research Radar?

Cancer Research Radar is an **open-source Proof of Concept (POC)** demonstrating how heterogeneous biomedical evidence can be combined into a single research exploration interface.

Instead of simply listing publications or clinical trials, the platform synthesizes multiple evidence streams into **Research Directions**, making it easier to identify:

- emerging therapeutic strategies
- active clinical trials
- translational research
- regulatory approvals
- biomarker-driven treatments

The application answers one fundamental question:

> **For a given cancer type and molecular profile, which therapeutic strategies are currently emerging, how mature are they, and what evidence supports them?**

---

# Why was this project created?

Modern oncology research is highly fragmented.

Researchers must continuously navigate multiple disconnected sources:

- ClinicalTrials.gov
- scientific publications
- FDA approvals
- AI-generated summaries
- conference abstracts

This fragmentation creates several problems:

- Clinical trial registries are difficult to explore biologically.
- Publications are disconnected from ongoing clinical studies.
- AI systems frequently hallucinate trial identifiers or approval status.
- Patients and researchers struggle to distinguish investigational therapies from established standards of care.

Cancer Research Radar addresses these challenges by combining live biomedical data with deterministic evidence aggregation while preserving complete scientific traceability.

---

# Key Features

- Live ClinicalTrials.gov integration
- Live Cure Cancer With AI integration
- Interactive Oncology Strategy Radar
- Evidence Explorer with source provenance
- Biomarker-driven research discovery
- Clinical maturity visualization
- Geographic clinical trial discovery
- Deterministic Research Momentum Engine
- Transparent LIVE / DEMO / FALLBACK modes
- Server-side API key isolation
- Scientific source grounding (NCT, PMID, DOI, FDA)

---

# Scientific Principles

Cancer Research Radar follows five fundamental principles:

- **Evidence before AI**
- **Complete source traceability**
- **Deterministic data normalization**
- **Transparent distinction between LIVE and DEMO data**
- **No clinical recommendations**

Every visualization can always be traced back to an authentic biomedical source.

---

# Data Sources

| Source | Status | Purpose |
|---------|--------|----------|
| ClinicalTrials.gov v2 REST API | LIVE | Human clinical trial protocols |
| Cure Cancer With AI | LIVE | Publications & FDA approvals |
| Google Gemini | LIVE (optional) | Biomedical harmonization |
| Curated Reference Database | FALLBACK | Graceful degradation |

---

# Data Modes

The application explicitly distinguishes data provenance.

### LIVE DATA

All configured providers respond successfully.

### PARTIAL LIVE DATA

One or more providers are unavailable.

Only affected sources fall back to curated reference datasets.

### DEMO DATA

Offline demonstration mode using validated reference cohorts.

No source is ever silently replaced.

---

# Screenshots

## Dashboard

![Dashboard](docs/screenshots/02-dashboard-radar.png)

---

## Evidence Explorer

![Evidence Explorer](docs/screenshots/03-evidence-explorer.png)

---

## Clinical Trials

![Clinical Trials](docs/screenshots/04-clinical-trials-live.png)

---

## Latest Research

![Latest Research](docs/screenshots/05-latest-research.png)

---

## Regulatory Evidence

![Regulatory](docs/screenshots/06-regulatory.png)

---

# Running the Project

## Requirements

- Node.js 18+
- npm

## Installation

```bash
git clone https://github.com/Docriadhchaker/Cancer-Research-Radar.git

cd Cancer-Research-Radar

npm install

cp .env.example .env

npm run dev

## Visit:
http://localhost:3000

## Environment Variables
GEMINI_API_KEY=""

CURE_CANCER_AI_API_KEY=""

ClinicalTrials.gov requires no API key.

Known Limitations
Clinical trial availability depends on registry coverage.
Geographic searches may legitimately return zero local trial sites.
Clinical maturity is an evidence metric and not a predictor of treatment efficacy.
Research Directions are evidence synthesis constructs and should never replace expert medical judgement.
Scientific Disclaimer
Cancer Research Radar is strictly an exploratory biomedical informatics platform.

The application:
does NOT provide medical advice;
does NOT recommend treatments;
does NOT determine patient eligibility;
does NOT replace multidisciplinary tumour boards or oncology specialists.
Research activity, publication volume or trial maturity must never be interpreted as evidence of clinical benefit.
Roadmap
Completed
✅ ClinicalTrials.gov LIVE integration
✅ Cure Cancer With AI LIVE integration
✅ Interactive Research Radar
✅ Evidence Explorer
✅ Research Direction Engine
✅ Research Momentum Engine
✅ Source traceability
✅ Server-side provider architecture
Planned
⏳ PubMed native integration
⏳ OpenFDA native provider
⏳ Europe PMC provider
⏳ Research Intelligence Engine
⏳ Geographic travel-time estimation
⏳ Multi-provider biomedical deduplication
⏳ Exportable evidence reports
Documentation
Additional documentation is available in the /docs folder.
Architecture
Data Sources
Safety Principles
Contributing
This repository is currently released as an open-source research Proof of Concept.
Contributions, discussions, and scientific feedback are welcome.
Citation
If you use Cancer Research Radar in academic work, presentations, or demonstrations, please cite this repository.
License
MIT License
Copyright © 2026 Dr Riadh Chaker




