import React, { useState } from 'react';
import { Globe, ArrowRight, ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink } from 'lucide-react';

interface DomainCheckerProps {
  onAnalyzeDomain: (domain: string) => void;
  isLoading?: boolean;
}

export const DomainChecker: React.FC<DomainCheckerProps> = ({
  onAnalyzeDomain,
  isLoading = false,
}) => {
  const [domainInput, setDomainInput] = useState('');
  const [result, setResult] = useState<{
    domain: string;
    isSuspicious: boolean;
    threatScore: number;
    findings: string[];
  } | null>(null);

  const checkDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    let clean = domainInput.trim().toLowerCase();
    // Strip protocol and path if entered as URL
    clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split('?')[0];

    const findings: string[] = [];
    let score = 5;

    // Check suspicious TLDs
    const suspiciousTlds = ['.xyz', '.top', '.live', '.buzz', '.work', '.click', '.tk', '.ml', '.ga', '.cf', '.gq', '.icu'];
    if (suspiciousTlds.some(tld => clean.endsWith(tld))) {
      findings.push('Uses low-reputation top-level domain frequently associated with spam clusters.');
      score += 45;
    }

    // Check brand lookalike typosquatting
    const brandPretexts = ['login', 'verify', 'support', 'account', 'security', 'update', 'portal', 'auth', 'helpdesk'];
    if (brandPretexts.some(keyword => clean.includes(keyword) && !clean.endsWith('google.com') && !clean.endsWith('microsoft.com') && !clean.endsWith('apple.com'))) {
      findings.push(`Contains deceptive security keyword pattern: "${brandPretexts.find(k => clean.includes(k))}" on non-standard origin.`);
      score += 35;
    }

    // Multiple hyphens
    if ((clean.match(/-/g) || []).length >= 2) {
      findings.push('Multiple hyphens detected, a common indicator of domain spoofing and lookalikes.');
      score += 20;
    }

    // Punycode check
    if (clean.startsWith('xn--')) {
      findings.push('Internationalized Domain Name (IDN / Punycode) detected - potential homoglyph spoofing attack.');
      score += 40;
    }

    const finalScore = Math.min(100, score);
    const isSuspicious = finalScore >= 50;

    if (findings.length === 0) {
      findings.push('No obvious lookalikes or suspicious TLD anomalies flagged.');
    }

    setResult({
      domain: clean,
      isSuspicious,
      threatScore: finalScore,
      findings,
    });

    onAnalyzeDomain(clean);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={checkDomain} className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Globe className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="Enter URL or email domain (e.g., account-verify-microsoft.xyz, paypal.com)..."
            className="w-full pl-11 pr-28 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !domainInput.trim()}
            className="absolute inset-y-1.5 right-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <span>Scan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Instant Domain Assessment Result */}
      {result && (
        <div className={`p-4 rounded-xl border backdrop-blur-md transition-all ${
          result.isSuspicious
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
        }`}>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              {result.isSuspicious ? (
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              <span className="font-mono text-xs font-bold text-slate-100">
                {result.domain}
              </span>
            </div>

            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
              result.isSuspicious
                ? 'bg-rose-500/20 text-rose-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {result.threatScore}/100 Risk
            </span>
          </div>

          <ul className="space-y-1 text-xs text-slate-300">
            {result.findings.map((finding, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-slate-500 mt-0.5">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
