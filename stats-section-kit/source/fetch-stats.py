"""Fetch public stats completely before replacing the last successful snapshot."""
from collections import Counter
from datetime import date, datetime, timedelta, timezone
import importlib.util
import json
import os
from pathlib import Path
import re
from urllib.parse import urlencode, quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
MAX_INTEGER = 9_007_199_254_740_991
MAX_RESPONSE = 8 * 1024 * 1024


def integer(value):
    if type(value) is not int or not 0 <= value <= MAX_INTEGER:
        raise ValueError("Invalid non-negative integer in GitHub response")
    return value


def calendar_stats(days):
    if not days:
        raise ValueError("Missing contribution calendar")
    dates = [date.fromisoformat(day["date"]) for day in days]
    if any(b - a != timedelta(days=1) for a, b in zip(dates, dates[1:])):
        raise ValueError("Calendar dates must be unique, consecutive and ordered")
    end = dates[-1]
    try:
        anniversary = end.replace(year=end.year - 1)
    except ValueError:  # February 29: the preceding year ends on February 28.
        anniversary = end.replace(year=end.year - 1, day=28)
    start = anniversary + timedelta(days=1)
    if dates[0] > start:
        raise ValueError("Calendar does not cover the full twelve-month window")
    total = run = longest = 0
    for day, stamp in zip(days, dates):
        count = integer(day["count"])
        if stamp < start:
            continue
        total += count
        run = run + 1 if count > 0 else 0
        longest = max(longest, run)
    return {"start": start.isoformat(), "end": end.isoformat()}, integer(total), longest


class GitHub:
    def __init__(self, token=None):
        self.token = token

    def get(self, path, params=None):
        url = "https://api.github.com" + path
        if params:
            url += "?" + urlencode(params)
        headers = {"Accept": "application/vnd.github+json", "User-Agent": "tropicalbee-haunted-archive/1.0",
                   "X-GitHub-Api-Version": "2026-03-10"}
        if self.token:
            headers["Authorization"] = "Bearer " + self.token
        with urlopen(Request(url, headers=headers), timeout=30) as response:
            body = response.read(MAX_RESPONSE + 1)
        if len(body) > MAX_RESPONSE:
            raise ValueError("GitHub response exceeds size limit")
        return json.loads(body)


def repositories(api, username):
    seen = set()
    result = []
    for page in range(1, 101):
        batch = api.get(f"/users/{username}/repos", {"type": "owner", "sort": "full_name", "per_page": 100, "page": page})
        if not isinstance(batch, list):
            raise ValueError("Expected a repository list")
        for repo in batch:
            identity = repo["full_name"]
            if identity in seen:
                raise ValueError("Duplicate repository across pages; retry on next schedule")
            seen.add(identity)
            if (repo["private"] is False and repo["fork"] is False
                    and repo["owner"]["login"].lower() == username.lower()):
                result.append(repo)
        if len(batch) < 100:
            return result
    raise ValueError("Repository pagination limit reached; refusing partial totals")


def collect(api, config, days):
    username = config["username"]
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9-]{0,38}", username):
        raise ValueError("Invalid GitHub username")
    excluded = {name.lower() for name in config["excludedLanguageRepositories"]}
    repos = repositories(api, username)
    metrics = {"repositories": len(repos), "stars": integer(sum(integer(repo["stargazers_count"]) for repo in repos))}
    for field, query in [("issues", "is:issue"), ("pullRequests", "is:pr"), ("mergedPullRequests", "is:pr is:merged")]:
        response = api.get("/search/issues", {"q": f"author:{username} is:public {query}", "per_page": 1})
        if response.get("incomplete_results") is not False:
            raise ValueError("GitHub search returned incomplete results")
        metrics[field] = integer(response["total_count"])
    if metrics["mergedPullRequests"] > metrics["pullRequests"]:
        raise ValueError("PR totals changed during fetch; retry on next schedule")
    languages = Counter()
    included = []
    for repo in repos:
        if repo["full_name"].lower() in excluded:
            continue
        name = quote(repo["full_name"], safe="/")
        response = api.get(f"/repos/{name}/languages")
        if not isinstance(response, dict):
            raise ValueError("Expected language byte counts")
        for language, size in response.items():
            if not isinstance(language, str) or not language.strip():
                raise ValueError("Missing language name")
            if integer(size):
                languages[language] += size
        included.append(repo["full_name"])
    period, metrics["contributions"], metrics["longestStreak"] = calendar_stats(days)
    return {"schemaVersion": 1, "username": username,
            "fetchedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "period": period, "metrics": metrics,
            "languages": [{"name": name, "bytes": integer(size)} for name, size in sorted(languages.items(), key=lambda pair: (-pair[1], pair[0]))],
            "languageRepositories": sorted(included), "excludedLanguageRepositories": sorted(excluded)}


def fetch_calendar(username):
    spec = importlib.util.spec_from_file_location("miner_calendar", ROOT.parent / "ghost-miner-kit/source/fetch-calendar.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    # The token is used only on api.github.com; never send it to the HTML endpoint.
    request = Request(f"https://github.com/users/{username}/contributions", headers={"User-Agent": "HauntedArchive/1.0", "Accept-Language": "en-US"})
    with urlopen(request, timeout=30) as response:
        body = response.read(MAX_RESPONSE + 1)
    if len(body) > MAX_RESPONSE:
        raise ValueError("Calendar response exceeds size limit")
    parser = module.CalendarParser()
    parser.feed(body.decode("utf-8"))
    return parser.calendar()


def refresh(config, api, days, output):
    # No file is written until every metric, page and language response succeeds.
    snapshot = collect(api, config, days)
    output.write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf-8")
    print(f"Saved public archive snapshot for {snapshot['username']}")


if __name__ == "__main__":
    config = json.loads((ROOT / "stats-config.json").read_text(encoding="utf-8"))
    if config["username"] != "tropicalbee":
        raise ValueError("This profile is configured for tropicalbee")
    refresh(config, GitHub(os.environ.get("GITHUB_TOKEN")), fetch_calendar(config["username"]), ROOT / "data/stats.json")
