import os
import re
import requests
from dotenv import load_dotenv

from template import PARSER, get_prompt

load_dotenv()

API_URL = "https://llm.kindo.ai/v1/chat/completions"
MODEL = "groq/mixtral-8x7b-32768"
API_KEY = os.getenv("KINDO_API_KEY") or os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")


def heuristic_forensic_analysis(email_str: str) -> dict:
    """
    Forensic analysis engine that systematically scans any real email text
    for social engineering tactics, credential harvesting, coercion,
    deceptive links, and artificial urgency.
    """
    text_lower = email_str.lower()
    flagged_phrases = []
    risk_factors = 0

    # 1. Credential Harvesting & Account Suspension
    cred_patterns = [
        (r"(verify your (identity|account|credentials|password))", "Urgent prompt directing the recipient to enter authentication credentials on an external form.", "Credential Harvesting", 30),
        (r"(account (has been|will be) (suspended|locked|terminated|disabled))", "Threat of immediate access revocation designed to induce panic and eliminate caution.", "Account Threat", 30),
        (r"(password (expires|expiration|reset required))", "Common pretext to trick users into revealing valid active credentials.", "Credential Harvesting", 25),
        (r"(login to (reactivate|restore|verify|confirm))", "Call-to-action steering recipient away from official apps to spoofed portals.", "Credential Harvesting", 25),
        (r"(unauthorized (activity|access|login attempt))", "Fabricated security alert designed to provoke reactive clicking.", "Fear Induction", 25),
    ]

    for pattern, reason, category, weight in cred_patterns:
        match = re.search(pattern, email_str, re.IGNORECASE)
        if match:
            flagged_phrases.append({
                "phrase": match.group(0),
                "reason": reason,
                "category": category
            })
            risk_factors += weight

    # 2. Urgency & Coercive Pressure
    urgency_patterns = [
        (r"(within (24|48|12|2) hours)", "Artificial deadline creates psychological pressure, preventing normal verification steps.", "Artificial Urgency", 20),
        (r"(immediate (action|attention) (required|necessary))", "High-pressure phrase intended to bypass organizational verification workflows.", "Urgency Coercion", 20),
        (r"(failure to comply will result in)", "Coercive penalty language typical of extortion, tax, or legal impersonation scams.", "Coercion", 25),
        (r"(act now|haraka sana|immediately|urgent response required)", "Sensational urgency designed to force emotional rather than rational processing.", "Urgency", 15),
    ]

    for pattern, reason, category, weight in urgency_patterns:
        match = re.search(pattern, email_str, re.IGNORECASE)
        if match:
            # Don't add duplicate phrases
            if not any(fp["phrase"].lower() == match.group(0).lower() for fp in flagged_phrases):
                flagged_phrases.append({
                    "phrase": match.group(0),
                    "reason": reason,
                    "category": category
                })
                risk_factors += weight

    # 3. Financial & Payment Fraud
    financial_patterns = [
        (r"(wire transfer|send funds|wire funds)", "Direct request for irreversible money transfers; hallmark of Business Email Compromise (BEC).", "Financial BEC", 35),
        (r"(gift cards?|apple cards?|steam cards?)", "Requests for gift card codes indicate untraceable payment demands used exclusively by fraudsters.", "Payment Scam", 40),
        (r"(overdue invoice|payment remittance advice|attached invoice|past due balance)", "Fraudulent invoice notices leverage routine business processes to deliver malware or alter payment routing.", "Invoice Fraud", 25),
        (r"(update your (direct deposit|banking details|payroll))", "Payroll diversion tactic where attackers attempt to redirect employee salary deposits.", "Payroll Fraud", 35),
        (r"(refund (approved|pending|issued)|tax refund)", "Promise of unearned money stimulates greed or relief, lowering critical defenses.", "Baiting", 20),
        (r"(\bpaybill\b|\btill number\b|reverse transaction|m-pesa reversal)", "Payment redirection requesting urgent mobile money interaction.", "Financial Redirection", 25),
    ]

    for pattern, reason, category, weight in financial_patterns:
        match = re.search(pattern, email_str, re.IGNORECASE)
        if match:
            if not any(fp["phrase"].lower() == match.group(0).lower() for fp in flagged_phrases):
                flagged_phrases.append({
                    "phrase": match.group(0),
                    "reason": reason,
                    "category": category
                })
                risk_factors += weight

    # 4. Deceptive Action Links & Attachments
    link_patterns = [
        (r"(click here|click the link below|tap here|follow this link)", "Generic hyperlinked call-to-action obscures the actual destination domain.", "Deceptive Link", 15),
        (r"(download attachment|see attached (zip|pdf|iso|exe|html))", "Delivery mechanism commonly used to execute payloads, keyloggers, or malicious macros.", "Malicious Attachment", 25),
    ]

    for pattern, reason, category, weight in link_patterns:
        match = re.search(pattern, email_str, re.IGNORECASE)
        if match:
            if not any(fp["phrase"].lower() == match.group(0).lower() for fp in flagged_phrases):
                flagged_phrases.append({
                    "phrase": match.group(0),
                    "reason": reason,
                    "category": category
                })
                risk_factors += weight

    # 5. Redacted PII tokens
    pii_tokens = [
        ("{{KENYAN_PHONE_NUMBER}}", "Extracted personal phone number targeted for smishing or voice social engineering.", "Targeted PII"),
        ("{{KRA_PIN}}", "Taxpayer identification credential exposed to identity theft and fraudulent filings.", "Sensitive PII"),
        ("{{KENYAN_NATIONAL_ID}}", "National identity number targeted for SIM swap or banking impersonation.", "Identity Harvesting"),
    ]
    for token, reason, category in pii_tokens:
        if token in email_str:
            flagged_phrases.append({
                "phrase": token,
                "reason": reason,
                "category": category
            })
            risk_factors += 15

    # Determine risk score, threat level, and tactics
    score = min(100, risk_factors)
    if score >= 70:
        threat_level = "Dangerous"
        if any(f["category"] in ["Credential Harvesting", "Account Threat"] for f in flagged_phrases):
            primary_tactic = "Deceptive Credential Harvesting & Account Takeover"
        elif any(f["category"] in ["Financial BEC", "Payroll Fraud", "Invoice Fraud"] for f in flagged_phrases):
            primary_tactic = "Business Email Compromise (BEC) & Payment Fraud"
        else:
            primary_tactic = "Social Engineering via Coercive Urgency"
        educational_summary = (
            "The email demonstrates classic social engineering characteristics: it pairs artificial urgency "
            "with a high-friction threat (such as service disruption, legal action, or financial loss). "
            "Attackers use these emotional triggers to bypass the recipient's analytical reasoning, forcing an "
            "impulsive click on an unauthorized link or submission of sensitive credentials."
        )
    elif score >= 31:
        threat_level = "Suspicious"
        primary_tactic = "Unsolicited Call-to-Action with Urgency Indicators"
        educational_summary = (
            "The communication exhibits several warning signs including generic calls-to-action, time constraints, "
            "or unsolicited transaction claims. While it may not present an overt exploit, standard security hygiene "
            "requires verifying the sender through independent out-of-band channels."
        )
    else:
        score = max(5, score)
        threat_level = "Safe"
        primary_tactic = "Legitimate Communication"
        educational_summary = (
            "Forensic analysis shows no coercive language, credential harvesting links, or deceptive routing indicators. "
            "The structure appears consistent with standard informational or transactional correspondence."
        )

    return {
        "risk_score": score,
        "threat_level": threat_level,
        "primary_tactic": primary_tactic,
        "educational_summary": educational_summary,
        "flagged_phrases": flagged_phrases,
    }


def chat(email_str: str) -> dict:
    # If API key is available, attempt remote LLM completion
    if API_KEY:
        try:
            payload = {
                "model": MODEL,
                "messages": get_prompt(email_str),
                "temperature": 0,
            }
            headers = {
                "Content-Type": "application/json",
                "api-key": API_KEY,
            }
            response = requests.post(API_URL, headers=headers, json=payload, timeout=12)
            if response.status_code == 200:
                res_json = response.json()
                reply = res_json["choices"][0]["message"]["content"]
                return PARSER.parse(reply)
        except Exception as e:
            print(f"Remote LLM inference failed, falling back to local forensic engine: {e}")

    # Local high-precision forensic analysis
    return heuristic_forensic_analysis(email_str)
