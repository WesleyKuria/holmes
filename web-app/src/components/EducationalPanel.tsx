import React from 'react';
import { BookOpen, AlertCircle, ShieldCheck, Compass, HelpCircle } from 'lucide-react';

interface EducationalPanelProps {
  primaryTactic?: string;
  educationalSummary?: string;
}

export const EducationalPanel: React.FC<EducationalPanelProps> = ({
  primaryTactic = 'Standard Verification',
  educationalSummary = 'Analysis indicates no malicious indicators or social engineering patterns present in the email.',
}) => {
  return (
    <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-sans">
              Forensic Intelligence & Educational Brief
            </h3>
            <p className="text-xs text-slate-400">
              Deconstruction of psychological triggers and technical manipulation mechanics
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-medium text-slate-400 bg-slate-950 border border-slate-800">
          EdTech Advisory
        </span>
      </div>

      {/* Grid: Attack Tactic & Psychological Vector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identified Tactic */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            Social Engineering Methodology
          </div>
          <div className="text-sm font-semibold text-indigo-300">
            {primaryTactic}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The core strategic pattern used by the communicator to influence recipient behavior.
          </p>
        </div>

        {/* Psychological Mechanism */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Cognitive Vulnerability Target
          </div>
          <div className="text-sm font-semibold text-amber-300">
            Urgency, Authority & Panic Exploitation
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Exploits human stress responses to force quick unverified compliance before security verification.
          </p>
        </div>
      </div>

      {/* Detailed Analytical Breakdown */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Detailed Forensic Evaluation
        </div>
        <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-4 sm:p-5 text-sm leading-relaxed text-slate-200 font-normal">
          {educationalSummary}
        </div>
      </div>

      {/* Defense Takeaways */}
      <div className="rounded-xl bg-indigo-950/30 border border-indigo-500/20 p-4 flex items-start space-x-3 text-xs text-indigo-200">
        <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-100 font-semibold block text-sm">
            Actionable Defensive Recommendation:
          </strong>
          <p className="text-slate-300 leading-relaxed">
            Never authenticate or authorize transactions through links embedded in unsolicited messages. Always open an official browser bookmark or contact the service provider through verified phone/directory channels.
          </p>
        </div>
      </div>
    </div>
  );
};
