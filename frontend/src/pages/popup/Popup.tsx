import React, { useState, useEffect } from "react";
import axios from "axios";
import { Header } from "../../components/Header";
import { Dashboard } from "../../components/Dashboard";
import { EducationalPanel } from "../../components/EducationalPanel";
import { EmailHighlighter } from "../../components/EmailHighlighter";
import type { UniversalAnalysisPayload } from "../../global";

const BACKEND_ANALYZE_URL = "http://127.0.0.1:8000/analyze/";

// Default initial state adhering strictly to the universal schema
const DEFAULT_PAYLOAD: UniversalAnalysisPayload = {
  risk_score: 88,
  threat_level: "Dangerous",
  primary_tactic: "Deceptive Credential Harvesting via Urgency Coercion",
  educational_summary:
    "This email exemplifies high-pressure social engineering. Attackers fabricate an immediate account suspension deadline to induce panic, forcing the recipient to click an unverified verification link without validating the actual domain headers.",
  flagged_phrases: [
    {
      phrase: "account will be suspended within 24 hours",
      reason: "Artificial time urgency designed to bypass critical thinking and force impulsive compliance.",
      category: "Urgency Coercion",
    },
    {
      phrase: "click here to verify your identity",
      reason: "Deceptive call-to-action directing recipient to an unauthenticated external login portal.",
      category: "Credential Harvesting",
    },
    {
      phrase: "immediate action required",
      reason: "Sensationalist phrasing used to simulate organizational or administrative authority.",
      category: "Authority Impersonation",
    },
  ],
  raw_email:
    "From: IT Security Team <security-alert@external-cloud-verify.net>\nSubject: Immediate action required: Account Suspension Notice\n\nDear User,\n\nWe detected suspicious activities on your corporate account. Your account will be suspended within 24 hours if no response is received.\n\nPlease click here to verify your identity and confirm your active credentials to prevent disruption.\n\nRegards,\nIT Security Center",
};

export default function Popup(): JSX.Element {
  const [analysis, setAnalysis] = useState<UniversalAnalysisPayload | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"report" | "scanner">("report");
  const [emailInput, setEmailInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read incoming real-time inferences from Chrome storage
  const syncStorageInference = () => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["inferenceResult", "rawEmailText"], (items) => {
        if (items.inferenceResult) {
          const res = items.inferenceResult;
          // Ensure smooth fallback mapping for schema compatibility
          const normalized: UniversalAnalysisPayload = {
            risk_score:
              res.risk_score !== undefined
                ? res.risk_score
                : res.phishing_score !== undefined
                ? res.phishing_score * 10
                : 0,
            threat_level:
              res.threat_level ||
              (res.is_phishing ? "Dangerous" : res.risk_score > 30 ? "Suspicious" : "Safe"),
            primary_tactic:
              res.primary_tactic ||
              (res.brand_impersonated
                ? `Impersonation of ${res.brand_impersonated}`
                : "Social Engineering Analysis"),
            educational_summary:
              res.educational_summary ||
              res.brief_reason ||
              "No educational summary provided for this scan.",
            flagged_phrases:
              res.flagged_phrases ||
              (res.observations
                ? res.observations.map((obs: any) => ({
                    phrase: obs.phrase || obs.description?.slice(0, 35) || "Flagged Indicator",
                    reason: obs.description || "Suspicious anomaly detected",
                    category: obs.severity === 3 ? "Critical" : "Warning",
                  }))
                : []),
            raw_email: items.rawEmailText || res.raw_email || "",
          };

          setAnalysis(normalized);
        } else if (!analysis) {
          // Provide default analytical payload on fresh mount
          setAnalysis(DEFAULT_PAYLOAD);
        }
      });
    } else if (!analysis) {
      setAnalysis(DEFAULT_PAYLOAD);
    }
  };

  useEffect(() => {
    syncStorageInference();

    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
      const handleRuntimeMessage = (message: any) => {
        if (message.action === "receivedInference") {
          syncStorageInference();
        }
      };
      chrome.runtime.onMessage.addListener(handleRuntimeMessage);
      return () => {
        chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
      };
    }
  }, []);

  // Run real-time analysis against any real email text via Holmes backend
  const handleAnalyzeEmail = async () => {
    if (!emailInput.trim()) {
      setErrorMessage("Please paste an email body or headers to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await axios.post(BACKEND_ANALYZE_URL, {
        eml: emailInput,
      });

      const data = response.data;
      const formattedResult: UniversalAnalysisPayload = {
        risk_score: data.risk_score ?? 0,
        threat_level: data.threat_level ?? (data.risk_score > 60 ? "Dangerous" : "Safe"),
        primary_tactic: data.primary_tactic || "Cybersecurity Behavioral Evaluation",
        educational_summary:
          data.educational_summary ||
          "Analytical breakdown completed without detailed notes.",
        flagged_phrases: Array.isArray(data.flagged_phrases) ? data.flagged_phrases : [],
        raw_email: emailInput,
      };

      setAnalysis(formattedResult);
      setActiveTab("report");

      // Save to Chrome local storage if available
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          inferenceResult: formattedResult,
          rawEmailText: emailInput,
        });
      }
    } catch (err: any) {
      console.error("Analysis request error:", err);
      setErrorMessage(
        err.response?.data?.detail || "Could not connect to Holmes backend at http://127.0.0.1:8000"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-[390px] min-h-[580px] bg-slate-900 text-slate-100 flex flex-col font-sans border border-slate-800 shadow-2xl selection:bg-rose-500/30 selection:text-rose-100">
      {/* 1. Header with Live Pulsing Indicator */}
      <Header
        isAnalyzing={isAnalyzing}
        statusText={isAnalyzing ? "Analyzing Payload..." : "Engine Active"}
      />

      {/* Navigation Sub-bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("report")}
            className={`px-3 py-1 rounded-md font-mono text-xs transition-all ${
              activeTab === "report"
                ? "bg-slate-800 text-slate-100 font-semibold border border-slate-700/80 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Forensic Report
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`px-3 py-1 rounded-md font-mono text-xs transition-all flex items-center space-x-1.5 ${
              activeTab === "scanner"
                ? "bg-slate-800 text-slate-100 font-semibold border border-slate-700/80 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Custom Scanner</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          </button>
        </div>

        <button
          onClick={() => {
            if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
              chrome.storage.local.clear();
            }
            setAnalysis(DEFAULT_PAYLOAD);
          }}
          title="Reset to default payload"
          className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition"
        >
          Reset View
        </button>
      </div>

      {/* Main View Area */}
      <main className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
        {activeTab === "report" ? (
          analysis ? (
            <>
              {/* 2. Macro Dashboard with SVG Radial Gauge */}
              <Dashboard
                riskScore={analysis.risk_score}
                threatLevel={analysis.threat_level}
                flaggedCount={analysis.flagged_phrases?.length ?? 0}
              />

              {/* 3. Educational Summary Card */}
              <EducationalPanel
                primaryTactic={analysis.primary_tactic}
                educationalSummary={analysis.educational_summary}
              />

              {/* 4. Micro Analysis: Interactive Flagged Text Highlighter */}
              <EmailHighlighter
                emailText={analysis.raw_email || DEFAULT_PAYLOAD.raw_email}
                flaggedPhrases={analysis.flagged_phrases}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center animate-pulse">
                <svg
                  className="w-6 h-6 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-xs font-mono">No active analysis payload available.</p>
            </div>
          )
        ) : (
          /* Live Custom Email Scanner Tab */
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-800/40 backdrop-blur-md border border-slate-700/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-200">
                  Universal Email Interrogator
                </h3>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Live Test Sandbox
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Paste any real email text (corporate alerts, invoices, password resets, or benign
                newsletters) below to execute real-time EdTech analysis.
              </p>

              <textarea
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Paste raw email text or headers here to test (e.g., 'From: IT Support...')"
                className="w-full h-36 p-3 rounded-lg bg-slate-950/80 border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
              />

              {errorMessage && (
                <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  disabled={isAnalyzing}
                  onClick={handleAnalyzeEmail}
                  className={`flex-1 py-2 px-4 rounded-lg font-mono text-xs font-semibold text-white transition-all shadow-md flex items-center justify-center space-x-2 ${
                    isAnalyzing
                      ? "bg-slate-700 cursor-not-allowed text-slate-400"
                      : "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] border border-indigo-400/30"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      <span>Interrogating Payload...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>Run Holmes Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Test Samples */}
            <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-3 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Load Diverse Sample Scenarios:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <button
                  onClick={() =>
                    setEmailInput(
                      "From: Microsoft Security <alert@account-verify-portal365.com>\nSubject: Immediate action required: Verify your password\n\nYour account has been locked due to multiple failed login attempts. You must login to restore your access within 24 hours. Failure to comply will result in permanent account termination.\n\nClick here to verify your credentials now."
                    )
                  }
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-left truncate"
                >
                  ⚡ Microsoft 365 Phish
                </button>

                <button
                  onClick={() =>
                    setEmailInput(
                      "From: CFO Office <cfo-exec-office@company-finance-wire.org>\nSubject: Urgent: Confidential Wire Transfer\n\nPlease process an urgent wire transfer of $45,000 for our supplier invoice immediately today. Ensure banking details are confirmed via the attached invoice. Do not call, I am in a board meeting."
                    )
                  }
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-left truncate"
                >
                  💼 Executive BEC Wire
                </button>

                <button
                  onClick={() =>
                    setEmailInput(
                      "From: HR Department <hr@company-payroll-portal.net>\nSubject: Action Required: Update Direct Deposit Information\n\nAll employees must confirm their banking information for this month's payroll. Click the link below to access your employee portal and avoid delays in payment remittance."
                    )
                  }
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-left truncate"
                >
                  💳 Payroll Diversion
                </button>

                <button
                  onClick={() =>
                    setEmailInput(
                      "From: GitHub <notifications@github.com>\nSubject: [GitHub] A personal access token has been generated\n\nHi Wesley,\n\nA new personal access token (classic) was recently created on your account with repo scope.\n\nIf you created this token, no further action is required. If you did not generate this token, please visit your account settings to revoke it."
                    )
                  }
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-left truncate"
                >
                  🛡️ Legitimate Security Alert
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding Bar */}
      <footer className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Holmes Cybersecurity EdTech</span>
        <span className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Local Engine Active</span>
        </span>
      </footer>
    </div>
  );
}
