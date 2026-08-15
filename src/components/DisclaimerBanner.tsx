import React, { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed && compact) return null;

  if (compact) {
    return (
      <div
        id="compact-disclaimer-banner"
        className="bg-amber-50/90 border border-amber-300 px-4 py-2.5 text-xs text-amber-950 flex items-center justify-between gap-3 rounded-xs"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="leading-snug">
            <span className="font-bold uppercase tracking-wider font-mono text-[11px]">Notice:</span> Research exploration & trial discovery tool only. This platform does not provide diagnosis, personalized clinical guidance, or medical advice.{' '}
            <span className="font-semibold underline decoration-amber-500">Research maturity ≠ proven clinical efficacy.</span>
          </p>
        </div>
        <button
          id="btn-dismiss-compact-disclaimer"
          onClick={() => setDismissed(true)}
          className="text-amber-800 hover:text-amber-950 p-1 rounded-xs transition-colors"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      id="main-disclaimer-card"
      className="bg-white border border-slate-300 p-5 md:p-6 rounded-xs shadow-xs relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="p-2 rounded-xs bg-amber-50 border border-amber-300 text-amber-800 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-mono">
              Scientific & Clinical Discovery Protocol Notice
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 font-mono uppercase border border-slate-200">
              Non-Diagnostic
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-serif italic">
            This application facilitates exploratory landscape research for patients, clinicians, and scientists. It does not provide medical advice, diagnosis, treatment recommendations, or clinical-trial eligibility decisions.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Research maturity ≠ proven therapeutic benefit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              <span>All clinical trial participation requires physician consultation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Registry citations and primary source links provided</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
