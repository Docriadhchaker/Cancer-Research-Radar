import React from 'react';
import { X, Radar, ShieldCheck, Database, Sparkles, BookOpen, AlertTriangle, ExternalLink } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div
      id="modal-about"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-xs border border-slate-300 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xs bg-slate-900 text-white border border-slate-800">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-serif">
                About Cancer Research Radar
              </h2>
              <p className="text-xs text-slate-500 font-serif italic">
                Methodology, Open-Source Architecture & Evidence Governance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xs text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 text-xs sm:text-sm leading-relaxed font-sans">
          {/* Mission & Purpose */}
          <div className="space-y-2">
            <h3 className="font-mono font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-700" />
              <span>Project Mission</span>
            </h3>
            <p className="text-slate-600 font-serif">
              Cancer Research Radar is an open-source clinical exploration tool built to answer one fundamental question:
            </p>
            <blockquote className="border-l-2 border-slate-900 pl-4 py-2 font-serif italic text-base text-slate-900 bg-slate-50 rounded-xs">
              "For this type of cancer, what new therapeutic approaches are currently being investigated, how mature are they, and where are relevant clinical trials taking place?"
            </blockquote>
          </div>

          {/* Non-Diagnostic Mandate */}
          <div className="p-4 rounded-xs bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-mono font-bold text-amber-900 text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-800" />
              <span>Non-Diagnostic, Non-Prescriptive Research Policy</span>
            </div>
            <p className="text-xs leading-relaxed font-serif text-amber-900">
              This application is <strong>NOT</strong> a diagnostic tool and does <strong>NOT</strong> provide treatment recommendations or individualized clinical-trial eligibility advice. Research maturity represents study phase volume, not clinical efficacy or patient prognosis.
            </p>
          </div>

          {/* Data Sources Architecture */}
          <div className="space-y-3">
            <h3 className="font-mono font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-700" />
              <span>Data Sources & Provenance</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xs border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-mono font-bold text-slate-900 block text-[11px] uppercase">
                  ClinicalTrials.gov (v2 REST API)
                </span>
                <p className="text-slate-600 font-serif leading-relaxed">
                  Direct official registry data for human clinical trials, recruiting statuses, interventions, phases, and global study locations.
                </p>
              </div>

              <div className="p-4 rounded-xs border border-slate-200 bg-slate-50 space-y-1">
                <span className="font-mono font-bold text-slate-900 block text-[11px] uppercase">
                  Cure Cancer With AI & PubMed
                </span>
                <p className="text-slate-600 font-serif leading-relaxed">
                  Comprehensive biomedical research publication database, abstracts, author details, and oncology FDA approval logs.
                </p>
              </div>
            </div>
          </div>

          {/* AI Grounding & Attribution */}
          <div className="space-y-2">
            <h3 className="font-mono font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-700" />
              <span>Strict AI Grounding Principles</span>
            </h3>
            <p className="text-slate-600 text-xs font-serif leading-relaxed">
              Gemini models are utilized server-side purely for grouping retrieved source documents into readable translational directions. The engine is constrained by strict grounding rules: every direction must link to authentic NCT IDs, PubMed PMIDs, or FDA records.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">Cancer Research Radar v1.0.0</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xs font-mono font-bold uppercase tracking-wider text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
