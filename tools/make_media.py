"""
MuscularMen sample-media generator
-----------------------------------
Renders exercise illustrations (PNG) and demo videos (MP4) from the app's
own original artwork, saves them to images/ and videos/, and registers them
in index.html (EXERCISE_IMAGES / EXERCISE_VIDEOS).

Requirements: Python 3 + Playwright (`pip install playwright`) and Microsoft
Edge or Google Chrome installed. No other downloads are needed – video is
encoded by the browser itself.

Usage (from the project folder):
    python tools/make_media.py                       # default sample set
    python tools/make_media.py back-squat plank      # specific exercises
    python tools/make_media.py all                   # every exercise
    python tools/make_media.py --images-only ...     # skip videos
    python tools/make_media.py --videos-only ...     # skip images
    python tools/make_media.py --sync                # only re-register files
                                                       already in images/ & videos/
You can also drop your own files (e.g. AI-generated clips or licensed
illustrations) into videos/<exercise-id>.mp4 or images/<exercise-id>.png and
run `--sync` to register them.
"""
import base64
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
COMPOSER = ROOT / "tools" / "media-composer.js"
IMG_DIR, VID_DIR = ROOT / "images", ROOT / "videos"
DEFAULT_SET = ["back-squat", "bench-press", "deadlift", "hip-thrust", "lat-pulldown", "db-lateral-raise"]
IMG_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg")
VID_EXT = (".mp4", ".webm")


def launch(p):
    """Use an installed Edge/Chrome so no browser download is required."""
    for channel in ("msedge", "chrome", None):
        try:
            return p.chromium.launch(channel=channel, headless=True) if channel else p.chromium.launch(headless=True)
        except Exception:
            continue
    sys.exit("Could not start a Chromium browser. Install Microsoft Edge or Google Chrome.")


def generate(ids, images=True, videos=True):
    from playwright.sync_api import sync_playwright
    IMG_DIR.mkdir(exist_ok=True)
    VID_DIR.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = launch(p)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto(INDEX.as_uri(), wait_until="domcontentloaded")
        page.wait_for_function("typeof EX !== 'undefined' && typeof muscleMapSVG === 'function'")
        page.add_script_tag(content=COMPOSER.read_text(encoding="utf-8"))
        known = set(page.evaluate("Object.keys(EX)"))
        if ids == ["all"]:
            ids = sorted(known)
        for ex_id in ids:
            if ex_id not in known:
                print(f"  ! unknown exercise id: {ex_id}")
                continue
            if images:
                data = page.evaluate("id => TFMedia.image(id)", ex_id)
                out = IMG_DIR / f"{ex_id}.png"
                out.write_bytes(base64.b64decode(data))
                print(f"  image  {out.relative_to(ROOT)}  ({out.stat().st_size // 1024} KB)")
            if videos:
                res = page.evaluate("id => TFMedia.video(id)", ex_id)
                out = VID_DIR / f"{ex_id}.{res['ext']}"
                out.write_bytes(base64.b64decode(res["b64"]))
                print(f"  video  {out.relative_to(ROOT)}  ({out.stat().st_size // 1024} KB, {res['mime']})")
        browser.close()


def sync():
    """Rewrite the EXERCISE_IMAGES / EXERCISE_VIDEOS maps from files on disk."""
    html = INDEX.read_text(encoding="utf-8")
    ids = set(re.findall(r"\{ id: '([a-z0-9-]+)'", html))

    def entries(folder, exts):
        found = {}
        for f in sorted(folder.glob("*")) if folder.exists() else []:
            if f.suffix.lower() in exts and f.stem in ids and f.stem not in found:
                found[f.stem] = f"{folder.name}/{f.name}"
        return "".join(f"  '{k}': '{v}',\n" for k, v in found.items()), len(found)

    vids, nv = entries(VID_DIR, VID_EXT)
    imgs, ni = entries(IMG_DIR, IMG_EXT)
    for name, body in (("EXERCISE_VIDEOS", vids), ("EXERCISE_IMAGES", imgs)):
        html, n = re.subn(r"const %s = \{\n.*?\};" % name, lambda m: f"const {name} = {{\n{body}}};", html, count=1, flags=re.S)
        if not n:
            sys.exit(f"Could not find {name} in index.html")
    INDEX.write_text(html, encoding="utf-8")
    print(f"Registered {nv} video(s) and {ni} image(s) in index.html")


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--sync" in args:
        sync()
        sys.exit()
    images = "--videos-only" not in args
    videos = "--images-only" not in args
    ids = [a for a in args if not a.startswith("--")] or DEFAULT_SET
    print(f"Rendering media for {len(ids) if ids != ['all'] else 'all'} exercise(s)…")
    generate(ids, images, videos)
    sync()
