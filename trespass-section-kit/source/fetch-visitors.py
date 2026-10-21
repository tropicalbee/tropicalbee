"""Save a validated Komarev snapshot; a failed request leaves the old file intact."""

import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
import re
import xml.etree.ElementTree as ET

USERNAME = "tropicalbee"
LABEL = "Trespasses recorded"
URL = f"https://komarev.com/ghpvc/?username={USERNAME}&label=Trespasses+recorded&style=flat-square&abbreviated=false"
OUTPUT = Path(__file__).resolve().parent.parent / "data" / "visitors.json"
MAX_BYTES = 128 * 1024
NUMBER = r"(?:0|[1-9][0-9]*|[1-9][0-9]{0,2}(?:,[0-9]{3})+)"


def parse_count(body):
    if len(body) > MAX_BYTES:
        raise ValueError("Counter response exceeds the SVG size limit")
    root = ET.fromstring(body)
    if root.tag != "{http://www.w3.org/2000/svg}svg":
        raise ValueError("Counter response is not an SVG")
    # Shields-style badges may provide an accessible label or duplicated text
    # nodes for shadows. Never read geometry, IDs or an unrelated number.
    values = []
    accessible = root.get("aria-label", "").strip()
    if accessible:
        match = re.fullmatch(re.escape(LABEL) + r":\s*(" + NUMBER + r")", accessible)
        if not match:
            raise ValueError("Unexpected counter accessible label")
        values.append(int(match[1].replace(",", "")))
    texts = ["".join(node.itertext()).strip() for node in root.iter("{http://www.w3.org/2000/svg}text")]
    if not accessible and LABEL not in texts:
        raise ValueError("Missing counter label")
    for value in texts:
        if re.fullmatch(NUMBER, value):
            values.append(int(value.replace(",", "")))
        elif value != LABEL:
            raise ValueError("Unexpected or abbreviated counter value")
    if not values or len(set(values)) != 1 or values[0] > 9_007_199_254_740_991:
        raise ValueError("Missing, conflicting or unsafe counter value")
    return values[0]


def refresh(output=OUTPUT, opener=urlopen):
    previous = json.loads(output.read_text(encoding="utf-8"))
    if previous.get("username") != USERNAME:
        raise ValueError("Counter snapshot belongs to a different username")
    old = previous.get("count")
    if old is not None and (type(old) is not int or not 0 <= old <= 9_007_199_254_740_991):
        raise ValueError("Invalid saved counter value")
    request = Request(URL, headers={"User-Agent": "tropicalbee-profile-snapshot/1.0", "Accept": "image/svg+xml"})
    # One request only: fetching the badge itself also contributes a page hit.
    with opener(request, timeout=20) as response:
        count = parse_count(response.read(MAX_BYTES + 1))
    if old is not None and count < old:
        raise ValueError("Counter decreased; preserving the previous snapshot for review")
    snapshot = {"username": USERNAME, "count": count,
                "fetchedAt": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    output.write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {count:,} profile-view requests for {USERNAME}")


if __name__ == "__main__":
    refresh()
