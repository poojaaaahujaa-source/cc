"""Fabric asset pipeline: turns the raw supplier photographs into isolated,
perspective-ready swatch plates.  No pattern is regenerated, recoloured or
repainted — every pixel is the client's own photograph.
"""
from __future__ import annotations

import json
import math
import os
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAB = os.path.join(ROOT, "assets", "fabric")
OUT = os.path.join(ROOT, "assets", "generated")
os.makedirs(OUT, exist_ok=True)

_CACHE: dict[str, Image.Image] = {}


def source(name: str) -> Image.Image:
    if name not in _CACHE:
        path = os.path.join(FAB, name)
        _CACHE[name] = Image.open(path).convert("RGB")
    return _CACHE[name]


# named crops, normalised to the source frame:  name -> (file, x0, y0, x1, y1)
CROPS = {
    # Asset A — folded zigzag-jacquard swatches (flat grid: crop whole swatch faces)
    "A-dark":   ("A-grid.png",        0.07, 0.03, 0.43, 0.165),
    "A-grey":   ("A-grid.png",        0.07, 0.225, 0.43, 0.385),
    "A-olive":  ("A-grid.png",        0.07, 0.465, 0.43, 0.80),
    "A-beige":  ("A-grid.png",        0.55, 0.03, 0.92, 0.165),
    "A-ivory":  ("A-grid.png",        0.55, 0.225, 0.92, 0.385),
    "A-brown":  ("A-grid.png",        0.55, 0.465, 0.92, 0.80),

    # Asset B — chevron weave (interior patches: the shape comes from the mask)
    "B-dark":   ("B-chevron.png",     0.07, 0.035, 0.44, 0.165),
    "B-grey":   ("B-chevron.png",     0.08, 0.265, 0.42, 0.395),
    "B-olive":  ("B-chevron.png",     0.08, 0.545, 0.42, 0.80),
    "B-brown":  ("B-chevron.png",     0.55, 0.035, 0.92, 0.165),
    "B-beige":  ("B-chevron.png",     0.55, 0.265, 0.92, 0.395),
    "B-ivory":  ("B-chevron.png",     0.55, 0.545, 0.92, 0.80),

    # Asset C — geometric basket weave
    "C-dark":   ("C-geometric.png",   0.07, 0.035, 0.46, 0.185),
    "C-grey":   ("C-geometric.png",   0.07, 0.285, 0.46, 0.425),
    "C-olive":  ("C-geometric.png",   0.07, 0.565, 0.46, 0.83),
    "C-brown":  ("C-geometric.png",   0.57, 0.035, 0.95, 0.185),
    "C-beige":  ("C-geometric.png",   0.57, 0.285, 0.95, 0.425),
    "C-ivory":  ("C-geometric.png",   0.57, 0.565, 0.95, 0.83),

    # Asset D — ribbed / corded texture (rotated overlap stack: interior patches)
    "D-brown":  ("D-ribbed.jpg",      0.16, 0.075, 0.50, 0.245),
    "D-olive":  ("D-ribbed.jpg",      0.10, 0.440, 0.38, 0.590),
    "D-tan":    ("D-ribbed.jpg",      0.06, 0.630, 0.30, 0.720),
    "D-navy":   ("D-ribbed.jpg",      0.44, 0.810, 0.78, 0.930),

    # Asset E — navy / ivory / beige herringbone
    "E-ivory":  ("E-navyivory.jpg",   0.10, 0.015, 0.88, 0.135),
    "E-navy":   ("E-navyivory.jpg",   0.16, 0.330, 0.54, 0.570),
    "E-beige":  ("E-navyivory.jpg",   0.05, 0.870, 0.26, 0.965),
}

# velvet fan (Asset F) — individual swatches, (x0, x1) per column
FAN_TOP = [("F-teal", 0.148, 0.236), ("F-rose", 0.252, 0.312), ("F-blush", 0.330, 0.386),
           ("F-pink", 0.402, 0.455), ("F-cocoa", 0.474, 0.545), ("F-sage", 0.562, 0.620),
           ("F-tan", 0.640, 0.710)]
FAN_BOTTOM = [("F-charcoal", 0.065, 0.140), ("F-royal", 0.158, 0.262), ("F-slate", 0.278, 0.356),
              ("F-crimson", 0.378, 0.500), ("F-plum", 0.516, 0.626), ("F-forest", 0.648, 0.730),
              ("F-peacock", 0.752, 0.834), ("F-wine", 0.856, 0.968)]
for _n, _x0, _x1 in FAN_TOP:
    CROPS[_n] = ("F-fan.jpg", _x0, 0.105, _x1, 0.205)
for _n, _x0, _x1 in FAN_BOTTOM:
    CROPS[_n] = ("F-fan.jpg", _x0, 0.470, _x1, 0.575)


def crop(name: str) -> Image.Image:
    f, x0, y0, x1, y1 = CROPS[name]
    im = source(f)
    W, H = im.size
    return im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))


def pinked_polygon(w: int, h: int, teeth: int, amp: float, seed: int = 0,
                   sides=("t", "r", "b", "l"), inset: float = 0.0):
    """Zigzag ('pinked') cutting line around a rectangle, as a point list."""
    rnd = random.Random(seed)
    pts = []
    x0, y0, x1, y1 = inset, inset, w - inset, h - inset
    a = amp * (0.85 + 0.3 * rnd.random())

    def edge(p0, p1, n):
        (ax, ay), (bx, by) = p0, p1
        L = math.hypot(bx - ax, by - ay)
        n = max(2, int(n))
        nx, ny = (by - ay) / L, -(bx - ax) / L
        out = []
        for i in range(n):
            t = i / n
            off = a if i % 2 == 0 else -a * 0.15
            out.append((ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off))
        return out

    nt = max(3, int(teeth * (x1 - x0) / max(1, (y1 - y0))))
    nb = max(3, teeth)
    if "t" in sides:
        pts += edge((x0, y0), (x1, y0), nb)
    else:
        pts += [(x0, y0), (x1, y0)]
    if "r" in sides:
        pts += edge((x1, y0), (x1, y1), nt)
    else:
        pts += [(x1, y1)]
    if "b" in sides:
        pts += edge((x1, y1), (x0, y1), nb)
    else:
        pts += [(x0, y1)]
    if "l" in sides:
        pts += edge((x0, y1), (x0, y0), nt)
    return pts


def make_swatch(name: str, out_w: int = 900, teeth: int = 26, amp: float = 5.0,
                seed: int = 3, sides=("t", "r", "b", "l"), edge_light: float = 0.55,
                shadow: int = 26, zoom: float = 1.0, rotate: float = 0.0,
                feather: float = 0.8) -> dict:
    """Build one isolated swatch plate: pinked silhouette, cut-edge highlight,
    contact shadow.  Returns metadata describing the plate."""
    src = crop(name)
    # fill the plate: cover-crop the fabric to the plate aspect (4:3-ish)
    out_h = int(round(out_w * 0.78))
    sw, sh = src.size
    scale = max(out_w / sw, out_h / sh) * (1.0 / zoom if zoom else 1.0) * 1.06
    nw, nh = int(sw * scale), int(sh * scale)
    fabric = src.resize((nw, nh), Image.LANCZOS)
    left = (nw - out_w) // 2
    top = (nh - out_h) // 2
    fabric = fabric.crop((left, top, left + out_w, top + out_h))

    if rotate:
        fabric = fabric.rotate(rotate, resample=Image.BICUBIC, expand=False)

    ss = 2  # supersample the mask for clean pinked teeth
    mask = Image.new("L", (out_w * ss, out_h * ss), 0)
    d = ImageDraw.Draw(mask)
    poly = pinked_polygon(out_w * ss, out_h * ss, teeth, amp * ss, seed, sides,
                          inset=amp * ss * 1.4)
    d.polygon(poly, fill=255)
    if feather:
        mask = mask.filter(ImageFilter.GaussianBlur(feather * ss * 0.5))
    mask = mask.resize((out_w, out_h), Image.LANCZOS)

    plate = fabric.convert("RGBA")
    plate.putalpha(mask)

    # cut-edge highlight: thin bright line just inside the silhouette
    inner = mask.filter(ImageFilter.GaussianBlur(2.2))
    edge = np.asarray(mask, dtype=np.float32) / 255.0
    innerf = np.asarray(inner, dtype=np.float32) / 255.0
    rim = np.clip(edge - innerf, 0, 1) * edge_light
    rgb = np.asarray(plate.convert("RGB"), dtype=np.float32)
    # light the upper-left cut edge a little more (matches the studio key light)
    yy, xx = np.mgrid[0:out_h, 0:out_w]
    grad = np.clip(1.0 - (xx / out_w * 0.55 + yy / out_h * 0.45), 0, 1) ** 0.8
    rgb = rgb + rim[..., None] * (28 + 46 * grad[..., None])
    plate = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB").convert("RGBA")
    plate.putalpha(mask)

    # soft contact shadow
    if shadow:
        sh_alpha = mask.filter(ImageFilter.GaussianBlur(shadow * 0.55))
        sh_alpha = sh_alpha.point(lambda v: int(v * 0.62))
        shadow_im = Image.new("RGBA", (out_w, out_h), (8, 8, 7, 0))
        shadow_im.putalpha(sh_alpha)
        pad = shadow * 2
        canvas = Image.new("RGBA", (out_w + pad * 2, out_h + pad * 2), (0, 0, 0, 0))
        canvas.alpha_composite(shadow_im, (pad + shadow // 3, pad + shadow // 2))
        canvas.alpha_composite(plate, (pad, pad))
        plate = canvas

    path = os.path.join(OUT, f"swatch-{name}.png")
    plate.save(path)
    return {"name": name, "file": path, "w": plate.size[0], "h": plate.size[1]}


VERTICAL_MACROS = [
    # single continuous swatch faces where possible, so no seam splits the frame
    ("jacquard",   "A-grid.png",      0.03, 0.46, 0.49, 0.87),   # olive zigzag jacquard
    ("jacquard-dk","A-grid.png",      0.03, 0.02, 0.49, 0.17),   # dark jacquard (short)
    ("geo",        "C-geometric.png", 0.55, 0.49, 0.97, 0.88),   # ivory basket weave
    ("cord",       "D-ribbed.jpg",    0.20, 0.20, 0.72, 0.99),   # corded stack
    ("chevron",    "B-chevron.png",   0.03, 0.46, 0.47, 0.85),   # olive chevron
    ("herring",    "E-navyivory.jpg", 0.10, 0.14, 0.84, 0.72),   # navy herringbone
]


def make_vertical(name: str, file: str, x0, y0, x1, y1, out_w=1152, out_h=2048) -> dict:
    im = source(file)
    Wd, Hd = im.size
    box = (int(x0 * Wd), int(y0 * Hd), int(x1 * Wd), int(y1 * Hd))
    im = im.crop(box)
    target_ar = out_w / out_h
    w, h = im.size
    if w / h > target_ar:
        nw = int(h * target_ar)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / target_ar)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im = im.resize((out_w, out_h), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=55, threshold=3))
    path = os.path.join(OUT, f"vmacro-{name}.jpg")
    im.save(path, quality=96)
    return {"name": name, "file": path, "w": out_w, "h": out_h}


def make_macro(name: str, out_w: int, out_h: int) -> dict:
    """Full-bleed macro crop of a real fabric (no masking, no retouching)."""
    src = crop(name)
    sw, sh = src.size
    scale = max(out_w / sw, out_h / sh) * 1.02
    im = src.resize((int(sw * scale), int(sh * scale)), Image.LANCZOS)
    left = (im.size[0] - out_w) // 2
    top = (im.size[1] - out_h) // 2
    im = im.crop((left, top, left + out_w, top + out_h))
    path = os.path.join(OUT, f"macro-{name}.jpg")
    im.save(path, quality=95)
    return {"name": name, "file": path, "w": out_w, "h": out_h}


SWATCHES = ["A-dark", "A-grey", "A-olive", "A-beige", "A-ivory", "A-brown",
            "B-dark", "B-grey", "B-olive", "B-beige", "B-ivory", "B-brown",
            "C-dark", "C-grey", "C-olive", "C-beige", "C-ivory", "C-brown",
            "D-brown", "D-olive", "D-tan", "D-navy",
            "E-navy", "E-ivory", "E-beige",
            "F-teal", "F-rose", "F-blush", "F-pink", "F-cocoa", "F-sage", "F-tan",
            "F-charcoal", "F-royal", "F-slate", "F-crimson", "F-plum", "F-forest",
            "F-peacock", "F-wine"]


def build_all(verbose: bool = True):
    meta = {"swatches": [], "macros": []}
    for i, n in enumerate(SWATCHES):
        m = make_swatch(n, out_w=900, teeth=24, amp=5.0, seed=7 + i)
        meta["swatches"].append(m)
        if verbose:
            print("swatch", n, m["w"], m["h"])
    for n, w, h in [("A-dark", 1400, 900), ("A-olive", 1400, 900), ("C-ivory", 1400, 900),
                    ("D-brown", 1400, 900), ("E-navy", 1200, 1500), ("A-brown", 1400, 900),
                    ("F-crimson", 900, 1400), ("C-grey", 1400, 900), ("D-navy", 1400, 900),
                    ("B-olive", 1400, 900)]:
        m = make_macro(n, w, h)
        meta["macros"].append(m)
        if verbose:
            print("macro", n, w, h)
    for n, f_, x0, y0, x1, y1 in VERTICAL_MACROS:
        m = make_vertical(n, f_, x0, y0, x1, y1)
        meta.setdefault("verticals", []).append(m)
        if verbose:
            print("vmacro", n)
    with open(os.path.join(OUT, "assets.json"), "w") as f:
        json.dump(meta, f, indent=1)
    return meta


if __name__ == "__main__":
    build_all()
