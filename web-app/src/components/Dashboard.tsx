import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Activity, FileSearch, Target } from 'lucide-react';
import type { ThreatLevel } from '../types';

interface DashboardProps {
  riskScore: number;
  threatLevel: ThreatLevel | string;
  flaggedCount?: number;
  primaryTactic?: string;
  sender?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  riskScore = 0,
  threatLevel = 'Safe',
  flaggedCount = 0,
  primaryTactic = 'Standard Communication',
  sender,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(riskScore)));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const getTheme = () => {
    const level = (threatLevel || '').toLowerCase();
    if (level === 'dangerous' || normalizedScore >= 70) {
      return {
        stroke: '#f43f5e', // rose-500
        text: 'text-rose-500',
        badgeBg: 'bg-rose-500/10',
        badgeBorder: 'border-rose-500/30',
        badgeText: 'text-rose-400',
        glow: 'shadow-glow-rose',
        label: 'DANGEROUS ATTACK VECTOR',
        tag: 'CRITICAL THREAT',
        icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
        statusNotice: 'Immediate defensive action required. Malicious payload or phishing intent detected.',
      };
    } else if (level === 'suspicious' || normalizedScore >= 31) {
      return {
        stroke: '#fbbf24', // amber-400
        text: 'text-amber-400',
        badgeBg: 'bg-amber-500/10',
        badgeBorder: 'border-amber-500/30',
        badgeText: 'text-amber-400',
        glow: 'shadow-amber-500/10',
        label: 'SUSPICIOUS PATTERNS IDENTIFIED',
        tag: 'CAUTION ADVISED',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        statusNotice: 'Potential social engineering or unverified external sender indicators present.',
      };
    } else {
      return {
        stroke: '#34d399', // emerald-400
        text: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/10',
        badgeBorder: 'border-emerald-500/30',
        badgeText: 'text-emerald-400',
        glow: 'shadow-glow-emerald',
        label: 'CLEARED / AUTHENTIC COMMUNICATION',
        tag: 'CLEARED SAFE',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        statusNotice: 'No coercive urgency, credential theft hooks, or domain spoofing detected.',
      };
    }
  };

  const theme = getTheme();

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 shadow-2xl transition-all duration-300 ${theme.glow}`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Side: Radial Gauge (4 cols on desktop) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-2 border-b md:border-b-0 md:border-r border-slate-800/80 pb-6 md:pb-0 md:pr-6">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
              {/* Background Track */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="stroke-slate-800/60"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={theme.stroke}
                strokeWidth="10"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 10px ${theme.stroke}55)`,
                }}
              />
            </svg>

            {/* Central Score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-black font-mono tracking-tight ${theme.text}`}>
                {normalizedScore}
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 mt-0.5">
                / 100 RISK
              </span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Macro Risk Index
            </span>
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold tracking-wider ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}>
              {theme.icon}
              <span>{theme.tag}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Threat Overview & Forensic Telemetry (8 cols on desktop) */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Forensic Verdict & Classification
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                AI Pipeline v2.0
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
              {theme.label}
            </h2>

            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              {theme.statusNotice}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3">
              <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1 mb-1">
                <Target className="w-3 h-3 text-indigo-400" />
                Primary Vector
              </div>
              <div className="text-xs font-semibold text-slate-200 truncate" title={primaryTactic}>
                {primaryTactic}
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3">
              <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1 mb-1">
                <FileSearch className="w-3 h-3 text-rose-400" />
                Flagged Signals
              </div>
              <div className="text-xs font-mono font-bold text-slate-200">
                {flaggedCount} Indicators Found
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3">
              <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1 mb-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                Confidence
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400">
                High Precision (AI + Rules)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
