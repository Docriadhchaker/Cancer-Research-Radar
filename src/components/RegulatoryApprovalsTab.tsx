import React from 'react';
import { RegulatoryApproval } from '../types/research';
import { Award, ExternalLink, Building2, Calendar, Tag, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface RegulatoryApprovalsTabProps {
  approvals: RegulatoryApproval[];
}

export const RegulatoryApprovalsTab: React.FC<RegulatoryApprovalsTabProps> = ({ approvals }) => {
  const relevantApprovals = approvals.filter(
    a => !a.relevanceCategory || a.relevanceCategory === 'Relevant Approval'
  );
  const relatedApprovals = approvals.filter(
    a => a.relevanceCategory === 'Related Regulatory Evidence'
  );

  const renderApprovalCard = (app: RegulatoryApproval) => (
    <div
      key={app.id}
      id={`approval-card-${app.id}`}
      className="bg-white rounded-xs border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        {/* Header: Drug Trade Name & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xs bg-slate-100 text-slate-900 border border-slate-300">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {app.drug}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {app.genericName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {app.isDemo ? (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-amber-50 text-amber-900 border border-amber-300 uppercase tracking-wider">
                {app.isFallback ? 'DEMO FALLBACK' : 'DEMO REFERENCE'}
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                LIVE FDA DATA
              </span>
            )}
          </div>
        </div>

        {/* Indication */}
        <div className="space-y-1 text-xs">
          <span className="font-bold text-slate-900 font-mono uppercase text-[10px] tracking-wider">
            Approved Indication:
          </span>
          <p className="text-slate-700 leading-relaxed font-serif bg-slate-50 p-3 rounded-xs border border-slate-200">
            {app.indication}
          </p>
        </div>

        {/* Biomarkers */}
        {app.biomarkers && app.biomarkers.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
            <span className="text-[11px] text-slate-500 font-mono uppercase">Target Biomarkers:</span>
            {app.biomarkers.map(bm => (
              <span
                key={bm}
                className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-xs bg-slate-100 text-slate-900 border border-slate-300"
              >
                {bm}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Meta Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="space-y-0.5 font-mono text-[11px]">
          <div className="flex items-center gap-1 text-slate-700">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>{app.company}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Approved: {app.approvalDate}</span>
          </div>
        </div>

        <a
          id={`link-fda-source-${app.id}`}
          href={app.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 border-b border-slate-300 hover:border-slate-900 pb-0.5 transition-colors"
        >
          <span>FDA Details</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Informative distinction banner */}
      <div
        id="regulatory-distinction-banner"
        className="bg-emerald-50/70 border border-emerald-300 p-4 rounded-xs flex items-start gap-3 text-xs text-emerald-950"
      >
        <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-mono font-bold uppercase tracking-wider text-[11px] text-emerald-950">
            Standard of Care vs. Investigational Oncology Research:
          </p>
          <p className="leading-relaxed font-serif">
            The therapeutic regimens cataloged below hold <strong>formal regulatory approval (FDA)</strong> for specific oncology indications and biomarker subgroups. Regulatory approval designates an authorized standard-of-care agent, distinct from early investigational phase trial protocols.
          </p>
        </div>
      </div>

      {approvals.length === 0 ? (
        <div className="bg-white rounded-xs border border-slate-200 p-8 text-center space-y-2">
          <p className="text-sm font-bold text-slate-900 font-serif">
            No specific FDA oncology approvals cataloged for this query.
          </p>
        </div>
      ) : (
        <>
          {/* Section 1: Relevant Approvals */}
          {relevantApprovals.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-900">
                    Relevant Approvals ({relevantApprovals.length})
                  </h3>
                </div>
                <span className="text-[11px] font-serif italic text-slate-500">
                  Direct indication & biomarker alignment
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {relevantApprovals.map(renderApprovalCard)}
              </div>
            </div>
          )}

          {/* Section 2: Related Regulatory Evidence */}
          {relatedApprovals.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-sky-700" />
                  <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-900">
                    Related Regulatory Evidence ({relatedApprovals.length})
                  </h3>
                </div>
                <span className="text-[11px] font-serif italic text-slate-500">
                  Adjacent oncology indications & cross-entity precedents
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {relatedApprovals.map(renderApprovalCard)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
