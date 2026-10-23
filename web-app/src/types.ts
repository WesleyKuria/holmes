export interface FlaggedPhrase {
  phrase: string;
  reason: string;
  category?: string;
}

export type ThreatLevel = 'Dangerous' | 'Suspicious' | 'Safe';

export interface UniversalAnalysisPayload {
  id?: string;
  timestamp?: string;
  risk_score: number; // 0 to 100
  threat_level: ThreatLevel;
  primary_tactic: string;
  educational_summary: string;
  flagged_phrases: FlaggedPhrase[];
  raw_email?: string;
  subject?: string;
  sender?: string;
  target_domain?: string;
}
