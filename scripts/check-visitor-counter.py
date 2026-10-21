"""Offline counter fixtures: parsing, request limits and preserving saved data."""
import importlib.util
import io
import json
from pathlib import Path
import unittest
from urllib.error import URLError

spec = importlib.util.spec_from_file_location("counter", Path(__file__).resolve().parent.parent / "trespass-section-kit/source/fetch-visitors.py")
counter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(counter)


def badge(value="1,234", accessible=False):
    label = f' aria-label="Trespasses recorded: {value}"' if accessible else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg"{label}>'
            f'<text>Trespasses recorded</text><text>Trespasses recorded</text>'
            f'<text>{value}</text><text>{value}</text></svg>').encode()


class MemorySnapshot:
    def __init__(self, count=100):
        self.text = json.dumps({"username": "tropicalbee", "count": count, "fetchedAt": None})

    def read_text(self, **kwargs):
        return self.text

    def write_text(self, text, **kwargs):
        self.text = text


class CounterTests(unittest.TestCase):
    def test_realistic_badge_variants(self):
        for value, expected in [("0", 0), ("1234", 1234), ("1,234", 1234), ("1,234,567", 1234567)]:
            for accessible in (True, False):
                with self.subTest(value=value, accessible=accessible):
                    self.assertEqual(counter.parse_count(badge(value, accessible)), expected)

    def test_accessible_label_only(self):
        self.assertEqual(counter.parse_count(b'<svg xmlns="http://www.w3.org/2000/svg" aria-label="Trespasses recorded: 42"/>'), 42)

    def test_reject_bad_values(self):
        for value in ["1.2k", "-1", "1.5", "01", "12,34", "9007199254740992", "Error", ""]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                counter.parse_count(badge(value))

    def test_reject_bad_responses(self):
        for body in [b'<html>503 unavailable</html>', b'<svg/>', b'x' * (counter.MAX_BYTES + 1),
                     badge().replace(b'1,234</text></svg>', b'1,235</text></svg>'),
                     badge().replace(b'Trespasses recorded', b'Other counter')]:
            with self.subTest(body=body[:60]), self.assertRaises(ValueError):
                counter.parse_count(body)

    def test_refresh_saves_a_valid_count(self):
        saved = MemorySnapshot(None)
        requests = []
        def opener(request, timeout):
            requests.append((request.full_url, timeout))
            return io.BytesIO(badge())
        counter.refresh(saved, opener)
        result = json.loads(saved.text)
        self.assertEqual(result["count"], 1234)
        self.assertIsNotNone(result["fetchedAt"])
        self.assertEqual(requests, [(counter.URL, 20)])

    def test_errors_preserve_previous_snapshot(self):
        def offline(*args, **kwargs):
            raise URLError("offline fixture")
        for opener in [offline, lambda *a, **k: io.BytesIO(badge("99")),
                       lambda *a, **k: io.BytesIO(b'<svg'),
                       lambda *a, **k: io.BytesIO(b'<!doctype html><html/>')]:
            saved = MemorySnapshot()
            before = saved.text
            with self.assertRaises(Exception):
                counter.refresh(saved, opener)
            self.assertEqual(saved.text, before)


if __name__ == "__main__":
    unittest.main()
