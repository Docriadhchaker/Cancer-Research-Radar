import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { aggregateResearchLandscape } from './src/server/researchAggregator';
import { fetchCureCancerResearch, fetchCureCancerApprovals } from './src/server/cureCancerService';
import { searchClinicalTrialsGov } from './src/server/clinicalTrialsService';
import { synthesizeResearchDirections } from './src/server/geminiService';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Cancer Research Radar Intelligence API',
      timestamp: new Date().toISOString(),
      capabilities: {
        cureCancerAI: !!process.env.CURE_CANCER_AI_API_KEY,
        geminiGrounding: !!process.env.GEMINI_API_KEY,
      },
    });
  });

  // Main aggregator endpoint
  app.post('/api/search-landscape', async (req, res) => {
    try {
      const query = req.body;
      if (!query || !query.cancerType) {
        return res.status(400).json({ error: 'cancerType is required' });
      }
      const landscape = await aggregateResearchLandscape(query);
      res.json(landscape);
    } catch (err: any) {
      console.error('Error in /api/search-landscape:', err);
      res.status(500).json({ error: 'Internal server error aggregating oncology landscape', details: err.message });
    }
  });

  // Proxy endpoint for Cure Cancer Research
  app.get('/api/curecancer/research', async (req, res) => {
    try {
      const cancerType = (req.query.cancerType as string) || 'Colorectal Cancer';
      const search = (req.query.search as string) || '';
      const result = await fetchCureCancerResearch(cancerType, search);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Proxy endpoint for FDA approvals
  app.get('/api/curecancer/fda-approvals', async (req, res) => {
    try {
      const cancerType = req.query.cancerType as string;
      const result = await fetchCureCancerApprovals(cancerType);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Proxy endpoint for ClinicalTrials.gov
  app.get('/api/clinicaltrials/search', async (req, res) => {
    try {
      const condition = (req.query.cond as string) || 'Colorectal Cancer';
      const term = (req.query.term as string) || '';
      const locn = (req.query.locn as string) || '';
      const result = await searchClinicalTrialsGov(condition, term, locn);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Direct Gemini synthesis endpoint
  app.post('/api/gemini/synthesize-radar', async (req, res) => {
    try {
      const payload = req.body;
      const result = await synthesizeResearchDirections(payload);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cancer Research Radar server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
