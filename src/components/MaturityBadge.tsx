import React from 'react';
import { MaturityLevel } from '../types/research';
import { ShieldCheck, Activity, Award, FlaskConical, Radio, Zap } from 'lucide-react';

interface MaturityBadgeProps {
  maturity: MaturityLevel;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export const MATURITY_DEFINITIONS: Record<
  MaturityLevel,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }>; description: string }
> = {
  APPROVED: {
    label: 'APPROVED',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    icon: Award,
    description: 'A relevant regulatory approval exists for the queried cancer indication.',
  },
  'LATE CLINICAL': {
    label: 'LATE CLINICAL',
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    text: 'text-indigo-700',
    border: 'border-indigo-300',
    icon: ShieldCheck,
    description: 'At least one relevant Phase III study exists.',
  },
  'MID CLINICAL': {
    label: 'MID CLINICAL',
    bg: 'bg-blue-50 text-blue-800 border-blue-300',
    text: 'text-blue-700',
    border: 'border-blue-300',
    icon: Activity,
    description: 'Relevant Phase II studies exist but no Phase III identified.',
  },
  'EARLY CLINICAL': {
    label: 'EARLY CLINICAL',
    bg: 'bg-purple-50 text-purple-800 border-purple-300',
    text: 'text-purple-700',
    border: 'border-purple-300',
    icon: Zap,
    description: 'Primarily Phase I or Phase I/II studies evaluating safety and preliminary signal.',
  },
  PRECLINICAL: {
    label: 'PRECLINICAL',
    bg: 'bg-amber-50 text-amber-900 border-amber-300',
    text: 'text-amber-700',
    border: 'border-amber-300',
    icon: FlaskConical,
    description: 'Scientific publications exist but no relevant human clinical trials were identified.',
  },
  'EMERGING SIGNAL': {
    label: 'EMERGING SIGNAL',
    bg: 'bg-slate-100 text-slate-800 border-slate-300',
    text: 'text-slate-600',
    border: 'border-slate-300',
    icon: Radio,
    description: 'Limited early evidence or a small number of very recent exploratory studies.',
  },
};

export const MaturityBadge: React.FC<MaturityBadgeProps> = ({
  maturity,
  size = 'md',
  showDescription = false,
}) => {
  const config = MATURITY_DEFINITIONS[maturity] || MATURITY_DEFINITIONS['MID CLINICAL'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-bold font-mono tracking-wider gap-1',
    md: 'text-[11px] px-2.5 py-0.5 font-bold font-mono tracking-wider gap-1.5',
    lg: 'text-xs px-3 py-1 font-bold font-mono tracking-wider gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div className="inline-flex flex-col">
      <span
        id={`maturity-badge-${maturity.toLowerCase().replace(/\s+/g, '-')}`}
        className={`inline-flex items-center rounded-xs border ${config.bg} ${sizeClasses} transition-all select-none uppercase`}
        title={`${config.label}: ${config.description}`}
      >
        <Icon className={iconSizes} />
        <span>{config.label}</span>
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-500 mt-1 leading-tight max-w-xs font-serif italic">
          {config.description}
        </span>
      )}
    </div>
  );
};
