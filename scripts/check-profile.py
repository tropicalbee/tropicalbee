"""Check shipped README/game links and image headers without network access."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit, parse_qs
import re
import struct
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = []
        self.images = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ("href", "src", "srcset"):
            if attrs.get(key):
                self.paths.append(attrs[key])
        if tag == "img":
            if not attrs.get("alt", "").strip():
                raise ValueError("An image is missing alternative text")
            self.images.append(attrs)


def local_target(document, reference):
    url = urlsplit(reference)
    if url.scheme or url.netloc or not url.path:
        return None
    target = (document.parent / unquote(url.path)).resolve()
    if not target.is_relative_to(ROOT):
        raise ValueError(f"Link escapes the project: {reference}")
    # Check case as well as existence, including on Windows.
    current = ROOT
    for part in target.relative_to(ROOT).parts:
        if part not in {child.name for child in current.iterdir()}:
            raise ValueError(f"{document.relative_to(ROOT)}: missing {reference}")
        current /= part
    return target


def image_size(target):
    data = target.read_bytes()
    if target.suffix == ".gif":
        if data[:6] not in (b"GIF87a", b"GIF89a") or data[-1:] != b";":
            raise ValueError(f"Invalid GIF header or trailer: {target.name}")
        return struct.unpack("<HH", data[6:10])
    if target.suffix == ".png":
        if data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
            raise ValueError(f"Invalid PNG header: {target.name}")
        return struct.unpack(">II", data[16:24])
    if target.suffix == ".svg":
        ET.fromstring(data)
    return None


def main():
    documents = [
        ROOT / "README.md",
        *sorted(ROOT.glob("*-kit/README.md")),
        *sorted(ROOT.glob("tropicalbee-halloween-banner-kit/game/*.md")),
    ]
    images = set()
    references = 0
    profile_images = []
    for document in documents:
        text = re.sub(r"```.*?```", "", document.read_text(encoding="utf-8"), flags=re.S)
        parser = References()
        parser.feed(text)
        paths = parser.paths + re.findall(r"!?\[[^\]]*\]\(([^)\s]+)\)", text)
        for reference in paths:
            target = local_target(document, reference)
            if target:
                references += 1
                if target.suffix in (".gif", ".png", ".svg"):
                    images.add(target)
        if document == ROOT / "README.md":
            profile_images = parser.images
    for target in images:
        image_size(target)
    section_images = [img for img in profile_images if not urlsplit(img["src"]).scheme]
    counters = [img for img in profile_images if urlsplit(img["src"]).scheme]
    if len(section_images) != 6:
        raise ValueError("The profile must include all six illustrated sections")
    if len(counters) != 1:
        raise ValueError("Expected one profile view counter beneath the illustrations")
    counter = urlsplit(counters[0]["src"])
    if (counter.scheme != "https" or counter.netloc != "komarev.com" or counter.path != "/ghpvc/"
            or parse_qs(counter.query) != {"username": ["tropicalbee"], "label": ["Trespasses recorded"],
                                           "color": ["79644d"], "style": ["flat-square"]}):
        raise ValueError("Unexpected counter configuration")
    if profile_images[-1] != counters[0]:
        raise ValueError("The counter must follow the six illustrated sections")
    if section_images[-1]["src"] != "trespass-section-kit/assets/trespass-register.gif":
        raise ValueError("The counter must belong to the Trespass Register scene")
    for img in section_images:
        if img.get("width") != "1024":
            raise ValueError("Profile sections must share a consistent display width")
    total = sum(local_target(ROOT / "README.md", img["src"]).stat().st_size for img in section_images)
    print(f"PASS: {len(documents)} documents, {references} local references, {len(images)} image files.")
    print(f"Six profile animations: {total:,} bytes ({total / 1024**2:.2f} MiB).")
    print("Counter URL and placement validated; external service availability is not checked offline.")


if __name__ == "__main__":
    main()
