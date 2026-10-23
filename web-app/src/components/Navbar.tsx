import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Sparkles, ExternalLink, Terminal, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 via-slate-900 to-indigo-950 border border-indigo-500/40 shadow-inner group-hover:border-indigo-400 transition-colors">
            <Shield className="w-5 h-5 text-indigo-400 group-hover:scale-105 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-wider text-slate-100 font-sans">
                HOLMES
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold text-indigo-400 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                PLATFORM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block">
              Cybersecurity Threat Intelligence & EdTech Forensics
            </p>
          </div>
        </Link>

        {/* Navigation & Status */}
        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                location.pathname === '/'
                  ? 'bg-slate-800/90 text-indigo-300 border border-slate-700/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Analysis Hub
            </Link>
          </nav>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Engine indicator */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>FastAPI: Online (8000)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
