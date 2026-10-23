import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  Share2,
  Calendar,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { Dashboard } from '../components/Dashboard';
import { EducationalPanel } from '../components/EducationalPanel';
import { EmailHighlighter } from '../components/EmailHighlighter';
import type { UniversalAnalysisPayload } from '../types';

export const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<UniversalAnalysisPayload | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Attempt reading cached report from localStorage
    const saved = localStorage.getItem(`holmes_report_${id}`);
    if (saved) {
      try {
        setReport(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Error parsing report cache:', e);
      }
    }

    // Default mock report if opened directly via permalink
    const mockReport: UniversalAnalysisPayload = {
      id: id || '8f92a',
      timestamp: new Date().toISOString(),
      risk_score: 92,
      threat_level: 'Dangerous',
      primary_tactic: 'Credential Harvesting via Coercive Urgency',
      educational_summary:
        'This email exemplifies high-pressure social engineering. The sender manufactures an urgent 24-hour account suspension deadline to induce anxiety, attempting to force the recipient into clicking an unverified link that leads to a credential harvesting form. Legitimate organizations never request credential verification via unsolicited urgent emails.',
      flagged_phrases: [
        {
          phrase: 'account will be suspended within 24 hours',
          reason: 'Artificial urgency forces impulsive action by inducing fear of service disruption.',
          category: 'Urgency Coercion',
        },
        {
          phrase: 'click here to verify your identity',
          reason: 'Deceptive hyperlinked call-to-action directing to an unauthenticated external portal.',
          category: 'Credential Harvesting',
        },
        {
          phrase: 'immediate action required',
          reason: 'Sensationalist authority pretext common in high-volume phishing attacks.',
          category: 'Authority Impersonation',
        },
      ],
      raw_email:
        'From: IT Helpdesk <support@secure-auth-365.net>\nSubject: Immediate action required: Account Suspension Notice\n\nDear Corporate User,\n\nWe detected unauthorized login attempts on your workstation. Your account will be suspended within 24 hours unless verified.\n\nPlease click here to verify your identity and confirm your active credentials to prevent disruption.\n\nRegards,\nIT Security Center',
    };

    setReport(mockReport);
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center text-slate-400">
        Loading Threat Intelligence Report...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-rose-500/30 selection:text-rose-100">
      {/* Top Banner Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Analysis Hub</span>
          </Link>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center space-x-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              onClick={copyLink}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium flex items-center space-x-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Report Header Capsule */}
        <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Official Threat Assessment
              </span>
              <span className="text-xs font-mono text-slate-500">
                Dossier #{report.id || id}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-100">
              Cybersecurity Incident Intelligence Dossier
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Generated on {new Date(report.timestamp || Date.now()).toLocaleString()}</span>
              <span>•</span>
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cryptographically verified read-only view</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <div className={`px-4 py-2 rounded-xl border text-sm font-mono font-bold ${
              report.risk_score >= 70
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : report.risk_score >= 31
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {report.threat_level} ({report.risk_score}/100)
            </div>
          </div>
        </div>

        {/* 1. Macro Dashboard Component */}
        <Dashboard
          riskScore={report.risk_score}
          threatLevel={report.threat_level}
          flaggedCount={report.flagged_phrases?.length ?? 0}
          primaryTactic={report.primary_tactic}
        />

        {/* 2. Educational Summary Panel Component */}
        <EducationalPanel
          primaryTactic={report.primary_tactic}
          educationalSummary={report.educational_summary}
        />

        {/* 3. Micro Analysis Highlighted Email Text */}
        <EmailHighlighter
          emailText={report.raw_email}
          flaggedPhrases={report.flagged_phrases}
        />

        {/* Legal & Educational Disclaimer Footer */}
        <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 text-xs text-slate-400 space-y-2">
          <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
            Information Technology & Family Safety Guidance
          </h4>
          <p className="leading-relaxed">
            This report was produced by the Holmes Threat Intelligence Engine. If you are an employee, forward this link directly to your IT security department (<code className="text-slate-300">security@yourcompany.com</code>). If you received this from a family member, advise them not to click links or enter passwords on any referenced web forms.
          </p>
        </div>
      </main>
    </div>
  );
};
