import React, { useState, useMemo } from "react";
import type { FlaggedPhrase } from "../global";

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
  emailText = "",
  flaggedPhrases = [],
}) => {
  const [activeTooltipIdx, setActiveTooltipIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"highlighted" | "breakdown">("highlighted");

  // Robust Text Parsing Utility: maps flagged_phrases directly onto raw email text
  const segments: TextSegment[] = useMemo(() => {
    if (!emailText || !flaggedPhrases || flaggedPhrases.length === 0) {
      return [{ text: emailText || "No email text provided for inspection.", isFlagged: false, index: 0 }];
    }

    // Filter valid non-empty phrases and sort descending by length to match longest matches first
    const validPhrases = flaggedPhrases
      .filter((fp) => fp && fp.phrase && fp.phrase.trim().length > 0)
      .sort((a, b) => b.phrase.length - a.phrase.length);

    if (validPhrases.length === 0) {
      return [{ text: emailText, isFlagged: false, index: 0 }];
    }

    // Find all occurrences with start & end offsets
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

        // Verify it doesn't overlap with an existing longer match
        const hasOverlap = matches.some(
          (m) => (start >= m.start && start < m.end) || (end > m.start && end <= m.end)
        );

        if (!hasOverlap) {
          matches.push({ start, end, data: item });
        }
        pos += Math.max(1, target.length);
      }
    }

    // Sort matches in ascending chronological order of start position
    matches.sort((a, b) => a.start - b.start);

    // Build segments
    const result: TextSegment[] = [];
    let currentIndex = 0;

    matches.forEach((match, idx) => {
      // Unflagged preceding text
      if (match.start > currentIndex) {
        result.push({
          text: emailText.slice(currentIndex, match.start),
          isFlagged: false,
          index: result.length,
        });
      }

      // Flagged highlighted phrase
      result.push({
        text: emailText.slice(match.start, match.end),
        isFlagged: true,
        phraseData: match.data,
        index: result.length,
      });

      currentIndex = match.end;
    });

    // Trailing unflagged text
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
    <div className="rounded-xl bg-slate-800/50 backdrop-blur-md border border-slate-700/60 p-4 shadow-md space-y-3 transition-all duration-300">
      {/* Header and Toggle Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-200">
              Micro Analysis: Flagged Text Forensics
            </h3>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-700/60">
          <button
            onClick={() => setViewMode("highlighted")}
            className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
              viewMode === "highlighted"
                ? "bg-slate-700 text-slate-100 font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Inline Text
          </button>
          <button
            onClick={() => setViewMode("breakdown")}
            className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
              viewMode === "breakdown"
                ? "bg-slate-700 text-slate-100 font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Clue List ({flaggedPhrases.length})
          </button>
        </div>
      </div>

      {/* Mode 1: Interactive Highlighted Inline Text */}
      {viewMode === "highlighted" ? (
        <div className="relative rounded-lg bg-slate-950/80 border border-slate-800 p-3.5 max-h-56 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap select-text">
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
                  className="bg-rose-500/20 text-rose-300 font-semibold border-b-2 border-rose-500 rounded px-1 py-0.5 mx-0.5 cursor-pointer transition-all duration-200 hover:bg-rose-500/35 hover:text-rose-100 shadow-sm"
                  tabIndex={0}
                >
                  {segment.text}
                </mark>

                {/* Interactive Tooltip Card */}
                {isHovered && segment.phraseData && (
                  <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 z-50 p-2.5 rounded-lg bg-slate-900 border border-rose-500/40 shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse" />
                        Flagged Indicator
                      </span>
                      {segment.phraseData.category && (
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1 rounded">
                          {segment.phraseData.category}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-200 font-sans leading-tight">
                      {segment.phraseData.reason}
                    </p>
                    <div className="mt-1 text-[8px] font-mono text-slate-500 italic">
                      Matched: "{segment.phraseData.phrase}"
                    </div>
                  </div>
                )}
              </span>
            );
          })}
        </div>
      ) : (
        /* Mode 2: Structured Clue Breakdown List */
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {flaggedPhrases && flaggedPhrases.length > 0 ? (
            flaggedPhrases.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-slate-900/70 border border-slate-700/60 p-2.5 transition-all hover:border-rose-500/50 hover:bg-slate-900 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                    <span className="w-1 h-1 rounded-full bg-rose-500 mr-1" />
                    "{item.phrase}"
                  </span>
                  {item.category && (
                    <span className="text-[9px] font-mono text-slate-400">
                      {item.category}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-normal font-sans">
                  {item.reason}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 font-mono">
              No specific flagged phrases detected in this sample.
            </div>
          )}
        </div>
      )}

      {/* Micro-Instructions */}
      <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between px-1">
        <span>Hover over highlighted phrases to inspect attack reasoning</span>
        <span className="text-indigo-400 font-semibold">
          {flaggedPhrases.length} Clues Detected
        </span>
      </div>
    </div>
  );
};
