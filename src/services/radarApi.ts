import { SearchQuery } from '../types/research';
import { LandscapeResponse } from '../server/researchAggregator';

export async function fetchLandscapeData(query: SearchQuery): Promise<LandscapeResponse> {
  const response = await fetch('/api/search-landscape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to fetch oncology landscape (HTTP ${response.status})`);
  }

  return await response.json();
}

export async function checkServerHealth() {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch (err) {
    return { status: 'offline' };
  }
}
