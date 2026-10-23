import React, { useState } from 'react';
import axios from 'axios';
import {
  FileText,
  Upload,
  Globe,
  Sparkles,
  Share2,
  RefreshCw,
  Terminal,
  ShieldAlert,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { Dashboard } from '../components/Dashboard';
import { EducationalPanel } from '../components/EducationalPanel';
import { EmailHighlighter } from '../components/EmailHighlighter';
import { FileDropzone } from '../components/FileDropzone';
import { DomainChecker } from '../components/DomainChecker';
import { ShareReportModal } from '../components/ShareReportModal';
import type { UniversalAnalysisPayload } from '../types';

const BACKEND_URL = 'http://127.0.0.1:8000/analyze/';

const DEFAULT_SAMPLE: UniversalAnalysisPayload = {
  id: '8f92a',
  timestamp: new Date().toISOString(),
  risk_score: 92,
  threat_level: 'Dangerous',
  primary_tactic: 'Credential Harvesting via Coercive Urgency',
  educational_summary:
    'The communication relies on an artificial 24-hour service disruption threat to bypass user verification protocols. The embedded link attempts to capture organizational credentials on an unauthenticated third-party portal.',
  flagged_phrases: [
    {
      phrase: 'account will be suspended within 24 hours',
      reason: 'Artificial time limit induces psychological panic, suppressing logical verification.',
      category: 'Urgency Coercion',
    },
    {
      phrase: 'click here to verify your identity',
      reason: 'Deceptive hyperlinked call-to-action redirecting to an unauthorized credential collection form.',
      category: 'Credential Harvesting',
    },
    {
      phrase: 'immediate action required',
      reason: 'Sensationalist authority pretext common in high-volume phishing templates.',
      category: 'Authority Impersonation',
    },
  ],
  raw_email:
    'From: IT Helpdesk <support@secure-auth-365.net>\nSubject: Immediate action required: Account Suspension Notice\n\nDear Corporate User,\n\nWe detected unauthorized login attempts on your workstation. Your account will be suspended within 24 hours unless verified.\n\nPlease click here to verify your identity and confirm your active credentials to prevent disruption.\n\nRegards,\nIT Security Center',
};

export const HomePage: React.FC = () => {
  const [inputTab, setInputTab] = useState<'text' | 'file' | 'domain'>('text');
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<UniversalAnalysisPayload | null>(DEFAULT_SAMPLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentReportId, setCurrentReportId] = useState('8f92a');

  const executeAnalysis = async (contentToAnalyze: string) => {
    if (!contentToAnalyze.trim()) {
      setErrorMessage('Please provide email text or upload an .eml file to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await axios.post(BACKEND_URL, {
        eml: contentToAnalyze,
      });

      const data = response.data;
      const newReportId = Math.random().toString(36).substring(2, 7);

      const formatted: UniversalAnalysisPayload = {
        id: newReportId,
        timestamp: new Date().toISOString(),
        risk_score: data.risk_score ?? 0,
        threat_level: data.threat_level ?? (data.risk_score > 60 ? 'Dangerous' : 'Safe'),
        primary_tactic: data.primary_tactic || 'Cyber Threat Intelligence Evaluation',
        educational_summary:
          data.educational_summary ||
          'Analysis completed. Review the highlighted indicators and defense recommendations below.',
        flagged_phrases: Array.isArray(data.flagged_phrases) ? data.flagged_phrases : [],
        raw_email: contentToAnalyze,
      };

      setAnalysisResult(formatted);
      setCurrentReportId(newReportId);

      // Save report in localStorage for report permalink
      localStorage.setItem(`holmes_report_${newReportId}`, JSON.stringify(formatted));
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err.response?.data?.detail ||
          'Could not reach the Holmes backend at http://127.0.0.1:8000. Please ensure the Python service is active.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeAnalysis(textInput);
  };

  const handleFileLoaded = (fileContent: string) => {
    setTextInput(fileContent);
    executeAnalysis(fileContent);
  };

  const handleDomainAnalyzed = (domain: string) => {
    const syntheticEmail = `From: Service Notification <alert@${domain}>\nSubject: Urgent Notification from ${domain}\n\nPlease verify your account immediately at http://${domain}/login. Failure to comply will result in account suspension within 24 hours.`;
    setTextInput(syntheticEmail);
    executeAnalysis(syntheticEmail);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 selection:bg-rose-500/30 selection:text-rose-100">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-10 border-b border-slate-900 bg-gradient-to-b from-slate-900/40 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dual-Platform Threat Intelligence Suite</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-100 max-w-3xl mx-auto">
            Forensic Email Threat Analysis & Cybersecurity EdTech
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Deconstruct phishing vectors, social engineering coercive pressure, and credential theft mechanics in real time with high-precision AI diagnostics.
          </p>
        </div>
      </section>

      {/* Main Analysis Hub */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 space-y-8">
        {/* Glassmorphic Central Analysis Card */}
        <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Input Method Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setInputTab('text')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center space-x-2 ${
                  inputTab === 'text'
                    ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Text Input</span>
              </button>

              <button
                onClick={() => setInputTab('file')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center space-x-2 ${
                  inputTab === 'file'
                    ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>File Upload (.eml)</span>
              </button>

              <button
                onClick={() => setInputTab('domain')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center space-x-2 ${
                  inputTab === 'domain'
                    ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Domain Checker</span>
              </button>
            </div>

            {/* Quick Test Samples Picker */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-slate-500 hidden sm:inline">Presets:</span>
              <button
                onClick={() => {
                  setInputTab('text');
                  setTextInput(
                    'From: Microsoft 365 Team <security@office-verify-365.net>\nSubject: Password Expiry Notification\n\nYour work account password expires in 12 hours. You must login to confirm your credentials immediately to avoid system lockout.\n\nClick here to verify password.'
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] transition"
              >
                Office 365
              </button>
              <button
                onClick={() => {
                  setInputTab('text');
                  setTextInput(
                    'From: Chief Executive <ceo-exec-office@corp-wire-transfer.org>\nSubject: Urgent: Confidential Supplier Payment\n\nPlease process an urgent wire transfer of $68,500 immediately today per the attached invoice. Do not contact me by phone as I am in confidential investor discussions.'
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] transition"
              >
                CEO Wire BEC
              </button>
              <button
                onClick={() => {
                  setInputTab('text');
                  setTextInput(
                    'From: GitHub Support <notifications@github.com>\nSubject: [GitHub] Security advisory alert for your repository\n\nHi,\nA new Dependabot security alert was found in your repository dependencies.\nLog in to your dashboard to review the remediation advisory.'
                  );
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-[11px] transition"
              >
                Safe Notice
              </button>
            </div>
          </div>

          {/* Tab 1: Text Input Area */}
          {inputTab === 'text' && (
            <form onSubmit={handleTextSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste raw email body, RFC 822 headers, or suspicious text here to interrogate..."
                  className="w-full h-44 sm:h-52 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-y shadow-inner"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs font-mono text-slate-500">
                  PII is pre-redacted before forensic analysis to safeguard privacy
                </span>

                <button
                  type="submit"
                  disabled={isAnalyzing || !textInput.trim()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Interrogating Threat Payload...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Threat Analysis</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: File Upload Zone */}
          {inputTab === 'file' && (
            <div className="space-y-4">
              <FileDropzone onFileLoaded={handleFileLoaded} isLoading={isAnalyzing} />
            </div>
          )}

          {/* Tab 3: Domain Reputation Checker */}
          {inputTab === 'domain' && (
            <div className="space-y-4">
              <DomainChecker onAnalyzeDomain={handleDomainAnalyzed} isLoading={isAnalyzing} />
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center space-x-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Real-time Threat Intelligence Results Section */}
        {analysisResult && (
          <section className="space-y-6 pt-4">
            {/* Action Bar with "Generate Shareable Report" */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Forensic Assessment Dossier:</span>
                <span className="font-bold text-slate-200">#{currentReportId}</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-semibold transition flex items-center space-x-2 shadow-sm"
                >
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span>Generate Shareable Report</span>
                </button>
              </div>
            </div>

            {/* 1. Macro Dashboard Component */}
            <Dashboard
              riskScore={analysisResult.risk_score}
              threatLevel={analysisResult.threat_level}
              flaggedCount={analysisResult.flagged_phrases?.length ?? 0}
              primaryTactic={analysisResult.primary_tactic}
            />

            {/* 2. Educational Summary Panel Component */}
            <EducationalPanel
              primaryTactic={analysisResult.primary_tactic}
              educationalSummary={analysisResult.educational_summary}
            />

            {/* 3. Micro Analysis: Interactive Flagged Text Parsing */}
            <EmailHighlighter
              emailText={analysisResult.raw_email || textInput}
              flaggedPhrases={analysisResult.flagged_phrases}
            />
          </section>
        )}
      </main>

      {/* Share Report Modal */}
      {analysisResult && (
        <ShareReportModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          reportData={analysisResult}
          reportId={currentReportId}
        />
      )}
    </div>
  );
};
