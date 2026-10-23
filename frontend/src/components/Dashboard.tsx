import React from "react";
import type { ThreatLevel } from "../global";

interface DashboardProps {
  riskScore: number; // 0 to 100
  threatLevel: ThreatLevel | string;
  flaggedCount?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  riskScore = 0,
  threatLevel = "Safe",
  flaggedCount = 0,
}) => {
  // Normalize score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, Math.round(riskScore)));

  // SVG Gauge calculations
  // Radius = 44, Circumference = 2 * PI * 44 ≈ 276.46
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Determine dynamic semantic colors based on threat level / score
  const getTheme = () => {
    const level = (threatLevel || "").toLowerCase();
    if (level === "dangerous" || normalizedScore >= 70) {
      return {
        stroke: "#f43f5e", // rose-500
        text: "text-rose-500",
        badgeBg: "bg-rose-500/10",
        badgeBorder: "border-rose-500/30",
        badgeText: "text-rose-400",
        label: "DANGEROUS",
        description: "Critical Threat Detected",
        icon: (
          <svg className="w-3.5 h-3.5 mr-1 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    } else if (level === "suspicious" || normalizedScore >= 31) {
      return {
        stroke: "#fbbf24", // amber-400
        text: "text-amber-400",
        badgeBg: "bg-amber-500/10",
        badgeBorder: "border-amber-500/30",
        badgeText: "text-amber-400",
        label: "SUSPICIOUS",
        description: "Caution Advised",
        icon: (
          <svg className="w-3.5 h-3.5 mr-1 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    } else {
      return {
        stroke: "#34d399", // emerald-400
        text: "text-emerald-400",
        badgeBg: "bg-emerald-500/10",
        badgeBorder: "border-emerald-500/30",
        badgeText: "text-emerald-400",
        label: "CLEARED / SAFE",
        description: "No Anomalies Found",
        icon: (
          <svg className="w-3.5 h-3.5 mr-1 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    }
  };

  const theme = getTheme();

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-800/40 backdrop-blur-md border border-slate-700/60 p-4 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Left Side: Macro Radial Gauge */}
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Track Circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-700/40"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Foreground Animated Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={theme.stroke}
                strokeWidth="8"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 6px ${theme.stroke}44)`,
                }}
              />
            </svg>

            {/* Inner Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black font-mono tracking-tighter ${theme.text}`}>
                {normalizedScore}
              </span>
              <span className="text-[9px] font-mono tracking-wider uppercase text-slate-400">
                / 100 RISK
              </span>
            </div>
          </div>

          {/* Verdict & Context */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
              Threat Evaluation
            </div>

            {/* Prominent Threat Badge */}
            <div
              className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-mono font-bold tracking-wider ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText} shadow-sm`}
            >
              {theme.icon}
              {theme.label}
            </div>

            <p className="text-xs text-slate-300 font-medium">
              {theme.description}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Forensic Metrics */}
        <div className="flex flex-col items-end justify-center space-y-2 border-l border-slate-700/50 pl-4">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-slate-400">
              Flagged Triggers
            </div>
            <div className="text-lg font-bold font-mono text-slate-100">
              {flaggedCount}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-slate-400">
              Scan Mode
            </div>
            <div className="text-xs font-mono font-semibold text-indigo-400">
              Real-time EdTech
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
