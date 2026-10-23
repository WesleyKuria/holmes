import React from "react";

interface EducationalPanelProps {
  primaryTactic?: string;
  educationalSummary?: string;
}

export const EducationalPanel: React.FC<EducationalPanelProps> = ({
  primaryTactic = "Standard Verification",
  educationalSummary = "Analysis indicates no malicious indicators or social engineering patterns present in the email.",
}) => {
  return (
    <div className="rounded-xl bg-slate-800/50 backdrop-blur-md border border-slate-700/60 p-4 shadow-md space-y-3.5 transition-all duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-200">
              Forensic Analysis & EdTech Report
            </h2>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/50">
          Intelligence Brief
        </span>
      </div>

      {/* Primary Tactic Display */}
      <div className="space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Identified Attack / Communication Tactic
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2" />
            {primaryTactic || "Undetermined Technique"}
          </span>
        </div>
      </div>

      {/* Pedagogical Summary Body */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Behavioral & Deception Breakdown
        </div>
        <div className="rounded-lg bg-slate-900/70 border border-slate-700/50 p-3 text-xs leading-relaxed text-slate-300 font-normal">
          {educationalSummary || (
            <span className="text-slate-500 italic">
              No educational summary provided for this payload.
            </span>
          )}
        </div>
      </div>

      {/* EdTech Key Takeaways Footer */}
      <div className="flex items-start space-x-2 pt-1 text-[11px] text-slate-400">
        <svg
          className="w-3.5 h-3.5 mt-0.5 text-amber-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-slate-400">
          <strong className="text-slate-300 font-medium">Defense Tip:</strong>{" "}
          Always verify sender SPF/DKIM authentication and navigate to official accounts via bookmarks rather than embedded links.
        </span>
      </div>
    </div>
  );
};
