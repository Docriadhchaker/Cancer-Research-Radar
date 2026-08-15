import React, { useState } from 'react';
import { ResearchPaper } from '../types/research';
import { BookOpen, ExternalLink, Calendar, Users, Search, Sparkles, Tag, ShieldCheck, FileText } from 'lucide-react';

interface ResearchPapersTabProps {
  publications: ResearchPaper[];
}

export const ResearchPapersTab: React.FC<ResearchPapersTabProps> = ({ publications }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'title'>('newest');

  const filteredPapers = publications
    .filter(p => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.journal.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.authors.some(a => a.toLowerCase().includes(q)) ||
        (p.pubmedId && p.pubmedId.includes(q)) ||
        (p.doi && p.doi.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.publicationDate || '').localeCompare(a.publicationDate || '');
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="space-y-6">
      {/* Evidence Provenance Banner */}
      <div
        id="papers-provenance-banner"
        className="bg-slate-50 border border-slate-300 p-4 rounded-xs flex items-start gap-3 text-xs text-slate-800"
      >
        <FileText className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-slate-900">
            Source Literature Grounding & Evidence Traceability:
          </span>
          <p className="leading-relaxed font-serif text-slate-700">
            All records below represent original scientific literature indexed by PubMed, DOI registries, and biomedical research databases. Every entry preserves primary author attributions, registry identifiers, and direct links to full publications.
          </p>
        </div>
      </div>

      {/* Header & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-xs border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            id="input-papers-search"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search papers by keyword, biomarker, author, PMID, or journal..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xs border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-slate-900 focus:outline-none font-sans"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-slate-600 font-mono text-[11px]">
            Indexed: <strong>{filteredPapers.length}</strong> publications
          </span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xs border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-slate-900 font-mono text-xs"
          >
            <option value="newest">Sort: Newest Date</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>
      </div>

      {/* Publications List */}
      {filteredPapers.length === 0 ? (
        <div className="bg-white rounded-xs border border-slate-200 p-8 text-center space-y-2">
          <p className="text-sm font-bold text-slate-900 font-serif">
            No scientific publications found matching your query.
          </p>
          <p className="text-xs text-slate-500 font-serif italic">
            Try adjusting search terms or clearing filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPapers.map((paper, idx) => (
            <div
              key={paper.id || idx}
              id={`paper-card-${paper.id || idx}`}
              className="bg-white rounded-xs border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-3.5"
            >
              {/* Journal & Provenance Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300 text-[11px]">
                    {paper.journal}
                  </span>
                  <span className="text-slate-600 font-mono text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{paper.publicationDate}</span>
                  </span>
                  {paper.pubmedId && (
                    <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded-xs border border-slate-200 text-[11px]">
                      PMID: {paper.pubmedId}
                    </span>
                  )}
                  {paper.isDemo ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-amber-50 text-amber-900 border border-amber-300 uppercase">
                      {paper.isFallback ? 'DEMO FALLBACK' : 'DEMO REFERENCE'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase">
                      LIVE SOURCE DATA
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {paper.doi && (
                    <a
                      id={`link-doi-${paper.id || idx}`}
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-mono text-[11px] font-bold uppercase tracking-wider border-b border-slate-300 hover:border-slate-900 pb-0.5 transition-colors"
                    >
                      <span>DOI: {paper.doi}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <a
                    id={`link-pubmed-${paper.id || idx}`}
                    href={paper.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-mono text-[11px] font-bold uppercase tracking-wider border-b border-slate-300 hover:border-slate-900 pb-0.5 transition-colors"
                  >
                    <span>{paper.pubmedId ? 'PubMed' : 'Full Article'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {paper.title}
              </h3>

              {/* Authors */}
              <div className="text-xs text-slate-600 flex items-center gap-1.5 font-serif italic">
                <Users className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{paper.authors.join(', ')}</span>
              </div>

              {/* Plain Language Summary if available */}
              {paper.plainLanguageSummary && (
                <div className="bg-slate-50 p-3.5 rounded-xs border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-900 font-mono font-bold uppercase text-[10px] tracking-wider">
                    <Sparkles className="w-3 h-3 text-indigo-700" />
                    <span>Plain-Language Synthesis (AI Harmonized)</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-serif italic">
                    {paper.plainLanguageSummary}
                  </p>
                </div>
              )}

              {/* Abstract Snippet */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-900 font-mono uppercase text-[10px] tracking-wider">
                  Abstract:
                </span>
                <p className="text-slate-700 leading-relaxed font-serif">
                  {paper.abstract}
                </p>
              </div>

              {/* Metadata Details & Tags */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  {paper.treatmentType && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-slate-50 text-slate-700 border border-slate-200">
                      Type: {paper.treatmentType}
                    </span>
                  )}
                  {paper.cancerType && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-slate-50 text-slate-700 border border-slate-200">
                      Indication: {paper.cancerType}
                    </span>
                  )}
                  {paper.tags?.biomarkers?.map(bm => (
                    <span
                      key={bm}
                      className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-xs bg-slate-100 text-slate-900 border border-slate-300"
                    >
                      {bm}
                    </span>
                  ))}
                </div>

                <div className="font-mono text-[11px] text-slate-500">
                  <span>DOI: {paper.doi || 'Not reported'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
