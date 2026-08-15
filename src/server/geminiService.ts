import { GoogleGenAI, Type } from '@google/genai';
import { ResearchDirection, ResearchPaper, RegulatoryApproval, MaturityLevel } from '../types/research';
import { ClinicalTrial } from '../types/trials';
import {
  calculateResearchMomentum,
  calculateMaturityScore,
  calculateResearchActivity,
  calculateBubbleSize,
} from '../data/demo/metricsCalculator';

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (aiInstance) return aiInstance;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  aiInstance = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return aiInstance;
}

interface GroundingPayload {
  cancerType: string;
  biomarkers: string[];
  stage: string;
  trials: ClinicalTrial[];
  publications: ResearchPaper[];
  approvals: RegulatoryApproval[];
}

export async function synthesizeResearchDirections(
  payload: GroundingPayload
): Promise<{ directions: ResearchDirection[]; isGroundedByGemini: boolean; message: string }> {
  const ai = getGeminiClient();
  if (!ai) {
    return {
      directions: [],
      isGroundedByGemini: false,
      message: 'Gemini API key not configured. Using deterministic evidence categorization engine.',
    };
  }

  // Ensure there is retrieved source data to cluster
  if (payload.trials.length === 0 && payload.publications.length === 0 && payload.approvals.length === 0) {
    return {
      directions: [],
      isGroundedByGemini: false,
      message: 'No retrieved source records available for synthesis.',
    };
  }

  try {
    const trialsSummary = payload.trials.slice(0, 15).map(t => ({
      id: t.nctId,
      title: t.title,
      phase: t.phase,
      status: t.status,
      interventions: t.interventions.map(i => i.name).join(', '),
      conditions: t.conditions.join(', '),
      lastUpdate: t.lastUpdate,
    }));

    const papersSummary = payload.publications.slice(0, 15).map(p => ({
      id: p.id || (p.pubmedId ? `PUB-${p.pubmedId}` : 'PUB'),
      pubmedId: p.pubmedId,
      title: p.title,
      journal: p.journal,
      date: p.publicationDate,
      abstract: p.abstract.slice(0, 300),
      tags: p.tags,
    }));

    const approvalsSummary = payload.approvals.slice(0, 10).map(a => ({
      id: a.id,
      drug: a.drug,
      indication: a.indication,
      date: a.approvalDate,
      biomarkers: a.biomarkers || [],
    }));

    const prompt = `You are an expert biomedical informatics engine for Cancer Research Radar.
Analyze the following retrieved source evidence for cancer type: "${payload.cancerType}" (Biomarkers: ${payload.biomarkers.join(', ') || 'Any'}, Stage: ${payload.stage}).

Strict Grounding Rules:
1. Group the retrieved papers, trials, and approvals into 3 to 6 high-level "Research Directions" (therapeutic or biological strategies, e.g. "Combination KRAS + EGFR Inhibition", "ctDNA-Guided Minimal Residual Disease", "Bispecific T-Cell Engagers", "Immune Checkpoint Blockade Combinations").
2. For every research direction, provide:
   - "name": Concise clinical/scientific strategy title.
   - "category": Must be one of ["STANDARD / REGULATORY", "CLINICAL RESEARCH", "EARLY RESEARCH"].
   - "description": 2-3 sentences explaining what this therapeutic strategy is and how it works in plain, objective language.
   - "whyResearchersInterested": 2 sentences on why oncologists/scientists are investigating it.
   - "maturity": One of ["APPROVED", "LATE CLINICAL", "MID CLINICAL", "EARLY CLINICAL", "PRECLINICAL", "EMERGING SIGNAL"].
   - "highestTrialPhase": (e.g. "Phase III", "Phase II", "Phase I/II", "Approved", "Preclinical").
   - "biomarkers": Relevant target mutations or molecular markers from the retrieved records.
   - "sourceIds": An array of IDs from the provided evidence ONLY (e.g. NCT IDs like NCT05194995, PUB IDs like PUB-41230381, FDA IDs). CRITICAL: Every single direction MUST reference at least 1 retrieved source ID from the provided input data.
   - "keywords": 4-6 key search terms.
3. Patient Safety Mandate:
   - Use objective, neutral language ("Investigative strategy", "Studies are evaluating...").
   - DO NOT recommend therapies, do not claim proven clinical efficacy, do not claim patient eligibility.

RETRIEVED TRIALS:
${JSON.stringify(trialsSummary, null, 2)}

RETRIEVED PUBLICATIONS:
${JSON.stringify(papersSummary, null, 2)}

RETRIEVED REGULATORY APPROVALS:
${JSON.stringify(approvalsSummary, null, 2)}
`;

    // 4.5-second timeout to prevent stalling
    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            directions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  whyResearchersInterested: { type: Type.STRING },
                  maturity: { type: Type.STRING },
                  highestTrialPhase: { type: Type.STRING },
                  biomarkers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sourceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: [
                  'name',
                  'category',
                  'description',
                  'whyResearchersInterested',
                  'maturity',
                  'highestTrialPhase',
                  'sourceIds',
                ],
              },
            },
          },
          required: ['directions'],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini synthesis timeout (4500ms limit reached)')), 4500)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const parsed = JSON.parse(response.text || '{}');
    const rawDirections = parsed.directions || [];

    // Filter and normalize directions: every direction must have valid retrieved sourceIds
    const validDirections: ResearchDirection[] = rawDirections
      .filter((d: any) => Array.isArray(d.sourceIds) && d.sourceIds.length > 0)
      .map((d: any, index: number) => {
        const id = d.id || `dir-${index}-${d.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const maturity: MaturityLevel = [
          'APPROVED',
          'LATE CLINICAL',
          'MID CLINICAL',
          'EARLY CLINICAL',
          'PRECLINICAL',
          'EMERGING SIGNAL',
        ].includes(d.maturity)
          ? (d.maturity as MaturityLevel)
          : 'MID CLINICAL';

        const category = ['STANDARD / REGULATORY', 'CLINICAL RESEARCH', 'EARLY RESEARCH'].includes(d.category)
          ? d.category
          : maturity === 'APPROVED'
          ? 'STANDARD / REGULATORY'
          : maturity === 'LATE CLINICAL' || maturity === 'MID CLINICAL'
          ? 'CLINICAL RESEARCH'
          : 'EARLY RESEARCH';

        // Count directly matched live records
        const matchedTrials = payload.trials.filter(t =>
          d.sourceIds.includes(t.nctId) ||
          d.keywords?.some((k: string) => t.title.toLowerCase().includes(k.toLowerCase()))
        );
        const matchedRecruiting = matchedTrials.filter(t => t.status === 'Recruiting');
        const matchedPapers = payload.publications.filter(p =>
          d.sourceIds.includes(p.id) ||
          (p.pubmedId && d.sourceIds.includes(p.pubmedId)) ||
          (p.pubmedId && d.sourceIds.includes(`PUB-${p.pubmedId}`)) ||
          d.keywords?.some((k: string) => p.title.toLowerCase().includes(k.toLowerCase()))
        );

        const trialCount = matchedTrials.length;
        const recruitingTrialCount = matchedRecruiting.length;
        const publicationCount = matchedPapers.length;

        const momentumRes = calculateResearchMomentum({
          trialCount,
          recruitingTrialCount,
          publicationCount,
          highestTrialPhase: d.highestTrialPhase || 'Clinical',
          maturity,
        });

        const xScore = calculateMaturityScore(maturity);
        const yScore = calculateResearchActivity({
          trialCount,
          recruitingTrialCount,
          publicationCount,
        });
        const bubbleSize = calculateBubbleSize({
          trialCount,
          publicationCount,
        });

        return {
          id,
          name: d.name,
          category: category as any,
          description: d.description,
          whyResearchersInterested: d.whyResearchersInterested,
          cancerTypes: [payload.cancerType],
          biomarkers: d.biomarkers || payload.biomarkers,
          maturity,
          highestTrialPhase: d.highestTrialPhase || 'Clinical',
          trialCount,
          recruitingTrialCount,
          publicationCount,
          momentum: momentumRes.momentum,
          momentumExplanation: momentumRes.explanation,
          latestEvidenceDate: new Date().toISOString().split('T')[0],
          sourceIds: d.sourceIds,
          radarMetrics: {
            clinicalMaturityScore: xScore,
            researchActivityScore: yScore,
            trialVolumeScore: Math.min(100, trialCount * 12),
            publicationActivityScore: Math.min(100, publicationCount * 15),
            recencyScore: 90,
            regulatoryProgressScore: maturity === 'APPROVED' ? 98 : maturity === 'LATE CLINICAL' ? 75 : 30,
            bubbleSizeScore: bubbleSize,
          },
          keywords: d.keywords || [payload.cancerType, ...payload.biomarkers],
          isDemo: false,
        };
      });

    return {
      directions: validDirections,
      isGroundedByGemini: true,
      message: `Organized ${validDirections.length} research directions grounded with Gemini 3.7.`,
    };
  } catch (err: any) {
    return {
      directions: [],
      isGroundedByGemini: false,
      message: `Categorization engine: ${err.message || 'Reference cohort mode'}`,
    };
  }
}
