"""Cinematic compositing primitives for the Bahubali Fabrics reel.

Everything here is float32 RGB in 0..1, 1080x1920 by default.  The look is
built the way it would be in a grade suite: plate camera move -> 2.5D fabric
layers with real perspective + contact shadows -> graphic/typographic layer ->
bloom -> grade -> vignette -> grain.
"""
from __future__ import annotations

import functools
import math
import os

import numpy as np
from PIL import Image, ImageFilter

from hbtext import cached_text

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEN = os.path.join(ROOT, "assets", "generated")
PLATES = os.path.join(ROOT, "assets", "plates")

W, H = 1080, 1920

# ---------------------------------------------------------------- palette
INK = np.array([0.052, 0.056, 0.054], np.float32)
IVORY = (243, 236, 224)
GOLD = (203, 165, 86)
GOLD_DEEP = (150, 112, 46)
RED = (221, 30, 26)
CHAR = (28, 30, 29)


# ---------------------------------------------------------------- utils
def clamp(x, a=0.0, b=1.0):
    return a if x < a else (b if x > b else x)


def lerp(a, b, t):
    return a + (b - a) * t


def ease_in_out(t):
    t = clamp(t)
    return t * t * (3 - 2 * t)


def ease_out(t, p=3.0):
    t = clamp(t)
    return 1 - (1 - t) ** p


def ease_in(t, p=3.0):
    t = clamp(t)
    return t ** p


def smooth(t, a, b):
    if b == a:
        return 1.0 if t >= b else 0.0
    return ease_in_out((t - a) / (b - a))


def ramp(t, a, b):
    """0 before a, 1 after b, eased."""
    return smooth(t, a, b)


def hrand(*args):
    """Deterministic hash noise."""
    h = 2166136261
    for a in args:
        h = (h ^ (int(a) & 0xFFFFFFFF)) * 16777619 & 0xFFFFFFFF
    return ((h >> 8) & 0xFFFFFF) / float(0xFFFFFF)


def to_u8(img: np.ndarray) -> np.ndarray:
    return (np.clip(img, 0, 1) * 255.0 + 0.5).astype(np.uint8)


def pil(arr: np.ndarray) -> Image.Image:
    return Image.fromarray(to_u8(arr), "RGB")


def np_rgb(im: Image.Image) -> np.ndarray:
    return np.asarray(im.convert("RGB"), dtype=np.float32) / 255.0


# ---------------------------------------------------------------- textures
@functools.lru_cache(maxsize=64)
def plate(name: str, upscale: float = 1.6) -> np.ndarray:
    """Background plate, pre-upscaled so camera moves stay sharp-ish."""
    im = Image.open(os.path.join(PLATES, name)).convert("RGB")
    tw, th = int(im.width * upscale), int(im.height * upscale)
    im = im.resize((tw, th), Image.LANCZOS)
    if (tw, th) != (W, H):
        im = im.resize((W, H), Image.LANCZOS)
    return np_rgb(im)


@functools.lru_cache(maxsize=32)
def _vmacro_pil(name: str) -> Image.Image:
    path = os.path.join(GEN, f"vmacro-{name}.jpg")
    return Image.open(path).convert("RGB")


def macro(name: str) -> np.ndarray:
    """Full-bleed vertical macro of a real fabric photograph, at 9:16."""
    return np_rgb(_vmacro_pil(name))


@functools.lru_cache(maxsize=64)
def _macro_pil(name: str) -> Image.Image:
    path = os.path.join(GEN, f"macro-{name}.jpg")
    return Image.open(path).convert("RGB")


def view(img: np.ndarray, cx: float, cy: float, zoom: float,
         rot: float = 0.0) -> np.ndarray:
    """Camera crop that preserves the target aspect (no geometry distortion)."""
    pil_img = Image.fromarray(to_u8(img), "RGB")
    iw, ih = pil_img.size
    cw = iw / max(1e-3, zoom)
    ch = cw * H / W
    if ch > ih:
        ch = ih / max(1e-3, zoom)
        cw = ch * W / H
    x0 = clamp(cx * iw - cw / 2, 0, iw - cw)
    y0 = clamp(cy * ih - ch / 2, 0, ih - ch)
    crop = pil_img.crop((x0, y0, x0 + cw, y0 + ch))
    if rot:
        crop = crop.rotate(rot, resample=Image.BICUBIC)
    if crop.size != (W, H):
        crop = crop.resize((W, H), Image.LANCZOS)
    return np_rgb(crop)


def edge_soften(img, amount=0.8, inner=0.5, radius=9.0):
    """Lens-style defocus towards the frame edges (borrowed depth, not a filter)."""
    b = blur(img, radius)
    yy = np.linspace(-1, 1, H, dtype=np.float32)[:, None]
    xx = np.linspace(-1, 1, W, dtype=np.float32)[None, :] * (W / H) * 1.25
    r = np.sqrt(xx ** 2 + yy ** 2)
    m = np.clip((r - inner) / max(1e-3, (1.08 - inner)), 0, 1) ** 1.4 * amount
    return img * (1 - m[..., None]) + b * m[..., None]


def scrim(img: np.ndarray, top=0.0, bottom=0.0, mid=0.0, mid_at=0.55):
    """Cinematic luminance wedges that guarantee type legibility."""
    g = np.linspace(0.0, 1.0, H, dtype=np.float32)[:, None]
    m = np.zeros((H, 1), np.float32)
    if top > 0:
        m += (np.clip((0.46 - g) / 0.46, 0, 1) ** 1.3) * top
    if bottom > 0:
        m += (np.clip((g - 0.54) / 0.46, 0, 1) ** 1.3) * bottom
    if mid > 0:
        m += (np.exp(-((g - mid_at) ** 2) / (2 * 0.16 ** 2)) * mid).astype(np.float32)
    return img * (1 - np.clip(m, 0, 0.92)[..., None])


# ---------------------------------------------------------------- blending
def over(base: np.ndarray, layer_rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    if alpha.ndim == 2:
        a = alpha[..., None]
    else:
        a = alpha
    return base * (1 - a) + layer_rgb * a


def blend_add(base: np.ndarray, add: np.ndarray, opacity: float = 1.0) -> np.ndarray:
    return base + add * opacity


def blend_screen(base: np.ndarray, layer: np.ndarray, opacity: float = 1.0) -> np.ndarray:
    out = 1 - (1 - base) * (1 - layer)
    return base + (out - base) * opacity


def blur(arr: np.ndarray, radius: float) -> np.ndarray:
    if radius <= 0:
        return arr
    im = Image.fromarray(to_u8(arr), "RGB").filter(ImageFilter.GaussianBlur(radius))
    return np_rgb(im)


def blur_a(a: np.ndarray, radius: float) -> np.ndarray:
    if radius <= 0:
        return a
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "L")
    im = im.filter(ImageFilter.GaussianBlur(radius))
    return np.asarray(im, np.float32) / 255.0


# ---------------------------------------------------------------- 2.5D panels
@functools.lru_cache(maxsize=128)
def swatch(name: str, max_w: int = 1400) -> Image.Image:
    im = Image.open(os.path.join(GEN, f"swatch-{name}.png")).convert("RGBA")
    if im.width > max_w:
        s = max_w / im.width
        im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    return im


def _homography(src, dst):
    """Solve the 8 coefficients mapping dst -> src (Pillow's convention)."""
    A = []
    b = []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y])
        b.append(v)
    A = np.asarray(A, np.float64)
    b = np.asarray(b, np.float64)
    return np.linalg.solve(A, b)


def project_quad(cx, cy, w, h, rx=0.0, ry=0.0, rz=0.0, persp=1.0):
    """Simple pinhole projection of a flat panel in 3D -> 4 image-space corners."""
    f = 2200.0 * persp
    z = 900.0
    out = []
    for sx, sy in ((-0.5, -0.5), (0.5, -0.5), (0.5, 0.5), (-0.5, 0.5)):
        x, y, zz = sx * w, sy * h, 0.0
        # rotate Y then X then Z
        cy_, sy_ = math.cos(ry), math.sin(ry)
        x, zz = x * cy_ + zz * sy_, -x * sy_ + zz * cy_
        cx_, sx_ = math.cos(rx), math.sin(rx)
        y, zz = y * cx_ - zz * sx_, y * sx_ + zz * cx_
        cz_, sz_ = math.cos(rz), math.sin(rz)
        x, y = x * cz_ - y * sz_, x * sz_ + y * cz_
        zz += z
        k = f / (f + zz)
        out.append((cx + x * k, cy + y * k))
    return out


def draw_panel(base: np.ndarray, im: Image.Image, quad, alpha: float = 1.0,
               shadow: float = 0.55, shadow_off=(6, 16), shadow_blur=18,
               light=1.0, tint=None, alpha_mask=None):
    """Warp one fabric swatch into the frame with perspective + contact shadow."""
    src_pts = [(0, 0), (im.width, 0), (im.width, im.height), (0, im.height)]
    xs = [p[0] for p in quad]
    ys = [p[1] for p in quad]
    pad = int(shadow_blur * 2.2)
    x0 = int(math.floor(min(xs))) - pad
    y0 = int(math.floor(min(ys))) - pad
    x1 = int(math.ceil(max(xs))) + pad
    y1 = int(math.ceil(max(ys))) + pad
    if x1 - x0 < 2 or y1 - y0 < 2:
        return base
    bw, bh = x1 - x0, y1 - y0
    local = [(p[0] - x0, p[1] - y0) for p in quad]
    coeffs = _homography(src_pts, local)
    warped = im.transform((bw, bh), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
    arr = np.asarray(warped, dtype=np.float32) / 255.0
    rgb = arr[..., :3]
    a = arr[..., 3]

    if light != 1.0 or tint is not None:
        rgb = rgb * light
        if tint is not None:
            rgb = rgb * np.asarray(tint, np.float32)

    # contact shadow, offset and lightly diffused
    if shadow > 0:
        sh = Image.fromarray((a * 255).astype(np.uint8), "L")
        sh = sh.filter(ImageFilter.GaussianBlur(shadow_blur))
        sh_a = np.asarray(sh, np.float32) / 255.0 * shadow
        if alpha_mask is not None:
            sh_a = sh_a * alpha_mask
        sx, sy = int(shadow_off[0]), int(shadow_off[1])
        sh_h, sh_w = sh_a.shape
        rx0, ry0 = max(0, x0 + sx), max(0, y0 + sy)
        rx1, ry1 = min(W, x0 + sx + sh_w), min(H, y0 + sy + sh_h)
        if rx1 > rx0 and ry1 > ry0:
            sub = sh_a[ry0 - (y0 + sy):ry1 - (y0 + sy), rx0 - (x0 + sx):rx1 - (x0 + sx)]
            reg = base[ry0:ry1, rx0:rx1]
            base[ry0:ry1, rx0:rx1] = reg * (1 - sub[..., None] * 0.9)

    # composite panel
    tx0, ty0 = max(0, x0), max(0, y0)
    tx1, ty1 = min(W, x1), min(H, y1)
    if tx1 <= tx0 or ty1 <= ty0:
        return base
    ox0, oy0 = tx0 - x0, ty0 - y0
    sub_a = a[oy0:oy0 + (ty1 - ty0), ox0:ox0 + (tx1 - tx0)] * alpha
    sub_rgb = rgb[oy0:oy0 + (ty1 - ty0), ox0:ox0 + (tx1 - tx0)]
    if alpha_mask is not None:
        sub_a = sub_a * alpha_mask[oy0:oy0 + (ty1 - ty0), ox0:ox0 + (tx1 - tx0)]
    base[ty0:ty1, tx0:tx1] = over(base[ty0:ty1, tx0:tx1], sub_rgb, sub_a)
    return base


def light_sweep(base: np.ndarray, x0: float, angle: float = 18.0, width: float = 260.0,
                strength: float = 0.10, color=(1.0, 0.95, 0.82), mask=None,
                y0: float = -400):
    """Soft additive light band travelling across the frame (key-light move)."""
    yy = np.arange(H, dtype=np.float32)[:, None]
    xx = np.arange(W, dtype=np.float32)[None, :]
    ang = math.radians(angle)
    d = (xx - x0) * math.cos(ang) + (yy - y0) * math.sin(ang)
    band = np.exp(-(d ** 2) / (2 * width ** 2)).astype(np.float32)
    band *= strength
    if mask is not None:
        band = band * mask
    add = band[..., None] * np.asarray(color, np.float32)[None, None, :]
    return base + add


# ---------------------------------------------------------------- typography
def text_layer(text, size, weight=400, color=IVORY, tracking=0.0, align="left",
               line_height=1.22, font=None, render_scale=2.0):
    return cached_text(text, weight, int(round(size)), tuple(int(c) for c in color),
                       round(tracking, 4), line_height, align, font, render_scale)


def put_text(base, layer, x, y, alpha=1.0, anchor="tl", scale=1.0, colorize=None,
             mask_rows=None, tracking_offset=0.0):
    """Composite a TextLayer (already rendered) at full opacity control."""
    im = layer.image
    if scale != 1.0:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))),
                       Image.LANCZOS)
    arr = np.asarray(im, dtype=np.float32) / 255.0
    rgb, a = arr[..., :3], arr[..., 3] * alpha
    if colorize is not None:
        a = a * 1.0
        rgb = np.ones_like(rgb) * np.asarray(colorize, np.float32)
    if mask_rows is not None:
        if mask_rows.shape[0] != im.height:
            src = np.linspace(0, mask_rows.shape[0] - 1, im.height)
            mask_rows = np.interp(src, np.arange(mask_rows.shape[0]), mask_rows).astype(np.float32)
        a = a * mask_rows[:, None]
    if anchor[1] == "c":
        x -= im.width / 2
    elif anchor[1] == "r":
        x -= im.width
    if anchor[0] == "c":
        y -= im.height / 2
    elif anchor[0] == "b":
        y -= im.height
    x, y = int(round(x)), int(round(y))
    h, w = a.shape
    tx0, ty0 = max(0, x), max(0, y)
    tx1, ty1 = min(W, x + w), min(H, y + h)
    if tx1 <= tx0 or ty1 <= ty0:
        return base
    ox, oy = tx0 - x, ty0 - y
    sub_a = a[oy:oy + (ty1 - ty0), ox:ox + (tx1 - tx0)]
    sub_rgb = rgb[oy:oy + (ty1 - ty0), ox:ox + (tx1 - tx0)]
    base[ty0:ty1, tx0:tx1] = over(base[ty0:ty1, tx0:tx1], sub_rgb, sub_a)
    return base


def _blend_rgb(base, x0, y0, rgb, alpha, color, glow=0.0, glow_radius=0.0):
    """Blend a scalar coverage patch (bbox-local) into base with one colour."""
    h, w = alpha.shape
    tx0, ty0 = max(0, x0), max(0, y0)
    tx1, ty1 = min(W, x0 + w), min(H, y0 + h)
    if tx1 <= tx0 or ty1 <= ty0:
        return base
    ox, oy = tx0 - x0, ty0 - y0
    a = alpha[oy:oy + (ty1 - ty0), ox:ox + (tx1 - tx0)][..., None]
    col = np.asarray(color, np.float32) / 255.0
    base[ty0:ty1, tx0:tx1] = base[ty0:ty1, tx0:tx1] * (1 - a) + col * a
    if glow > 0:
        pad = int(glow_radius * 2.5)
        yy, xx = np.mgrid[-pad:h + pad, -pad:w + pad]
        big = np.zeros((h + 2 * pad, w + 2 * pad), np.float32)
        big[pad:pad + h, pad:pad + w] = alpha
        im = Image.fromarray((big * 255).astype(np.uint8), "L")
        g = np.asarray(im.filter(ImageFilter.GaussianBlur(max(1.0, glow_radius))),
                       np.float32) / 255.0 * glow
        gx0, gy0 = x0 - pad, y0 - pad
        sx0, sy0 = max(0, gx0), max(0, gy0)
        sx1, sy1 = min(W, gx0 + g.shape[1]), min(H, gy0 + g.shape[0])
        if sx1 > sx0 and sy1 > sy0:
            sub = g[sy0 - gy0:sy1 - gy0, sx0 - gx0:sx1 - gx0][..., None]
            base[sy0:sy1, sx0:sx1] = base[sy0:sy1, sx0:sx1] + sub * col
    return base


def hairline(base, x0, y0, x1, y1, color=GOLD, alpha=1.0, width=1.6, glow=0.0):
    """Anti-aliased line, rasterised with numpy inside its own bounding box."""
    if alpha <= 0.004:
        return base
    m = width * 1.5 + 3
    bx0, by0 = int(min(x0, x1) - m), int(min(y0, y1) - m)
    bx1, by1 = int(max(x0, x1) + m), int(max(y0, y1) + m)
    bw, bh = bx1 - bx0, by1 - by0
    if bw <= 0 or bh <= 0:
        return base
    yy, xx = np.mgrid[0:bh, 0:bw].astype(np.float32)
    xx += bx0
    yy += by0
    dx, dy = x1 - x0, y1 - y0
    L2 = dx * dx + dy * dy
    if L2 < 1e-6:
        d = np.hypot(xx - x0, yy - y0)
    else:
        t = np.clip(((xx - x0) * dx + (yy - y0) * dy) / L2, 0, 1)
        d = np.hypot(xx - (x0 + t * dx), yy - (y0 + t * dy))
    cov = np.clip((width / 2 + 0.5) - d, 0, 1) * alpha
    return _blend_rgb(base, bx0, by0, None, cov, color, glow, max(2.0, width * 3))


def tick(base, cx, cy, r, color=GOLD, alpha=1.0, ring=True, dot=True, glow=0.4):
    if alpha <= 0.004:
        return base
    m = int(r * 2.2 + 6)
    bx0, by0 = int(cx) - m, int(cy) - m
    bw = bh = 2 * m
    yy, xx = np.mgrid[0:bh, 0:bw].astype(np.float32)
    d = np.hypot(xx + bx0 - cx, yy + by0 - cy)
    cov = np.zeros((bh, bw), np.float32)
    if ring:
        cov = np.maximum(cov, np.clip(1.15 - np.abs(d - r), 0, 1))
    if dot:
        cov = np.maximum(cov, np.clip(r * 0.30 + 0.6 - d, 0, 1))
    cov *= alpha
    return _blend_rgb(base, bx0, by0, None, cov, color, glow, max(3.0, r * 0.9))


# ---------------------------------------------------------------- grade / finish
_VIG = None


def vignette(strength=0.42, power=2.2):
    global _VIG
    key = (round(strength, 3), round(power, 2))
    if _VIG is None or _VIG[0] != key:
        yy = np.linspace(-1, 1, H, dtype=np.float32)[:, None]
        xx = np.linspace(-1, 1, W, dtype=np.float32)[None, :] * (W / H) * 0.62
        r = np.sqrt(xx ** 2 + yy ** 2) / 1.05
        v = np.clip(1 - strength * r ** power, 0, 1).astype(np.float32)
        _VIG = (key, v)
    return _VIG[1]


def grade(img, exposure=1.0, contrast=1.06, saturation=1.0, lift=0.0,
          gamma=1.0, warm=0.0, cool=0.0, tint=None):
    out = img * exposure
    if gamma != 1.0:
        out = np.clip(out, 0, None) ** (1.0 / gamma)
    if contrast != 1.0:
        out = (out - 0.5) * contrast + 0.5
    if lift:
        out = out + lift * (1 - out) * 0.35
    if saturation != 1.0:
        luma = out @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        out = luma[..., None] + (out - luma[..., None]) * saturation
    if warm:
        out = out * np.array([1 + 0.06 * warm, 1 + 0.012 * warm, 1 - 0.05 * warm], np.float32)
    if cool:
        out = out * np.array([1 - 0.05 * cool, 1 + 0.0 * cool, 1 + 0.07 * cool], np.float32)
    if tint is not None:
        out = out * np.asarray(tint, np.float32)
    return np.clip(out, 0, 1)


def bloom(img, threshold=0.72, radius=22, amount=0.22):
    """Halation-style bloom, computed at 1/3 resolution for speed."""
    small = np.asarray(Image.fromarray(to_u8(img)).resize((W // 3, H // 3), Image.BILINEAR),
                       np.float32) / 255.0
    lum = small @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    m = np.clip((lum - threshold) / max(1e-4, 1 - threshold), 0, 1)
    lit = small * m[..., None]
    lit8 = np.asarray(Image.fromarray(to_u8(lit)).filter(
        ImageFilter.GaussianBlur(max(1.0, radius / 3))).resize((W, H), Image.BILINEAR),
        np.float32) / 255.0
    lit8b = np.asarray(Image.fromarray(to_u8(lit)).filter(
        ImageFilter.GaussianBlur(max(1.0, radius / 8))).resize((W, H), Image.BILINEAR),
        np.float32) / 255.0
    out = img + (lit8 * 0.75 + lit8b * 0.45) * (amount * 1.8)
    return np.clip(out, 0, 1)


def grain(img, frame_index, amount=0.016, seed=0):
    rng = np.random.default_rng(seed * 7919 + frame_index * 104729)
    n = rng.standard_normal((H // 2, W // 2)).astype(np.float32)
    n = np.repeat(np.repeat(n, 2, axis=0), 2, axis=1)[:H, :W]
    luma = img @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    w = 0.55 + 0.45 * (1 - np.abs(luma - 0.45) * 1.6).clip(0, 1)
    return np.clip(img + (n * w)[..., None] * amount, 0, 1)


def finish(img, t, frame_index, vig=0.42, bloom_amt=0.20, grain_amt=0.016,
           seed=1, contrast=1.05, saturation=1.0):
    out = bloom(img, amount=bloom_amt)
    out = out * vignette(vig)[..., None]
    out = grade(out, contrast=contrast, saturation=saturation)
    out = grain(out, frame_index, grain_amt, seed)
    return out


def dust(img, t, alpha=0.35, count=26, seed=4, warm=True):
    """Faint floating motes — very restrained, only used in close-ups."""
    rng = np.random.default_rng(seed)
    from PIL import ImageDraw
    layer = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(layer)
    for i in range(count):
        x0 = rng.uniform(0, W)
        y0 = rng.uniform(0, H)
        sp = rng.uniform(6, 26)
        drift = rng.uniform(-18, 18)
        y = (y0 - sp * t * 2.2) % H
        x = x0 + math.sin(t * 0.6 + i) * drift
        r = rng.uniform(0.7, 2.0)
        a = rng.uniform(0.10, 0.30) * alpha
        col = (int(255 * a), int(238 * a), int(205 * a)) if warm else (int(230 * a),) * 3
        d.ellipse([x - r, y - r, x + r, y + r], fill=col)
    layer = layer.filter(ImageFilter.GaussianBlur(1.4))
    return np.clip(img + np_rgb(layer), 0, 1)
