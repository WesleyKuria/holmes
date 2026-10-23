import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

// Universal Cybersecurity EdTech Schema Types
export interface FlaggedPhrase {
  phrase: string;
  reason: string;
  category?: string;
}

export type ThreatLevel = "Dangerous" | "Suspicious" | "Safe";

export interface UniversalAnalysisPayload {
  risk_score: number; // 0 to 100
  threat_level: ThreatLevel;
  primary_tactic: string;
  educational_summary: string;
  flagged_phrases: FlaggedPhrase[];
  raw_email?: string;
  sender?: string;
  subject?: string;
  // Legacy compatibility fields if needed
  phishing_score?: number;
  is_phishing?: boolean;
  brief_reason?: string;
  brand_impersonated?: string;
  observations?: Array<{ description?: string; severity: number; phrase?: string }>;
}

export type LLMResponseType = UniversalAnalysisPayload;

export type GeminiParams = {
  systemPrompt?: string;
  temperature?: number;
  topK?: number;
};

export const flaggedPhraseSchema = z.object({
  phrase: z.string().describe("The exact snippet or text phrase identified in the email"),
  reason: z.string().describe("Concise educational explanation of why this phrase is deceptive or risky"),
  category: z.string().optional().describe("Category e.g., Urgency, Credential Harvesting, Authority Impersonation, or Domain Spoofing"),
});

export const universalEmailSchema = z.object({
  risk_score: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall risk score from 0 (completely safe) to 100 (critical threat)"),
  threat_level: z
    .enum(["Dangerous", "Suspicious", "Safe"])
    .describe("Verdict rating: Dangerous (score >= 70), Suspicious (score 31-69), or Safe (score <= 30)"),
  primary_tactic: z
    .string()
    .describe("Primary social engineering or attack tactic used"),
  educational_summary: z
    .string()
    .describe("An analytical educational breakdown explaining the psychological vector, deceptive mechanics, and security lesson for the user"),
  flagged_phrases: z
    .array(flaggedPhraseSchema)
    .describe("Array of specific suspicious phrases found verbatim in the email text with pedagogical explanations"),
});

export const emailSchemaParser = StructuredOutputParser.fromZodSchema(universalEmailSchema);

export const systemPrompt = `You are "Holmes", an enterprise-grade cybersecurity threat analyst and EdTech AI assistant.
Your goal is to inspect incoming emails across any domain and provide an objective, educational threat assessment.

You must output valid JSON adhering strictly to this schema:
- risk_score: integer from 0 to 100
- threat_level: "Dangerous" (70-100), "Suspicious" (31-69), or "Safe" (0-30)
- primary_tactic: the core attack technique (or "Legitimate Communication" if benign)
- educational_summary: high-level breakdown of the social engineering mechanics, psychological levers (fear, greed, urgency, authority), and technical hygiene takeaways
- flagged_phrases: list of exact verbatim phrases found in the email that triggered indicators, each paired with an educational reason

${emailSchemaParser.getFormatInstructions()}`;
