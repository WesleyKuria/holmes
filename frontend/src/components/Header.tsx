import React from "react";

interface HeaderProps {
  statusText?: string;
  isAnalyzing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  statusText = "AI Engine Active",
  isAnalyzing = true,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 shadow-sm transition-all duration-300">
      <div className="flex items-center space-x-2.5">
        {/* Shield / Detective Icon */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-slate-800 border border-indigo-500/30 shadow-inner">
          <svg
            className="w-4 h-4 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-bold tracking-wider uppercase text-slate-100 font-sans">
              Holmes
            </h1>
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-medium text-slate-400 bg-slate-800/80 rounded border border-slate-700/60 uppercase">
              v2.0 EdTech
            </span>
          </div>
          <p className="text-[10px] text-slate-400 tracking-tight">
            Cyber Threat Intelligence & Pedagogical Analysis
          </p>
        </div>
      </div>

      {/* Real-time Engine Status Indicator */}
      <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-700/60 shadow-sm">
        <span className="relative flex h-2 w-2">
          {isAnalyzing && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isAnalyzing ? "bg-emerald-400" : "bg-slate-500"
            }`}
          />
        </span>
        <span className="text-[11px] font-mono font-medium text-slate-300">
          {statusText}
        </span>
      </div>
    </header>
  );
};
