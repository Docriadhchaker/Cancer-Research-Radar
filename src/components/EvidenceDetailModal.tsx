import React from 'react';
import { ResearchDirection, ResearchPaper, RegulatoryApproval } from '../types/research';
import { ClinicalTrial } from '../types/trials';
import { MaturityBadge } from './MaturityBadge';
import {
  X,
  Sparkles,
  ExternalLink,
  FlaskConical,
  BookOpen,
  Award,
  Calendar,
  Layers,
  CheckCircle2,
  ShieldAlert,
  Info,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Minus,
  ArrowDownRight,
  ShieldCheck,
  Tag,
  Dna,
  FileText,
} from 'lucide-react';

interface EvidenceDetailModalProps {
  direction: ResearchDirection | null;
  allTrials: ClinicalTrial[];
  allPublications: ResearchPaper[];
  allApprovals: RegulatoryApproval[];
  onClose: () => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({
  direction,
  allTrials,
  allPublications,
  allApprovals,
  onClose,
}) => {
  if (!direction) return null;

  // Filter matched sources based on sourceIds or direction keywords
  const matchedTrials = allTrials.filter(
    t =>
      direction.sourceIds?.includes(t.nctId) ||
      (t.directionIds && t.directionIds.includes(direction.id)) ||
      direction.keywords?.some(k => t.title.toLowerCase().includes(k.toLowerCase())) ||
      t.conditions.some(c => direction.cancerTypes.includes(c))
  );

  const matchedPublications = allPublications.filter(
    p =>
      direction.sourceIds?.includes(p.id) ||
      (p.pubmedId && direction.sourceIds?.includes(p.pubmedId)) ||
      (p.pubmedId && direction.sourceIds?.includes(`PUB-${p.pubmedId}`)) ||
      direction.keywords?.some(k => p.title.toLowerCase().includes(k.toLowerCase()))
  );

  const matchedApprovals = allApprovals.filter(
    a =>
      direction.sourceIds?.includes(a.id) ||
      direction.cancerTypes.some(c => a.indication.toLowerCase().includes(c.toLowerCase()))
  );

  return (
    <div
      id="modal-evidence-detail"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-xs border border-slate-300 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800 bg-slate-200 px-2 py-0.5 rounded-xs border border-slate-300">
                {direction.category}
              </span>
              <MaturityBadge maturity={direction.maturity} size="sm" showDescription={false} />
              {direction.isDemo ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                  DEMO DATA
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                  GROUNDED EVIDENCE
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
              {direction.name}
            </h2>
          </div>

          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-2 rounded-xs text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 space-y-8 overflow-y-auto flex-1 text-slate-800 text-sm">
          {/* Non-Efficacy Mandatory Disclaimer Banner */}
          <div className="bg-slate-50 border border-slate-300 p-4 rounded-xs flex items-start gap-3 text-xs text-slate-900">
            <ShieldAlert className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-mono font-bold uppercase tracking-wider text-[11px]">
                Research Evidence Synthesis & Grounding Notice
              </span>
              <p className="leading-relaxed font-serif italic text-slate-700">
                This research portfolio is aggregated from public registries and literature citations. It illustrates investigative activity and clinical trial progress — <strong>it does not represent a diagnostic opinion, medical recommendation, or promise of clinical efficacy.</strong>
              </p>
            </div>
          </div>

          {/* Section 1: OVERVIEW (AI / System Synthesis) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>1. Overview & Biological Mechanism</span>
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 border border-slate-300 uppercase">
                AI / SYSTEM SYNTHESIS
              </span>
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xs border border-slate-200 space-y-3">
              <p className="text-base text-slate-900 leading-relaxed font-serif">
                {direction.description}
              </p>
              {direction.whyResearchersInterested && (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="text-[11px] font-mono font-bold text-slate-900 uppercase tracking-wider">
                    Biological Rationale & Investigation Motive:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-serif italic">
                    {direction.whyResearchersInterested}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: WHY THIS APPEARS ON THE RADAR (Quantitative Breakdown) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                <span>2. Why This Appears on the Radar (Derived Evidence Volume)</span>
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 border border-slate-300 uppercase">
                DERIVED INDEX
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xs border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                  Clinical Trials
                </span>
                <span className="text-xl font-bold font-mono text-slate-900 block">
                  {direction.trialCount}
                </span>
                <span className="text-[11px] font-mono text-emerald-800 block">
                  {direction.recruitingTrialCount} active recruiting
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xs border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                  Publications
                </span>
                <span className="text-xl font-bold font-mono text-slate-900 block">
                  {direction.publicationCount}
                </span>
                <span className="text-[11px] font-mono text-slate-600 block">
                  Indexed papers
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xs border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                  Highest Phase
                </span>
                <span className="text-xl font-bold font-mono text-slate-900 block truncate">
                  {direction.highestTrialPhase || 'Preclinical'}
                </span>
                <span className="text-[11px] font-mono text-slate-600 block">
                  Trial Progression
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xs border border-slate-200 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                  Latest Evidence
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 block truncate">
                  {direction.latestEvidenceDate || '2025/2026'}
                </span>
                <span className="text-[11px] font-mono text-slate-600 block">
                  Registry verification
                </span>
              </div>
            </div>

            {/* Research Momentum Explanatory Box */}
            <div className="bg-slate-50 p-4 rounded-xs border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 uppercase text-[11px]">
                    Research Momentum: {direction.momentum || 'STABLE'}
                  </span>
                </div>
                <p className="text-slate-700 font-serif leading-relaxed">
                  {direction.momentumExplanation || 'Ongoing active protocol accruals and indexed publications.'}
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 italic shrink-0">
                *Measures research velocity over time, not treatment efficacy.
              </span>
            </div>
          </div>

          {/* Section 3: EVIDENCE TIMELINE */}
          {direction.timeline && direction.timeline.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>3. Translational & Clinical Timeline</span>
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 border border-slate-300 font-bold uppercase">
                  HISTORICAL MILESTONES
                </span>
              </div>

              <div className="space-y-3 border-l-2 border-slate-300 pl-4 ml-2">
                {direction.timeline.map((item, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <span className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-900 border border-white" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300">
                        {item.year}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-xs bg-slate-200 text-slate-700">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-serif">
                      {item.description}
                    </p>
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-slate-600 hover:text-slate-900 hover:underline pt-0.5"
                      >
                        <span>View Source ({item.sourceId || 'Registry'})</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: ASSOCIATED CLINICAL TRIALS (SOURCE DATA) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-slate-700" />
                <span>4. Clinical Trial Protocols ({matchedTrials.length})</span>
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-indigo-50 text-indigo-900 border border-indigo-200 uppercase">
                SOURCE DATA: ClinicalTrials.gov
              </span>
            </div>

            {matchedTrials.length === 0 ? (
              <p className="text-xs text-slate-500 font-serif italic">
                No clinical trial protocols cataloged yet for this investigational strategy.
              </p>
            ) : (
              <div className="space-y-2.5">
                {matchedTrials.map(trial => (
                  <div
                    key={trial.nctId}
                    className="p-3.5 rounded-xs border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-xs border border-slate-300">
                          {trial.nctId}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-800">
                          {trial.phase}
                        </span>
                        <span className="px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold uppercase">
                          {trial.status}
                        </span>
                      </div>
                      <p className="font-medium text-slate-900 font-serif">
                        {trial.title}
                      </p>
                    </div>

                    <a
                      href={trial.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 border-b border-slate-300 hover:border-slate-900 pb-0.5 shrink-0 transition-colors"
                    >
                      <span>ClinicalTrials.gov</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: LATEST RESEARCH & PUBLICATIONS (SOURCE DATA) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-700" />
                <span>5. Peer-Reviewed Publications ({matchedPublications.length})</span>
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-blue-50 text-blue-900 border border-blue-200 uppercase">
                SOURCE DATA: PubMed / DOI
              </span>
            </div>

            {matchedPublications.length === 0 ? (
              <p className="text-xs text-slate-500 font-serif italic">
                No direct literature citations linked.
              </p>
            ) : (
              <div className="space-y-2.5">
                {matchedPublications.map((pub, idx) => (
                  <div
                    key={pub.id || idx}
                    className="p-3.5 rounded-xs border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {pub.journal}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">({pub.publicationDate})</span>
                        {pub.pubmedId && (
                          <span className="text-[10px] font-mono text-slate-600 bg-white px-1.5 py-0.2 rounded-xs border border-slate-200">
                            PMID: {pub.pubmedId}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500">
                          DOI: {pub.doi || 'Not reported'}
                        </span>
                      </div>
                      <p className="font-serif italic text-slate-800">
                        {pub.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {pub.doi && (
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 border-b border-slate-300 hover:border-slate-900 pb-0.5 transition-colors"
                        >
                          <span>DOI</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <a
                        href={pub.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 border-b border-slate-300 hover:border-slate-900 pb-0.5 transition-colors"
                      >
                        <span>PubMed</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: REGULATORY STATUS (SOURCE DATA) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-700" />
                <span>6. Regulatory Approvals & Developments ({matchedApprovals.length})</span>
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-900 border border-emerald-200 uppercase">
                SOURCE DATA: FDA CDER
              </span>
            </div>

            {matchedApprovals.length > 0 ? (
              <div className="space-y-2.5">
                {matchedApprovals.map(app => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xs border border-slate-200 bg-emerald-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-950 font-serif">
                          {app.drug} ({app.genericName})
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">Approved: {app.approvalDate}</span>
                      </div>
                      <p className="text-slate-700 font-serif">{app.indication}</p>
                    </div>
                    <a
                      href={app.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-900 hover:underline shrink-0"
                    >
                      <span>FDA Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xs bg-slate-50 border border-slate-200 text-xs text-slate-600 font-serif italic">
                {direction.regulatoryStatus || 'No formal FDA standard-of-care approval currently identified for this specific investigational indication.'}
              </div>
            )}
          </div>

          {/* Section 7: TARGET BIOMARKERS */}
          {direction.biomarkers && direction.biomarkers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5" />
                <span>7. Associated Target Biomarkers</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {direction.biomarkers.map(bm => (
                  <span
                    key={bm}
                    className="px-2.5 py-1 rounded-xs bg-slate-100 text-slate-800 border border-slate-300 font-mono font-bold text-xs"
                  >
                    {bm}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 8: SOURCES & TRACEABILITY */}
          <div className="p-4 rounded-xs bg-slate-900 text-slate-200 space-y-2 text-xs">
            <span className="font-mono font-bold text-amber-400 uppercase tracking-widest text-[10px] block">
              8. Primary Registry Citations & Grounding
            </span>
            <p className="text-slate-300 leading-relaxed font-serif">
              Every data point on Cancer Research Radar is grounded in official registry identifiers.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] text-slate-300">
              {direction.sourceIds?.map(id => (
                <span key={id} className="bg-slate-800 px-2 py-0.5 rounded-xs border border-slate-700">
                  {id}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xs text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
