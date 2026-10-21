"""Shaping-accurate text rendering (HarfBuzz + FreeType) for Latin + Devanagari.

Pillow in this environment is built without Raqm, so complex-script shaping is
done here explicitly: uharfbuzz shapes the string, freetype-py rasterises the
resulting glyph ids.  Everything is rendered deterministically and cached, so
the film renderer can call it thousands of times without re-shaping.
"""
from __future__ import annotations

import functools
import os
from dataclasses import dataclass

import freetype
import numpy as np
import uharfbuzz as hb
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, "assets", "fonts")

# family -> weight -> file
FONTS = {}
for _key in ("latin", "deva"):
    for _w in (300, 400, 500, 600, 700, 800):
        FONTS[(_key, _w)] = os.path.join(FONT_DIR, f"{_key}-{_w}.ttf")


def pick_font(text: str) -> str:
    """Choose the font subset that can shape this string."""
    for ch in text:
        if 0x0900 <= ord(ch) <= 0x097F:
            return "deva"
    return "latin"


_FONT_CACHE: dict = {}


def _hb(path: str, size26: int):
    """Font with scale; the blob/face are kept alive alongside it (a garbage
    collected blob silently breaks shaping in uharfbuzz)."""
    key = (path, size26)
    got = _FONT_CACHE.get(key)
    if got is not None:
        return got
    blob = hb.Blob.from_file_path(path)
    face = hb.Face(blob)
    font = hb.Font(face)
    font.scale = (size26, size26)
    font.set_variations({})  # no-op, keeps API stable across versions
    _FONT_CACHE[key] = font
    _KEEP_ALIVE[key] = (blob, face, font)
    return font


_KEEP_ALIVE: dict = {}
_FT_CACHE: dict = {}


def _ft(path: str):
    got = _FT_CACHE.get(path)
    if got is None:
        got = freetype.Face(path)
        _FT_CACHE[path] = got
    return got


@functools.lru_cache(maxsize=200000)
def _glyph_bitmap(path: str, size26: int, gid: int):
    """Rasterise one glyph -> (alpha ndarray, left, top)."""
    face = _ft(path)
    face.set_char_size(size26)
    face.load_glyph(gid, freetype.FT_LOAD_RENDER | freetype.FT_LOAD_TARGET_NORMAL)
    slot = face.glyph
    bmp = slot.bitmap
    w, h = bmp.width, bmp.rows
    if w == 0 or h == 0:
        return None, slot.bitmap_left, slot.bitmap_top
    buf = np.array(bmp.buffer, dtype=np.uint8)
    if bmp.pitch != w:
        buf = buf.reshape(h, bmp.pitch)[:, :w]
    else:
        buf = buf.reshape(h, w)
    return buf, slot.bitmap_left, slot.bitmap_top


def _is_deva(ch: str) -> bool:
    o = ord(ch)
    return 0x0900 <= o <= 0x097F or o in (0x200C, 0x200D)


def script_runs(text: str):
    """Split a string into (text, font_key) runs so Latin punctuation inside a
    Hindi sentence is not shaped with the Devanagari subset (which lacks it)."""
    runs = []
    for ch in text:
        key = "deva" if _is_deva(ch) else "latin"
        if runs and runs[-1][1] == key:
            runs[-1][0] += ch
        else:
            runs.append([ch, key])
    # merge whitespace-only latin runs into their neighbours when possible
    return [(r[0], r[1]) for r in runs]


def shape(text: str, font_key: str, weight: int, size_px: float, tracking: float = 0.0):
    """Return (glyphs, total_advance) where glyphs = [(gid, x, y, path)].

    Mixed-script strings are shaped per script run and concatenated, so Hindi
    text containing "?" or Latin words renders without tofu boxes.
    """
    size26 = int(round(size_px * 64))
    out = []
    x = 0.0
    track = tracking * size_px
    runs = script_runs(text) if font_key != "latin" or True else [(text, font_key)]
    if tracking == 0.0:
        # per-run tracking is applied below; keep glyph list flat
        pass
    for run_text, key in runs:
        if run_text == "":
            continue
        path = FONTS[(key, weight)]
        font = _hb(path, size26)
        buf = hb.Buffer()
        buf.add_str(run_text)
        buf.guess_segment_properties()
        hb.shape(font, buf, {"kern": True, "liga": True, "calt": True})
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            out.append((info.codepoint, x + pos.x_offset / 64.0, -pos.y_offset / 64.0, path))
            x += pos.x_advance / 64.0 + track
    if out:
        x -= track
    return out, x


def line_metrics(text: str, font_key: str, weight: int, size_px: float):
    face = _ft(FONTS[(font_key, weight)])
    face.set_char_size(int(round(size_px * 64)))
    return face.size.ascender / 64.0, -face.size.descender / 64.0


def measure(text: str, weight: int = 400, size: float = 48, tracking: float = 0.0,
            font: str | None = None):
    font_key = font or pick_font(text)
    _, adv = shape(text, font_key, weight, size, tracking)
    return adv


@dataclass
class TextLayer:
    image: Image.Image          # RGBA, cropped tight with a small padding
    baseline: float             # y of the first baseline inside the image
    ascent: float
    width: float
    height: float


def render_text(text: str, weight: int = 400, size: float = 48, color=(255, 255, 255),
                tracking: float = 0.0, line_height: float = 1.22, align: str = "left",
                font: str | None = None, render_scale: float = 2.0,
                alpha: int = 255) -> TextLayer:
    """Render one or more lines into a tightly cropped RGBA image.

    `size` is the final on-screen pixel size; rasterisation happens at
    `render_scale`x and is downsampled, which keeps curves and matras clean.
    """
    lines = text.split("\n")
    font_key = font or pick_font(text)
    s = size * render_scale

    shaped = []
    for ln in lines:
        if ln.strip() == "":
            shaped.append(([], 0.0))
        else:
            shaped.append(shape(ln, font_key, weight, s, tracking))

    face = _ft(FONTS[(font_key, weight)])
    face.set_char_size(int(round(s * 64)))
    asc = face.size.ascender / 64.0
    desc = -face.size.descender / 64.0
    lh = size * line_height * render_scale

    max_w = max((adv for _, adv in shaped), default=1.0)
    pad = int(round(s * 0.35))
    W = int(np.ceil(max_w)) + pad * 2
    H = int(np.ceil(lh * (len(lines) - 1) + asc + desc)) + pad * 2

    acc = np.zeros((H, W), dtype=np.float32)
    for li, (glyphs, adv) in enumerate(shaped):
        base_y = pad + asc + li * lh
        if align == "center":
            x0 = pad + (max_w - adv) / 2.0
        elif align == "right":
            x0 = pad + (max_w - adv)
        else:
            x0 = pad
        for gid, gx, gy, path in glyphs:
            bmp, left, top = _glyph_bitmap(path, int(round(s * 64)), gid)
            if bmp is None:
                continue
            h, w = bmp.shape
            px = int(round(x0 + gx + left))
            py = int(round(base_y + gy - top))
            if px >= W or py >= H or px + w <= 0 or py + h <= 0:
                continue
            sx0, sy0 = max(0, -px), max(0, -py)
            dx0, dy0 = max(0, px), max(0, py)
            dx1 = min(W, px + w)
            dy1 = min(H, py + h)
            sub = bmp[sy0:sy0 + (dy1 - dy0), sx0:sx0 + (dx1 - dx0)].astype(np.float32) / 255.0
            acc[dy0:dy1, dx0:dx1] = np.maximum(acc[dy0:dy1, dx0:dx1], sub)

    # downsample to final size
    img = Image.fromarray((np.clip(acc, 0, 1) * 255).astype(np.uint8), "L")
    if render_scale != 1.0:
        img = img.resize((max(1, int(round(W / render_scale))), max(1, int(round(H / render_scale)))),
                         Image.LANCZOS)
    rgba = Image.new("RGBA", img.size, (color[0], color[1], color[2], 0))
    a = img.point(lambda v: int(v * alpha / 255))
    rgba.putalpha(a)
    return TextLayer(image=rgba, baseline=(pad + asc) / render_scale,
                     ascent=asc / render_scale, width=rgba.size[0], height=rgba.size[1])


@functools.lru_cache(maxsize=512)
def cached_text(text: str, weight: int = 400, size: int = 48, color=(255, 255, 255),
                tracking: float = 0.0, line_height: float = 1.22, align: str = "left",
                font: str | None = None, render_scale: float = 2.0) -> TextLayer:
    return render_text(text, weight, size, color, tracking, line_height, align, font, render_scale)
