"""Offline tests for public scopes, pagination, streaks and failed refreshes."""
from datetime import date, timedelta
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("archive", ROOT / "stats-section-kit/source/fetch-stats.py")
archive = importlib.util.module_from_spec(spec)
spec.loader.exec_module(archive)
CONFIG = {"username": "tropicalbee", "excludedLanguageRepositories": ["tropicalbee/tropicalbee"]}


def days(end=date(2026, 10, 22), length=368):
    return [{"date": (end-timedelta(days=length-i-1)).isoformat(), "count": 0} for i in range(length)]


def repo(name, **kwargs):
    return {"full_name": f"tropicalbee/{name}", "owner": {"login": "tropicalbee"},
            "private": False, "fork": False, "stargazers_count": 2, **kwargs}


class FakeAPI:
    def __init__(self, fail=False):
        self.fail = fail
        self.paths = []

    def get(self, path, params=None):
        self.paths.append((path, params))
        if path.startswith('/users/'):
            return [repo('tropicalbee'), repo('project'), repo('fork', fork=True), repo('secret', private=True)]
        if path == '/search/issues':
            assert 'author:tropicalbee is:public' in params['q']
            return {"incomplete_results": False, "total_count": 3 if 'is:merged' in params['q'] else 8}
        if path == '/repos/tropicalbee/project/languages':
            if self.fail:
                raise OSError('fixture network failure')
            return {'Python': 300, 'HTML': 100}
        raise AssertionError(f'Unexpected endpoint: {path}')


class ArchiveTests(unittest.TestCase):
    def test_streak_uses_days_not_contribution_counts(self):
        calendar = days()
        for i in [-10, -9, -8, -7, -3, -2, -1]:
            calendar[i]['count'] = 5
        period, total, longest = archive.calendar_stats(calendar)
        self.assertEqual(period, {'start': '2025-10-23', 'end': '2026-10-22'})
        self.assertEqual((total, longest), (35, 4))

    def test_window_clips_old_activity_and_resets_streak(self):
        calendar = days()
        for day in calendar[:5]:
            day['count'] = 1
        self.assertEqual(archive.calendar_stats(calendar)[1:], (2, 2))

    def test_leap_window_and_no_activity(self):
        period, total, longest = archive.calendar_stats(days(date(2024, 2, 29)))
        self.assertEqual(period['start'], '2023-03-01')
        self.assertEqual((total, longest), (0, 0))

    def test_calendar_missing_days_and_invalid_counts_fail(self):
        for calendar in [days()[:100] + days()[101:], days()[:30], []]:
            with self.assertRaises(ValueError):
                archive.calendar_stats(calendar)
        calendar = days()
        calendar[-1]['count'] = True
        with self.assertRaises(ValueError):
            archive.calendar_stats(calendar)

    def test_public_scope_and_language_exclusion(self):
        api = FakeAPI()
        result = archive.collect(api, CONFIG, days())
        self.assertEqual(result['metrics']['repositories'], 2)
        self.assertEqual(result['metrics']['stars'], 4)
        self.assertEqual(result['metrics']['mergedPullRequests'], 3)
        self.assertEqual(result['languages'], [{'name': 'Python', 'bytes': 300}, {'name': 'HTML', 'bytes': 100}])
        self.assertEqual(result['languageRepositories'], ['tropicalbee/project'])
        self.assertFalse(any('/tropicalbee/tropicalbee/languages' in path for path, _ in api.paths))

    def test_pagination_does_not_stop_at_one_page(self):
        class Paged:
            def get(self, path, params):
                return [repo(str(i)) for i in range(100)] if params['page'] == 1 else [repo('last')]
        self.assertEqual(len(archive.repositories(Paged(), 'tropicalbee')), 101)

    def test_duplicate_pages_fail(self):
        class Repeated:
            def get(self, path, params):
                return [repo(str(i)) for i in range(100)]
        with self.assertRaises(ValueError):
            archive.repositories(Repeated(), 'tropicalbee')

    def test_failure_never_writes_a_partial_snapshot(self):
        class Memory:
            def write_text(self, *args, **kwargs):
                raise AssertionError('An incomplete snapshot was written')
        with self.assertRaises(OSError):
            archive.refresh(CONFIG, FakeAPI(fail=True), days(), Memory())

    def test_incomplete_search_rejected(self):
        class Incomplete(FakeAPI):
            def get(self, path, params=None):
                data = super().get(path, params)
                if path == '/search/issues':
                    data['incomplete_results'] = True
                return data
        with self.assertRaises(ValueError):
            archive.collect(Incomplete(), CONFIG, days())


if __name__ == '__main__':
    unittest.main()
