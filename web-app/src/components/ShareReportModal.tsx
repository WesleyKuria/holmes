import React, { useState } from 'react';
import { X, Copy, Check, Share2, ExternalLink, Mail, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UniversalAnalysisPayload } from '../types';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: UniversalAnalysisPayload;
  reportId: string;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  reportId,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = window.location.origin;
  const localReportUrl = `${origin}/report/${reportId}`;
  const vanityUrl = `https://holmes.ai/report/${reportId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(localReportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const itEmailSubject = encodeURIComponent(`[Security Review Request] Suspicious Email Alert - Holmes Threat Score: ${reportData.risk_score}/100`);
  const itEmailBody = encodeURIComponent(
    `Hello Security Team,\n\nI analyzed an incoming email with Holmes Threat Intelligence. It received a ${reportData.risk_score}/100 Risk Score (${reportData.threat_level}).\n\nIdentified Tactic: ${reportData.primary_tactic}\n\nView the complete forensic breakdown here:\n${localReportUrl}\n\nPlease advise if further containment is required.\n`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Share Threat Intelligence Dossier
            </h3>
            <p className="text-xs text-slate-400">
              Generated shareable threat assessment for IT teams or family members
            </p>
          </div>
        </div>

        {/* Report Overview Capsule */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Dossier ID</span>
            <span className="text-slate-200 font-bold">#{reportId}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Risk Score</span>
            <span className={`font-bold ${
              reportData.risk_score >= 70
                ? 'text-rose-400'
                : reportData.risk_score >= 31
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}>
              {reportData.risk_score}/100 ({reportData.threat_level})
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Status</span>
            <span className="text-emerald-400 font-semibold">Published</span>
          </div>
        </div>

        {/* Public Shareable Link Input */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Shareable URL
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={localReportUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 select-all focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold transition flex items-center space-x-1.5 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Also alias-mapped to vanity URL: <code className="text-slate-400">{vanityUrl}</code>
          </span>
        </div>

        {/* Direct Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-3">
          <Link
            to={`/report/${reportId}`}
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium flex items-center justify-center space-x-2 border border-slate-700 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Report Page</span>
          </Link>

          <a
            href={`mailto:security@company.com?subject=${itEmailSubject}&body=${itEmailBody}`}
            className="py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-mono font-medium flex items-center justify-center space-x-2 transition"
          >
            <Mail className="w-4 h-4 text-rose-400" />
            <span>Forward to IT Dept</span>
          </a>
        </div>
      </div>
    </div>
  );
};
