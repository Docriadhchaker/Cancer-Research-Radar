# Cancer Research Radar — Architecture

## Overview

Cancer Research Radar is an open-source oncology research exploration system and technical Proof of Concept (POC) designed to synthesize, ground, and visualize emerging cancer strategies, clinical trials, and regulatory milestones.

## High-Level Architecture

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
│  v2 REST API      │  │ Public Endpts  │  │ Grounding API │
└───────────────────┘  └────────────────┘  └───────────────┘
```

## Core Principles

1. **Provider Abstraction Layer**:
   - `ClinicalTrialsGovProvider`: Direct connection to official public API (`https://clinicaltrials.gov/api/v2/studies`). Zero key required.
   - `CureCancerAIProvider`: Server-side proxy for literature and regulatory intelligence.
   - `DemoResearchProvider`: Local fallback reference cohorts when services are unavailable.

2. **Server-Side Key Isolation**:
   - All external keys (`GEMINI_API_KEY`, `CURE_CANCER_AI_API_KEY`) reside exclusively in server-side memory (`process.env`).
   - No API secrets or tokens are ever bundled or exposed in client network headers.

3. **Data Mode Discipline**:
   - **`LIVE DATA`**: ClinicalTrials.gov, PubMed literature, and FDA regulatory endpoints all connected via live APIs.
   - **`PARTIAL LIVE DATA`**: Real-time ClinicalTrials.gov live integration active; reference literature/approvals loaded.
   - **`DEMO DATA`**: Offline or fallback mode using verified oncology reference cohorts.
   - Individual trial cards display explicit source badges (`ClinicalTrials.gov (LIVE)` or `DEMO FALLBACK`).

4. **Biomedical Entity Harmonization**:
   - Live clinical trial protocols and literature are mapped to research direction clusters based on mechanistic keywords, target biomarkers, and condition criteria.
   - When studies cannot be reliably attributed, they are labeled as **Unclassified Research Evidence** rather than being artificially assigned.

5. **Scientific Grounding & Non-Prescriptive UX**:
   - The platform strictly explores scientific and translational activity.
   - It provides no treatment recommendations, efficacy inferences, or medical eligibility claims.
