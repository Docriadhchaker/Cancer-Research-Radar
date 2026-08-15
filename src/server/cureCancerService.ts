import { ResearchPaper, RegulatoryApproval } from '../types/research';

const CURE_CANCER_BASE_URL = 'https://www.curecancerwithai.com';

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  memoryCache.set(key, { timestamp: Date.now(), data });
}

export interface CureCancerResult<T> {
  success: boolean;
  data: T;
  rateLimited: boolean;
  usingFallback: boolean;
  message: string;
}

/**
 * Normalizes user cancer type string into a recognized query parameter for Cure Cancer With AI API.
 */
function normalizeCancerCategory(cancerType: string): string {
  const lower = cancerType.toLowerCase();
  if (lower.includes('colorectal') || lower.includes('colon') || lower.includes('rectal') || lower.includes('crc')) {
    return 'colorectal';
  }
  if (lower.includes('pancrea')) {
    return 'pancreatic';
  }
  if (lower.includes('breast')) {
    return 'breast';
  }
  if (lower.includes('lung') || lower.includes('nsclc') || lower.includes('sclc')) {
    return 'lung';
  }
  if (lower.includes('prostate')) {
    return 'prostate';
  }
  if (lower.includes('melanoma') || lower.includes('skin')) {
    return 'melanoma';
  }
  if (lower.includes('ovarian') || lower.includes('ovary')) {
    return 'ovarian';
  }
  if (lower.includes('leukemia') || lower.includes('cml') || lower.includes('aml')) {
    return 'leukemia';
  }
  if (lower.includes('lymphoma')) {
    return 'lymphoma';
  }
  if (lower.includes('stomach') || lower.includes('gastric')) {
    return 'stomach';
  }
  return lower.replace(/cancer|carcinoma|tumor|adenocarcinoma/gi, '').trim() || 'cancer';
}

/**
 * Evaluates whether an FDA approval directly matches the queried indication/biomarkers
 * or should be categorized under 'Related Regulatory Evidence'.
 */
function determineApprovalRelevance(
  indication: string,
  approvalCancerTypes: string[],
  queriedCancer: string,
  queriedBiomarkers?: string[]
): 'Relevant Approval' | 'Related Regulatory Evidence' {
  const indLower = (indication || '').toLowerCase();
  const cancerCategory = normalizeCancerCategory(queriedCancer);

  // Check cancer indication match
  const matchesCancer =
    approvalCancerTypes.some(c => c.toLowerCase().includes(cancerCategory)) ||
    indLower.includes(cancerCategory) ||
    (cancerCategory === 'colorectal' && (indLower.includes('colon') || indLower.includes('rectal') || indLower.includes('colorectal'))) ||
    (cancerCategory === 'lung' && (indLower.includes('lung') || indLower.includes('nsclc'))) ||
    (cancerCategory === 'pancreatic' && indLower.includes('pancrea')) ||
    (cancerCategory === 'breast' && indLower.includes('breast'));

  if (!matchesCancer) {
    return 'Related Regulatory Evidence';
  }

  // If biomarkers were queried, check if the approval mentions them or if it is a general indication
  if (queriedBiomarkers && queriedBiomarkers.length > 0) {
    const matchesBiomarker = queriedBiomarkers.some(bm =>
      indLower.includes(bm.toLowerCase().replace(/\s+/g, '')) ||
      indLower.includes(bm.toLowerCase())
    );
    // If it specifically matches biomarker, it is highly relevant
    if (matchesBiomarker) {
      return 'Relevant Approval';
    }
  }

  // If it matches the cancer indication directly, it is a Relevant Approval
  return 'Relevant Approval';
}

export async function fetchCureCancerResearch(
  cancerType: string,
  search?: string
): Promise<CureCancerResult<ResearchPaper[]>> {
  const cancerParam = normalizeCancerCategory(cancerType);
  const cacheKey = `research:${cancerParam}:${search || ''}`;
  const cached = getCached<ResearchPaper[]>(cacheKey);
  if (cached) {
    return {
      success: true,
      data: cached,
      rateLimited: false,
      usingFallback: false,
      message: 'Retrieved from cache',
    };
  }

  const apiKey = process.env.CURE_CANCER_AI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      data: [],
      rateLimited: false,
      usingFallback: true,
      message: 'Cure Cancer With AI API key not configured. Using reference research index.',
    };
  }

  try {
    // Attempt search with cancerType and search keywords
    const params = new URLSearchParams({
      cancerType: cancerParam,
      limit: '15',
    });
    if (search?.trim()) {
      params.append('search', search.trim());
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    let response = await fetch(`${CURE_CANCER_BASE_URL}/api/v1/research?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.status === 429) {
      return {
        success: false,
        data: [],
        rateLimited: true,
        usingFallback: true,
        message: 'Cure Cancer With AI request limit reached. Live publication or regulatory data may be temporarily unavailable.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        data: [],
        rateLimited: false,
        usingFallback: true,
        message: `HTTP error from Cure Cancer With AI API: ${response.status}`,
      };
    }

    let json = await response.json();
    let rawItems: any[] = json.data || json.items || [];

    // If query with specific biomarker term returned 0, fallback to broader cancerType search
    if (rawItems.length === 0 && search?.trim()) {
      try {
        const broadParams = new URLSearchParams({
          cancerType: cancerParam,
          limit: '15',
        });
        const broadRes = await fetch(`${CURE_CANCER_BASE_URL}/api/v1/research?${broadParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        if (broadRes.ok) {
          const broadJson = await broadRes.json();
          rawItems = broadJson.data || broadJson.items || [];
        }
      } catch {
        // Keep rawItems
      }
    }

    const papers: ResearchPaper[] = rawItems.map((item: any, idx: number) => {
      const pubmedId = item.pubmedId ? String(item.pubmedId) : undefined;
      const doi = item.doi ? String(item.doi) : undefined;
      const id = item.id || (pubmedId ? `PUB-${pubmedId}` : `PUB-LIVE-${idx}`);
      const pubDate = item.publicationDate
        ? new Date(item.publicationDate).toISOString().split('T')[0]
        : (item.date || 'Not reported');

      const sourceUrl =
        item.fullTextUrl ||
        (doi ? `https://doi.org/${doi}` : pubmedId ? `https://pubmed.ncbi.nlm.nih.gov/${pubmedId}/` : 'https://pubmed.ncbi.nlm.nih.gov/');

      return {
        id,
        pubmedId,
        doi,
        title: item.title || 'Untitled Research Study',
        authors: Array.isArray(item.authors) && item.authors.length > 0
          ? item.authors
          : [item.authors || 'Investigators not specified'],
        journal: item.journal || 'Peer-reviewed Journal',
        publicationDate: pubDate,
        abstract: item.abstract || 'No abstract text available in source index.',
        plainLanguageSummary: item.summaryPlain || item.plainLanguageSummary || undefined,
        treatmentType: item.treatmentTypes?.[0] || item.treatmentType || undefined,
        cancerType: item.cancerTypes?.[0] || cancerType,
        sourceUrl,
        tags: {
          cancerType: Array.isArray(item.cancerTypes) ? item.cancerTypes : [cancerType],
          treatmentType: Array.isArray(item.treatmentTypes) ? item.treatmentTypes : ['Targeted Therapy'],
          biomarkers: Array.isArray(item.keywords) ? item.keywords : (item.biomarkers || []),
        },
        isDemo: false,
        isFallback: false,
      };
    });

    setCache(cacheKey, papers);
    return {
      success: true,
      data: papers,
      rateLimited: false,
      usingFallback: false,
      message: `Retrieved ${papers.length} live research publications via Cure Cancer With AI.`,
    };
  } catch (err: any) {
    return {
      success: false,
      data: [],
      rateLimited: false,
      usingFallback: true,
      message: `Connection error to Cure Cancer With AI: ${err.message || err}`,
    };
  }
}

export async function fetchCureCancerApprovals(
  cancerType: string,
  biomarkers?: string[]
): Promise<CureCancerResult<RegulatoryApproval[]>> {
  const cancerParam = normalizeCancerCategory(cancerType);
  const cacheKey = `approvals:${cancerParam}`;
  const cached = getCached<RegulatoryApproval[]>(cacheKey);
  if (cached) {
    return {
      success: true,
      data: cached,
      rateLimited: false,
      usingFallback: false,
      message: 'Retrieved from cache',
    };
  }

  const apiKey = process.env.CURE_CANCER_AI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      data: [],
      rateLimited: false,
      usingFallback: true,
      message: 'Cure Cancer With AI API key not configured. Using reference FDA oncology dataset.',
    };
  }

  try {
    const params = new URLSearchParams({
      cancerType: cancerParam,
      limit: '15',
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(`${CURE_CANCER_BASE_URL}/api/v1/fda-approvals?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.status === 429) {
      return {
        success: false,
        data: [],
        rateLimited: true,
        usingFallback: true,
        message: 'Cure Cancer With AI request limit reached. Live publication or regulatory data may be temporarily unavailable.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        data: [],
        rateLimited: false,
        usingFallback: true,
        message: `HTTP error: ${response.status}`,
      };
    }

    const json = await response.json();
    const rawItems: any[] = json.data || json.items || [];

    const approvals: RegulatoryApproval[] = rawItems.map((item: any, idx: number) => {
      const drug = item.drugName || item.drug || item.tradeName || 'Approved Drug';
      const genericName = item.genericName || item.nonProprietaryName || drug;
      const appDate = item.approvalDate
        ? new Date(item.approvalDate).toISOString().split('T')[0]
        : (item.date || 'Not reported');
      const indication = item.indication || 'Oncology indication';
      const cancerTypes = Array.isArray(item.cancerTypes) ? item.cancerTypes : [];
      const sourceUrl = item.url || item.labelPdfUrl || item.fdaLink || 'https://www.accessdata.fda.gov/';
      const id = item.id || (item.applicationNumber ? `FDA-${item.applicationNumber}` : `FDA-LIVE-${idx}`);

      const relevanceCategory = determineApprovalRelevance(
        indication,
        cancerTypes,
        cancerType,
        biomarkers
      );

      return {
        id,
        drug,
        genericName,
        indication,
        company: item.company || item.sponsor || 'Not reported',
        approvalDate: appDate,
        sourceUrl,
        biomarkers: item.biomarkers || [],
        relevanceCategory,
        isDemo: false,
        isFallback: false,
      };
    });

    setCache(cacheKey, approvals);
    return {
      success: true,
      data: approvals,
      rateLimited: false,
      usingFallback: false,
      message: `Retrieved ${approvals.length} live FDA regulatory approvals via Cure Cancer With AI.`,
    };
  } catch (err: any) {
    return {
      success: false,
      data: [],
      rateLimited: false,
      usingFallback: true,
      message: `Error connecting to FDA approvals endpoint: ${err.message || err}`,
    };
  }
}
