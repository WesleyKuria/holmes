from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field


class FlaggedPhrase(BaseModel):
    phrase: str = Field(
        description="The exact snippet or text phrase identified verbatim in the email text"
    )
    reason: str = Field(
        description="Clear educational explanation of why this phrase is deceptive, coercive, or suspicious"
    )
    category: str = Field(
        default="Social Engineering",
        description="Attack category e.g., Urgency, Credential Harvesting, Authority Impersonation, or Link Manipulation",
    )


class UniversalEmailAnalysis(BaseModel):
    risk_score: int = Field(
        description="Overall threat risk score from 0 (completely safe) to 100 (critical threat)"
    )
    threat_level: str = Field(
        description="Verdict level: exactly one of 'Dangerous' (score >= 70), 'Suspicious' (score 31-69), or 'Safe' (score <= 30)"
    )
    primary_tactic: str = Field(
        description="The primary attack tactic or psychological mechanism used (e.g., Credential Harvesting, Executive Impersonation, Invoice Fraud, Coercive Urgency, or Legitimate Communication)"
    )
    educational_summary: str = Field(
        description="A comprehensive, high-level analytical breakdown explaining why the email is dangerous or safe, what psychological triggers are used, and key security hygiene takeaways"
    )
    flagged_phrases: list[FlaggedPhrase] = Field(
        default_factory=list,
        description="List of specific phrases flagged in the email text, paired with educational reasoning",
    )


CONTEXT = """You are "Holmes", an enterprise-grade cybersecurity threat analyst and EdTech AI assistant.
Your goal is to inspect incoming emails across ANY domain, industry, or organization (corporate spear-phishing, credential harvesting, invoice scams, IT helpdesk impersonation, delivery notices, executive wire fraud, or benign transactional emails) and provide an objective, educational threat assessment.

You must output valid JSON adhering strictly to this schema:
- risk_score: integer from 0 to 100 (0 = completely legitimate, 100 = critical threat)
- threat_level: "Dangerous" (70-100), "Suspicious" (31-69), or "Safe" (0-30)
- primary_tactic: the core attack technique (or "Legitimate Communication" if benign)
- educational_summary: high-level breakdown of the social engineering mechanics, psychological levers (fear, greed, urgency, authority), and technical hygiene takeaways
- flagged_phrases: list of exact verbatim phrases found in the email that triggered indicators, each paired with an educational reason and category

Ensure that any flagged phrases match verbatim text present in the email so they can be highlighted in the UI.
If the email is legitimate and harmless, set risk_score below 20, threat_level to 'Safe', primary_tactic to 'Legitimate Communication', and provide an educational summary explaining why it is safe (e.g., legitimate authentication, expected transactional notice, lack of urgency/coercion).
"""

TEMPLATE = """
Email: {query_str}
Answer: 
"""

PARSER = JsonOutputParser(pydantic_object=UniversalEmailAnalysis)


def get_prompt(query_str):
    """"""
    prompt = [
        {
            "role": "system",
            "content": (
                f"{CONTEXT}\n"
                + f"{PARSER.get_format_instructions()}\n"
                + "Provide an objective, high-precision analysis."
            ),
        },
    ]
    prompt.append(
        {
            "role": "user",
            "content": TEMPLATE.format(query_str=query_str),
        },
    )
    return prompt
