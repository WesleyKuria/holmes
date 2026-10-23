import React, { useState, useMemo } from 'react';
import { Search, Eye, ListFilter, AlertCircle, Info } from 'lucide-react';
import type { FlaggedPhrase } from '../types';

interface EmailHighlighterProps {
  emailText?: string;
  flaggedPhrases?: FlaggedPhrase[];
}

interface TextSegment {
  text: string;
  isFlagged: boolean;
  phraseData?: FlaggedPhrase;
  index: number;
}

export const EmailHighlighter: React.FC<EmailHighlighterProps> = ({
  emailText = '',
  flaggedPhrases = [],
}) => {
  const [activeTooltipIdx, setActiveTooltipIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'highlighted' | 'breakdown'>('highlighted');

  // Text Parsing Utility: maps flagged_phrases directly onto raw email text preserving casing
  const segments: TextSegment[] = useMemo(() => {
    if (!emailText || !flaggedPhrases || flaggedPhrases.length === 0) {
      return [{ text: emailText || 'No email text available for inspection.', isFlagged: false, index: 0 }];
    }

    const validPhrases = flaggedPhrases
      .filter((fp) => fp && fp.phrase && fp.phrase.trim().length > 0)
      .sort((a, b) => b.phrase.length - a.phrase.length);

    if (validPhrases.length === 0) {
      return [{ text: emailText, isFlagged: false, index: 0 }];
    }

    interface MatchOccur {
      start: number;
      end: number;
      data: FlaggedPhrase;
    }

    const matches: MatchOccur[] = [];
    const lowerEmail = emailText.toLowerCase();

    for (const item of validPhrases) {
      const target = item.phrase.toLowerCase();
      let pos = 0;
      while ((pos = lowerEmail.indexOf(target, pos)) !== -1) {
        const start = pos;
        const end = pos + target.length;
        const hasOverlap = matches.some(
          (m) => (start >= m.start && start < m.end) || (end > m.start && end <= m.end)
        );
        if (!hasOverlap) {
          matches.push({ start, end, data: item });
        }
        pos += Math.max(1, target.length);
      }
    }

    matches.sort((a, b) => a.start - b.start);

    const result: TextSegment[] = [];
    let currentIndex = 0;

    matches.forEach((match) => {
      if (match.start > currentIndex) {
        result.push({
          text: emailText.slice(currentIndex, match.start),
          isFlagged: false,
          index: result.length,
        });
      }
      result.push({
        text: emailText.slice(match.start, match.end),
        isFlagged: true,
        phraseData: match.data,
        index: result.length,
      });
      currentIndex = match.end;
    });

    if (currentIndex < emailText.length) {
      result.push({
        text: emailText.slice(currentIndex),
        isFlagged: false,
        index: result.length,
      });
    }

    return result;
  }, [emailText, flaggedPhrases]);

  return (
    <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-sans">
              Interactive Micro Analysis: Flagged Text Mapping
            </h3>
            <p className="text-xs text-slate-400">
              Hover over highlighted indicators to reveal pedagogical deception rationale
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('highlighted')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'highlighted'
                ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Document Highlighting</span>
          </button>
          <button
            onClick={() => setViewMode('breakdown')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'breakdown'
                ? 'bg-slate-800 text-slate-100 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Clue Inventory ({flaggedPhrases.length})</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'highlighted' ? (
        <div className="relative rounded-xl bg-slate-950/90 border border-slate-800/90 p-5 min-h-[180px] max-h-[380px] overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed text-slate-300 whitespace-pre-wrap select-text">
          {segments.map((segment) => {
            if (!segment.isFlagged) {
              return <span key={segment.index}>{segment.text}</span>;
            }

            const isHovered = activeTooltipIdx === segment.index;

            return (
              <span
                key={segment.index}
                className="relative inline-block"
                onMouseEnter={() => setActiveTooltipIdx(segment.index)}
                onMouseLeave={() => setActiveTooltipIdx(null)}
              >
                {/* Highlighted text with semantic background tint & bottom border */}
                <mark
                  className="bg-rose-500/20 text-rose-300 font-semibold border-b-2 border-rose-500 rounded px-1.5 py-0.5 mx-0.5 cursor-pointer transition-all duration-200 hover:bg-rose-500/35 hover:text-rose-100 shadow-sm"
                  tabIndex={0}
                >
                  {segment.text}
                </mark>

                {/* Desktop Interactive Tooltip Card */}
                {isHovered && segment.phraseData && (
                  <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-72 sm:w-80 z-50 p-3.5 rounded-xl bg-slate-900 border border-rose-500/50 shadow-2xl backdrop-blur-xl pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse" />
                        Deceptive Trigger Identified
                      </span>
                      {segment.phraseData.category && (
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          {segment.phraseData.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-200 font-sans leading-relaxed">
                      {segment.phraseData.reason}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-slate-800 text-[9px] font-mono text-slate-500 italic">
                      Verbatim Match: "{segment.phraseData.phrase}"
                    </div>
                  </div>
                )}
              </span>
            );
          })}
        </div>
      ) : (
        /* Clue Inventory Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {flaggedPhrases && flaggedPhrases.length > 0 ? (
            flaggedPhrases.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 transition-all hover:border-rose-500/50 hover:bg-slate-950 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                    "{item.phrase}"
                  </span>
                  {item.category && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {item.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {item.reason}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-xs text-slate-500 font-mono">
              No specific flagged phrases detected in this sample.
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1 pt-1">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Click or hover phrases to interrogate attacker methodology
        </span>
        <span className="text-indigo-400 font-semibold">
          {flaggedPhrases.length} Clues Detected
        </span>
      </div>
    </div>
  );
};
