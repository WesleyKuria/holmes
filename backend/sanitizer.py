"""
Technique Taken from this paper:
https://arxiv.org/pdf/2402.18093

Omitting text/html Content We describe a method for omitting HTML format messages.
The primary goal of phishing emails is to direct the viewer to a phishing site by clicking on hyperlinks.
While retaining crucial information such as the a tag and text containing false information to deceive users,
our system removes unnecessary HTML elements related to style or metadata.
The removal process is as follows: Inspired by existing research on using LLMs to detect phishing sites,
we implemented a simplification of the HTML.
1. Remove comment, style, script tags.
2. Remove all attributes except for the major ones: src, href, alt, title, name, id, class.
3. Remove tags with no text content.
4. Unwrap certain tags: font, strong, b.
5. Reduce the src attribute of img tags and the href attribute of a tags to 10
characters in the URL path, except for the domain name.
6. If the token limit is exceeded, remove an HTML element from the center of
the HTML until the number of tokens is below the limit.
"""

import re
import json
import base64
import email
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from email.message import Message
from email.parser import HeaderParser
from pydantic import BaseModel


class Email(BaseModel):
    eml: str  # the contents of the eml file to be analyzed
    organization: str | None = None  # the enterprise id or personal id of the user


def run_cleaning_pipeline(eml):
    if hasattr(eml, "eml"):
        eml_text = eml.eml
    else:
        eml_text = str(eml)

    try:
        eml_msg = email.message_from_string(eml_text)
        headers = parse_headers(eml_msg)
        payload = retrieve_payload(eml_msg)
        combined = (headers + "\n" + payload).strip()
        if not combined or len(combined) < 10:
            combined = eml_text
    except Exception:
        combined = eml_text

    cleaned_payload = clean_eml(combined)
    return cleaned_payload


def parse_headers(eml_msg: Message):
    headers = HeaderParser().parsestr(eml_msg.as_string())
    del_header_prefixes = [
        "X-",
        "DKIM",
        "DMARC",
        "ARC",
        "Delivered-To",
        "Received",
        "To",
        "Cc",
        "Bcc",
    ]

    for header in headers.keys():
        for prefix in del_header_prefixes:
            if header.startswith(prefix):
                del headers[header]

    return json.dumps(dict(headers.items()), indent=4)


def retrieve_payload(eml_msg: Message):
    if eml_msg.is_multipart():
        payload = ""
        for part in eml_msg.get_payload():
            payload += "\n" + retrieve_payload(part)
    else:
        headers = HeaderParser().parsestr(eml_msg.as_string())
        encoding = headers.get("Content-Transfer-Encoding")
        payload = eml_msg.get_payload()
        if encoding == "base64":
            try:
                payload = base64.b64decode(payload).decode()
            except:
                payload = ""

    return payload


def scrub_eml_data(eml_data: str) -> str:
    try:
        import scrubadub
        scrubber = scrubadub.Scrubber()

        # add optional and external detectors
        scrubber.add_detector(scrubadub.detectors.DateOfBirthDetector)

        scrubber.remove_detector(scrubadub.detectors.email.EmailDetector)
        scrubber.remove_detector(scrubadub.detectors.UrlDetector)

        # scrub the eml data
        return scrubber.clean(eml_data)
    except Exception:
        # Fallback to returning raw data if external scrubber encounters issues
        return eml_data


def scrub_email_addresses(eml_data: str) -> str:
    pattern = r"([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)"
    cleaned = re.sub(pattern, r"{{USER}}@\2", eml_data)
    return cleaned


# --- Kenyan PII Scrubbing (Regex-based) ---

# Kenyan Phone Numbers:
# Covers international (+254 or 254), local (07... or 01...), with spaces, dashes, or parentheses
# Examples: +254712345678, +254 712 345 678, +254-712-345-678, 0712345678, 0712 345 678, 0110123456, +254112345678
KENYAN_PHONE_REGEX = re.compile(
    r"(?:\+?254|0)(?:\s*\(0\)\s*|\s*[\-\.]?\s*)?[17](?:[\s\-\.]?\d){8}\b"
)

# KRA PINs:
# Format: A followed by 9 digits and 1 letter (e.g., A123456789Z, P012345678X)
KRA_PIN_REGEX = re.compile(
    r"\b[A-Za-z]\d{9}[A-Za-z]\b"
)

# Kenyan National ID Numbers:
# Format: 7 to 8 digits (contextual label or standalone 7-8 digits)
KENYAN_ID_CONTEXT_REGEX = re.compile(
    r"(?i)\b(national\s*id|nat\s*id|id\s*(?:no|num|number)?|identity(?:\s*card|\s*no|\s*number)?|huduma(?:\s*no|\s*number)?)\s*[:#.\-]?\s*(\d{7,8})\b"
)
KENYAN_ID_STANDALONE_REGEX = re.compile(
    r"\b\d{7,8}\b"
)


def scrub_kenyan_phone_numbers(text: str) -> str:
    """Redact Kenyan mobile/landline numbers (+2547..., 07..., 01...)."""
    text = KENYAN_PHONE_REGEX.sub("{{KENYAN_PHONE_NUMBER}}", text)
    # Standardize any generic {{PHONE}} tags from base scrubber to Kenyan tag
    return text.replace("{{PHONE}}", "{{KENYAN_PHONE_NUMBER}}")


def scrub_kra_pins(text: str) -> str:
    """Redact Kenya Revenue Authority (KRA) PINs (e.g. A123456789Z)."""
    return KRA_PIN_REGEX.sub("{{KRA_PIN}}", text)


def scrub_kenyan_national_ids(text: str) -> str:
    """Redact Kenyan National ID numbers (7 to 8 digits)."""
    # First redact labeled occurrences to preserve structure cleanly
    text = KENYAN_ID_CONTEXT_REGEX.sub(r"\1: {{KENYAN_NATIONAL_ID}}", text)
    # Then redact standalone 7 to 8 digit numbers
    text = KENYAN_ID_STANDALONE_REGEX.sub("{{KENYAN_NATIONAL_ID}}", text)
    return text


def scrub_kenyan_pii(text: str) -> str:
    """
    Run complete Kenyan PII redaction pipeline:
    1. Kenyan Phone Numbers (+2547..., 07..., 01...)
    2. KRA PINs (A followed by 9 digits and 1 letter)
    3. Kenyan National ID Numbers (7 to 8 digits)
    """
    text = scrub_kenyan_phone_numbers(text)
    text = scrub_kra_pins(text)
    text = scrub_kenyan_national_ids(text)
    return text


def clean_eml(eml_data: str) -> str:
    """
    Clean HTML in accordance with research paper and redact standard & Kenyan-specific PII
    before sending data to the LLM.
    """
    # 1. Base PII scrubbing (scrubadub)
    data = scrub_eml_data(eml_data)

    # 2. Redact email addresses while preserving domain names
    data = scrub_email_addresses(data)

    # 3. Redact Kenyan-specific PII (Phone numbers, KRA PINs, National IDs)
    data = scrub_kenyan_pii(data)

    # 4. Simplify HTML structure
    soup = BeautifulSoup(data, "html.parser")
    # remove comments, style, and script tags
    for tag in soup.find_all(["comment", "style", "script"]):
        tag.decompose()
    # remove all attributes except for the major ones: src, href, alt, title, name, id, class
    for tag in soup.find_all(True):
        for attr in list(tag.attrs):
            if attr not in ["src", "href", "alt", "title", "name", "id", "class"]:
                del tag[attr]
    # remove tags with no text content
    for tag in soup.find_all(True):
        if not tag.text.strip():
            tag.decompose()
    # unwrap certain tags: font, strong, b
    for tag in soup.find_all(["font", "strong", "b"]):
        tag.unwrap()

    # reduce the src attribute of img tags and the href attribute of a tags to 10 characters in the URL path, except for the domain name
    for tag in soup.find_all(["img", "a"]):
        if "src" in tag.attrs:
            # keep the domain name
            parsed_url = urlparse(tag["src"])
            domain = parsed_url.netloc
            path = parsed_url.path
            # limit the length of the url path to 10 characters
            tag["src"] = domain + path[:10]
        if "href" in tag.attrs:
            # keep the domain name
            parsed_url = urlparse(tag["href"])
            domain = parsed_url.netloc
            path = parsed_url.path
            # limit the length of the url path to 10 characters
            tag["href"] = domain + path[:10]

    # convert the cleaned html back to a string
    cleaned_html = str(soup)
    return cleaned_html


if __name__ == "__main__":
    test_sample = """<html>
        <head>
            <style>.red { color: red; }</style>
        </head>
        <body>
            <p>Dear customer, M-Pesa reversal requested for phone 0712345678 or +254 798 123 456.</p>
            <p>Your KRA PIN is A123456789Z and National ID is 12345678. Contact us at support@safaricom.co.ke.</p>
            <a href="https://www.safaricom-reversal.com/verify/token/93849283402394823">Confirm Reversal</a>
        </body>
    </html>"""

    cleaned_output = clean_eml(test_sample)
    print("Sanitized Output:")
    print(cleaned_output)

