import unittest
from sanitizer import (
    scrub_kenyan_phone_numbers,
    scrub_kra_pins,
    scrub_kenyan_national_ids,
    scrub_kenyan_pii,
    clean_eml,
)

class TestKenyanPIIScrubber(unittest.TestCase):
    def test_kenyan_phone_numbers(self):
        cases = [
            ("Call +254712345678 now", "Call {{KENYAN_PHONE_NUMBER}} now"),
            ("Reach me at +254 712 345 678 today", "Reach me at {{KENYAN_PHONE_NUMBER}} today"),
            ("Tel: 0712345678", "Tel: {{KENYAN_PHONE_NUMBER}}"),
            ("Line: 0712 345 678", "Line: {{KENYAN_PHONE_NUMBER}}"),
            ("Airtel: 0110-123-456", "Airtel: {{KENYAN_PHONE_NUMBER}}"),
            ("Intl format: 254712345678", "Intl format: {{KENYAN_PHONE_NUMBER}}"),
            ("New prefix: +254 112 345 678", "New prefix: {{KENYAN_PHONE_NUMBER}}"),
        ]
        for inp, expected in cases:
            with self.subTest(inp=inp):
                self.assertEqual(scrub_kenyan_phone_numbers(inp), expected)

    def test_kra_pins(self):
        cases = [
            ("KRA PIN: A123456789Z", "KRA PIN: {{KRA_PIN}}"),
            ("Tax PIN: a123456789z", "Tax PIN: {{KRA_PIN}}"),
            ("Corporate PIN: P051234567X", "Corporate PIN: {{KRA_PIN}}"),
        ]
        for inp, expected in cases:
            with self.subTest(inp=inp):
                self.assertEqual(scrub_kra_pins(inp), expected)

    def test_kenyan_national_ids(self):
        cases = [
            ("National ID: 12345678", "National ID: {{KENYAN_NATIONAL_ID}}"),
            ("ID No: 7654321", "ID No: {{KENYAN_NATIONAL_ID}}"),
            ("Identity Card: 87654321", "Identity Card: {{KENYAN_NATIONAL_ID}}"),
            ("Huduma Number: 1234567", "Huduma Number: {{KENYAN_NATIONAL_ID}}"),
            ("Citizen with 12345678 registered", "Citizen with {{KENYAN_NATIONAL_ID}} registered"),
        ]
        for inp, expected in cases:
            with self.subTest(inp=inp):
                self.assertEqual(scrub_kenyan_national_ids(inp), expected)

    def test_combined_kenyan_pii(self):
        raw = "User 0712345678 holding ID 12345678 and KRA PIN A123456789Z."
        scrubbed = scrub_kenyan_pii(raw)
        self.assertNotIn("0712345678", scrubbed)
        self.assertNotIn("12345678", scrubbed)
        self.assertNotIn("A123456789Z", scrubbed)
        self.assertIn("{{KENYAN_PHONE_NUMBER}}", scrubbed)
        self.assertIn("{{KENYAN_NATIONAL_ID}}", scrubbed)
        self.assertIn("{{KRA_PIN}}", scrubbed)

if __name__ == "__main__":
    unittest.main()
