#!/usr/bin/env python3
"""
BAHUBALI FABRICS - Winter Collection Sourcing Reel (28s, 1080x1920, 30fps)
Renders the finished MP4 from the ORIGINAL uploaded fabric photos + logo.
Pipeline: PIL motion graphics -> raw frames -> ffmpeg (libx264) + synthesized
music/SFX mixed with the generated Hindi voiceover -> final H.264 MP4.
No fabric is redrawn or recoloured: every product pixel comes from a crop of
an uploaded photograph. The logo artwork is used untouched.
"""
import math, os, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont
import imageio_ffmpeg

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
ASSETS = os.path.join(ROOT, "assets")
AUD = os.path.join(ROOT, "audio")
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

W, H, FPS, DUR = 1080, 1920, 30, 28.0
NFRAMES = int(FPS * DUR)

# ---------------------------------------------------------------- palette ---
CHARCOAL = (20, 18, 15)
NEARBLACK = (10, 9, 8)
IVORY = (243, 237, 224)
IVORY_BG = (241, 233, 218)
GOLD = (201, 162, 75)
GOLD_LT = (229, 200, 120)
GOLD_DK = (138, 109, 47)
RED = (205, 30, 30)
INK = (34, 30, 25)
GREY_TXT = (110, 100, 86)

F_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
F_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
_font_cache = {}
def font(size, bold=True):
    key = (size, bold)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(F_BOLD if bold else F_REG, size)
    return _font_cache[key]

# ---------------------------------------------------------------- easing ----
def clamp01(x): return max(0.0, min(1.0, x))
def fade(t, a, b): return clamp01((t - a) / max(1e-6, (b - a)))
def ease_out(x): x = clamp01(x); return 1 - (1 - x) ** 3
def ease_inout(x): x = clamp01(x); return x * x * (3 - 2 * x)
def lerp(a, b, x): return a + (b - a) * x

# ---------------------------------------------------------------- images ----
def load(name, max_w=2200):
    im = Image.open(os.path.join(ASSETS, name)).convert("RGB")
    if im.width > max_w:
        im = im.resize((max_w, int(im.height * max_w / im.width)), Image.LANCZOS)
    return im

HT = load("fabric_houndstooth.png")       # 6-colour houndstooth sheet
HB = load("fabric_herringbone.png")       # herringbone weave sheet
GEO = load("fabric_geometric.png")        # geometric woven sheet
RIB = load("whatsapp_0929.jpg")           # ribbed corduroy fan
CHEV = load("whatsapp_1001.jpg")          # chevron navy / cream / taupe
VEL = load("whatsapp_1008.jpg")           # velvet multi-colour swatches

def cover(img, w, h, cx=0.5, cy=0.5, zoom=1.0):
    """Crop `img` to aspect w/h around fractional centre, resize to w x h."""
    iw, ih = img.size
    a = w / h
    cw0 = min(iw, ih * a); ch0 = cw0 / a
    cw = cw0 / zoom; ch = ch0 / zoom
    x0 = cx * iw - cw / 2; y0 = cy * ih - ch / 2
    x0 = max(0, min(iw - cw, x0)); y0 = max(0, min(ih - ch, y0))
    crop = img.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch)))
    return crop.resize((w, h), Image.LANCZOS)

# --- logo: use original artwork untouched. If its background is opaque black,
# derive alpha from luminance (black -> transparent) so it sits on charcoal
# exactly as designed, without redrawing a single element.
def load_logo_keyed():
    im = Image.open(os.path.join(ASSETS, "logo_original.png")).convert("RGBA")
    arr = np.asarray(im).astype(np.float32)
    corner_alpha = arr[5, 5, 3]
    print(f"[logo] size={im.size} corner RGBA={arr[5,5]}")
    if corner_alpha > 10:  # opaque (black) background -> luminance key
        rgb = arr[:, :, :3]
        alpha = rgb.max(axis=2)
        a = np.maximum(alpha, 1.0)
        unmult = np.clip(rgb * (255.0 / a)[:, :, None], 0, 255)
        out = np.dstack([unmult, alpha]).astype(np.uint8)
        return Image.fromarray(out, "RGBA")
    return im
LOGO = load_logo_keyed()
LOGO_PLAQUE = Image.open(os.path.join(ASSETS, "logo_original.png")).convert("RGB")

# ------------------------------------------------------------ overlays ------
def make_vignette(strength=140):
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    dx = (x - W / 2) / (W / 2); dy = (y - H / 2) / (H / 2)
    d = np.sqrt(dx * dx + dy * dy)
    a = np.clip((d - 0.55) / 0.95, 0, 1) ** 1.6 * strength
    ov = np.zeros((H, W, 4), np.uint8); ov[:, :, 3] = a.astype(np.uint8)
    return Image.fromarray(ov, "RGBA")
VIG = make_vignette()

def make_scrim(top_h=0, bot_h=900, max_a=205):
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = np.zeros((H, W, 4), np.uint8)
    if bot_h:
        g = np.linspace(0, 1, bot_h) ** 1.5 * max_a
        px[H - bot_h:, :, 3] = g[:, None].astype(np.uint8)
    if top_h:
        g = np.linspace(1, 0, top_h) ** 1.5 * (max_a * 0.75)
        px[:top_h, :, 3] = np.maximum(px[:top_h, :, 3], g[:, None].astype(np.uint8))
    return Image.fromarray(px, "RGBA")
SCRIM_B = make_scrim(top_h=420, bot_h=980)
SCRIM_SOFT = make_scrim(top_h=360, bot_h=760, max_a=160)

def make_glow():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((x - W / 2) / 520) ** 2 + ((y - 800) / 620) ** 2)
    a = np.clip(1 - d, 0, 1) ** 2 * 58
    ov = np.zeros((H, W, 4), np.uint8)
    ov[:, :, 0] = 232; ov[:, :, 1] = 196; ov[:, :, 2] = 110
    ov[:, :, 3] = a.astype(np.uint8)
    return Image.fromarray(ov, "RGBA")
GLOW = make_glow()

def light_sweep(canvas, u, t0, t1, strength=52):
    """Soft diagonal warm highlight travelling across the frame."""
    p = fade(u, t0, t1)
    if p <= 0 or p >= 1: return canvas
    yy, xx = np.mgrid[0:H:4, 0:W:4].astype(np.float32)
    pos = lerp(-500, W + 500, ease_inout(p))
    band = np.exp(-(((xx * 4 + yy * 4 * 0.35) - pos) ** 2) / (2 * 260 ** 2))
    a = (band * strength * math.sin(math.pi * p)).astype(np.uint8)
    ov = np.zeros((H // 4, W // 4, 4), np.uint8)
    ov[:, :, 0] = 255; ov[:, :, 1] = 240; ov[:, :, 2] = 205; ov[:, :, 3] = a
    canvas.paste(Image.fromarray(ov, "RGBA").resize((W, H), Image.BILINEAR),
                 (0, 0), Image.fromarray(ov, "RGBA").resize((W, H), Image.BILINEAR))
    return canvas

# ---------------------------------------------------------------- text ------
_tmp_draw = ImageDraw.Draw(Image.new("RGB", (8, 8)))
def tracked_w(text, fnt, tracking=0):
    return sum(fnt.getlength(c) for c in text) + tracking * max(0, len(text) - 1)

def fit_font(text, max_w, size, tracking=0, bold=True):
    while size > 20 and tracked_w(text, font(size, bold), tracking) > max_w:
        size -= 2
    return font(size, bold), size

def text_layer(text, fnt, fill, tracking=0):
    tw = int(tracked_w(text, fnt, tracking)) + 8
    asc, desc = fnt.getmetrics()
    th = asc + desc + 8
    lay = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    x = 4
    for c in text:
        d.text((x, 4), c, font=fnt, fill=fill + (255,))
        x += fnt.getlength(c) + tracking
    return lay

def put_text(canvas, cx, y, text, fnt, fill, tracking=0, alpha=1.0, dy=0, align="c"):
    if alpha <= 0: return 0
    lay = text_layer(text, fnt, fill, tracking)
    if alpha < 1:
        a = lay.split()[3].point(lambda v: int(v * alpha))
        lay.putalpha(a)
    x = int(cx - lay.width / 2) if align == "c" else int(cx)
    canvas.paste(lay, (x, int(y + dy)), lay)
    return lay.width

def gold_rule(canvas, cx, y, half_w, alpha=1.0, color=GOLD):
    if alpha <= 0 or half_w <= 1: return
    lay = Image.new("RGBA", (W, 6), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.line([(cx - half_w, 3), (cx + half_w, 3)], fill=color + (int(255 * alpha),), width=3)
    canvas.paste(lay, (0, int(y)), lay)

def panel(canvas, img, cx, cy, w, h, angle=0, alpha=1.0, dy=0):
    """Fabric swatch card with soft contact shadow + ivory keyline."""
    card = img.convert("RGBA")
    d = ImageDraw.Draw(card)
    d.rectangle([0, 0, w - 1, h - 1], outline=(245, 240, 228, 255), width=3)
    sh = Image.new("RGBA", (w + 60, h + 60), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([30, 30, w + 30, h + 30], fill=(0, 0, 0, 130))
    sh = sh.filter(ImageFilter.GaussianBlur(16))
    if angle:
        card = card.rotate(angle, expand=True, resample=Image.BICUBIC)
        sh = sh.rotate(angle, expand=True, resample=Image.BICUBIC)
    if alpha < 1:
        for im_ in (card, sh):
            im_.putalpha(im_.split()[3].point(lambda v: int(v * alpha)))
    canvas.paste(sh, (int(cx - sh.width / 2 + 10), int(cy - sh.height / 2 + 18 + dy)), sh)
    canvas.paste(card, (int(cx - card.width / 2), int(cy - card.height / 2 + dy)), card)

def eyebrow(canvas, u, text="BAHUBALI FABRICS  •  DELHI", y=128, color=GOLD_LT, t_in=(0.25, 0.9)):
    a = ease_out(fade(u, *t_in))
    put_text(canvas, W / 2, y, text, font(33, True), color, tracking=7, alpha=a)

# --------------------------------------------------------------- SCENE 1 ----
def scene1(u):
    z = lerp(1.12, 1.48, ease_inout(fade(u, 0, 4.0)))
    fr = cover(HT, W, H, cx=0.25, cy=0.72, zoom=z)          # deep green houndstooth macro
    b = lerp(0.52, 0.98, ease_out(fade(u, 0, 1.3)))
    fr = ImageEnhance.Brightness(fr).enhance(b)
    cv = fr.convert("RGBA")
    light_sweep(cv, u, 0.7, 2.3, 46)
    cv.paste(SCRIM_B, (0, 0), SCRIM_B); cv.paste(VIG, (0, 0), VIG)
    eyebrow(cv, u)
    a1 = ease_out(fade(u, 0.55, 1.35)); dy1 = (1 - a1) * 46
    put_text(cv, W/2, 1230, "WINTER DEMAND", font(96), IVORY, 2, a1, dy1)
    put_text(cv, W/2, 1345, "IS COMING", font(96), IVORY, 2, a1, dy1)
    gold_rule(cv, W/2, 1495, 150 * ease_out(fade(u, 1.2, 1.9)), fade(u, 1.2, 1.9))
    a2 = ease_out(fade(u, 1.95, 2.75)); dy2 = (1 - a2) * 34
    f2, _ = fit_font("IS YOUR SOURCING READY?", 880, 56, 4)
    put_text(cv, W/2, 1545, "IS YOUR SOURCING READY?", f2, GOLD_LT, 4, a2, dy2)
    return cv.convert("RGB")

# --------------------------------------------------------------- SCENE 2 ----
def scene2(u):
    fr = cover(HB, W, H, cx=lerp(0.23, 0.28, fade(u, 0, 4)), cy=0.74, zoom=1.25)
    fr = ImageEnhance.Brightness(fr).enhance(0.82)
    cv = fr.convert("RGBA")
    cv.paste(SCRIM_SOFT, (0, 0), SCRIM_SOFT); cv.paste(VIG, (0, 0), VIG)
    eyebrow(cv, u, "THE SOURCING CHAIN")
    words = [("01", "SOURCING", 0.30), ("02", "LAB-DIPS", 1.25), ("03", "APPROVALS", 2.20)]
    x0, x1, ty = 110, 970, 1520
    d = ImageDraw.Draw(cv)
    prog = ease_inout(fade(u, 0.30, 3.15))
    d.line([(x0, ty), (x1, ty)], fill=(243, 237, 224, 70), width=3)
    d.line([(x0, ty), (lerp(x0, x1, prog), ty)], fill=GOLD + (255,), width=5)
    marks = [0.04, 0.50, 0.96]
    for i, (num, word, t0) in enumerate(words):
        a = ease_out(fade(u, t0, t0 + 0.7)); dx = (1 - a) * -56
        y = 640 + i * 190
        put_text(cv, 112 + dx, y + 16, num, font(40), GOLD, 2, a, align="l")
        put_text(cv, 212 + dx, y, word, font(88), IVORY, 2, a, align="l")
        mx = lerp(x0, x1, marks[i]); r = 13 * ease_out(fade(u, t0, t0 + 0.45))
        if r > 1:
            d.ellipse([mx - r, ty - r, mx + r, ty + r], fill=IVORY + (255,),
                      outline=GOLD + (255,), width=4)
    a3 = ease_out(fade(u, 2.65, 3.35))
    f3, _ = fit_font("DELAYS HERE SLOW THE WHOLE PRODUCTION", 880, 34, 3)
    put_text(cv, W/2, 1625, "DELAYS HERE SLOW THE WHOLE PRODUCTION", f3,
             (216, 206, 186), 3, a3)
    return cv.convert("RGB")

# --------------------------------------------------------------- SCENE 3 ----
_PANELS = None
def scene3(u):
    global _PANELS
    bg = cover(GEO, W, H, cx=0.22, cy=0.12, zoom=1.3)
    bg = ImageEnhance.Brightness(bg).enhance(0.34)
    cv = Image.new("RGBA", (W, H), CHARCOAL + (255,))
    cv.paste(bg.convert("RGBA"), (0, 0))
    cv.paste(VIG, (0, 0), VIG)
    eyebrow(cv, u, "WINTER KA WINDOW CHHOTA HAI", y=150)
    a1 = ease_out(fade(u, 0.35, 1.15)); dy1 = (1 - a1) * 40
    fh, _ = fit_font("LAUNCH WINDOWS", 930, 100, 3)
    put_text(cv, W/2, 225, "SHORTER", fh, IVORY, 3, a1, dy1)
    put_text(cv, W/2, 340, "LAUNCH WINDOWS", fh, IVORY, 3, a1, dy1)
    if _PANELS is None:
        _PANELS = [cover(HT, 320, 560, 0.76, 0.72, 2.3),    # brown houndstooth
                   cover(GEO, 320, 560, 0.76, 0.82, 3.4),   # ivory geometric
                   cover(HB, 320, 560, 0.25, 0.37, 3.4)]    # slate herringbone
    pos = [(252, 800, 4), (540, 770, 0), (828, 800, -4)]
    for i, (pimg, (px, py, ang)) in enumerate(zip(_PANELS, pos)):
        a = ease_out(fade(u, 0.15 + i * 0.22, 0.95 + i * 0.22))
        panel(cv, pimg, px, py, 320, 560, angle=ang, alpha=a, dy=(1 - a) * 130)
    # compressing timeline
    ty = 1350
    shrink = ease_inout(fade(u, 0.85, 2.25))
    hw = lerp(430, 185, shrink)
    d = ImageDraw.Draw(cv)
    put_text(cv, W/2, ty - 92, "LAUNCH WINDOW", font(32), (200, 190, 168), 6,
             ease_out(fade(u, 0.7, 1.3)))
    col = IVORY if shrink < 0.85 else GOLD_LT
    d.line([(W/2 - hw, ty), (W/2 + hw, ty)], fill=col + (255,), width=6)
    for s in (-1, 1):
        ex = W/2 + s * hw
        d.line([(ex, ty - 26), (ex, ty + 26)], fill=col + (255,), width=6)
    d.ellipse([W/2 - 10, ty - 10, W/2 + 10, ty + 10], fill=RED + (255,))
    a2 = ease_out(fade(u, 2.35, 3.15)); dy2 = (1 - a2) * 36
    gold_rule(cv, W/2, 1468, 120 * a2, a2)
    put_text(cv, W/2, 1505, "EVERY DAY COUNTS", font(72), GOLD_LT, 3, a2, dy2)
    return cv.convert("RGB")

# --------------------------------------------------------------- SCENE 4 ----
def _shot_word(cv, word, a, dy):
    f = font(112)
    w1 = tracked_w(word, f, 2); w2 = f.getlength(".")
    x = int((W - (w1 + w2)) / 2)
    put_text(cv, x, 1520, word, f, IVORY, 2, a, dy, align="l")
    put_text(cv, x + w1, 1520, ".", f, RED, 0, a, dy, align="l")

def shot4(i, u):
    if i == 0:   # TEXTURE - herringbone macro, lateral drift
        fr = cover(HB, W, H, cx=lerp(0.70, 0.80, fade(u, 0, 1.6)), cy=0.80, zoom=2.0)
        word = "TEXTURE"
    elif i == 1: # COLOUR - velvet colour range
        fr = cover(VEL, W, H, cx=0.5, cy=lerp(0.38, 0.47, fade(u, 0, 1.6)), zoom=1.35)
        word = "COLOUR"
    elif i == 2: # CHOICE - ribbed textures, gentle push
        fr = cover(RIB, W, H, cx=0.5, cy=0.44, zoom=lerp(1.2, 1.42, fade(u, 0, 1.6)))
        word = "CHOICE"
    else:        # PLAN - diptych chevron / houndstooth
        lf = cover(CHEV, W // 2, H, cx=0.42, cy=0.5, zoom=1.25)
        rt = cover(HT, W // 2, H, cx=0.76, cy=0.7, zoom=1.5)
        cv = Image.new("RGBA", (W, H), (0, 0, 0, 255))
        cv.paste(lf.convert("RGBA"), (0, 0)); cv.paste(rt.convert("RGBA"), (W // 2, 0))
        cv.paste(VIG, (0, 0), VIG)
        d = ImageDraw.Draw(cv)
        d.rectangle([0, 800, W, 1130], fill=(16, 14, 12, 178))
        d.line([(0, 800), (W, 800)], fill=GOLD + (255,), width=3)
        d.line([(0, 1130), (W, 1130)], fill=GOLD + (255,), width=3)
        d.line([(W//2, 0), (W//2, H)], fill=GOLD + (200,), width=3)
        a = ease_out(fade(u, 0.15, 0.85)); dy = (1 - a) * 30
        put_text(cv, W/2, 845, "PLAN YOUR", font(84), IVORY, 3, a, dy)
        put_text(cv, W/2, 950, "WINTER COLLECTION", font(84), GOLD_LT, 3, a, dy)
        return cv.convert("RGB")
    cv = fr.convert("RGBA")
    light_sweep(cv, u, 0.05, 1.0, 40)
    cv.paste(SCRIM_B, (0, 0), SCRIM_B); cv.paste(VIG, (0, 0), VIG)
    eyebrow(cv, u + 1, "THE WINTER RANGE", t_in=(1.0, 1.5))
    a = ease_out(fade(u, 0.18, 0.8))
    _shot_word(cv, word, a, (1 - a) * 44)
    gold_rule(cv, W/2, 1480, 90 * a, a)
    return cv.convert("RGB")

def scene4(u):
    seg = 1.5
    i = min(3, int(u // seg)); lu = u - i * seg
    fr = shot4(i, lu)
    if lu > seg - 0.25 and i < 3:  # internal texture-match dissolve
        nxt = shot4(i + 1, lu - (seg - 0.25))
        fr = Image.blend(fr, nxt, ease_inout((lu - (seg - 0.25)) / 0.25))
    return fr

# --------------------------------------------------------------- SCENE 5 ----
def scene5(u):
    bg = cover(GEO, W, H, cx=0.2, cy=0.1, zoom=1.4)
    bg = ImageEnhance.Brightness(bg).enhance(0.22)
    cv = Image.new("RGBA", (W, H), NEARBLACK + (255,))
    cv.paste(bg.convert("RGBA"), (0, 0))
    cv.paste(GLOW, (0, 0), GLOW); cv.paste(VIG, (0, 0), VIG)
    a = ease_out(fade(u, 0.35, 1.45))
    lw = int(820 * lerp(0.94, 1.0, a))
    logo = LOGO.resize((lw, lw), Image.LANCZOS)
    if a < 1:
        logo.putalpha(logo.split()[3].point(lambda v: int(v * a)))
    lx, ly = (W - lw) // 2, 300
    # gold sweep masked to the emblem artwork itself
    p = fade(u, 1.55, 2.85)
    if 0 < p < 1:
        arr = np.asarray(logo).astype(np.float32)
        yy, xx = np.mgrid[0:lw, 0:lw].astype(np.float32)
        pos = lerp(-260, lw + 260, ease_inout(p))
        band = np.exp(-(((xx + yy * 0.3) - pos) ** 2) / (2 * 120 ** 2))
        gain = band * (arr[:, :, 3] / 255.0) * 120 * math.sin(math.pi * p)
        arr[:, :, 0] = np.clip(arr[:, :, 0] + gain, 0, 255)
        arr[:, :, 1] = np.clip(arr[:, :, 1] + gain * 0.85, 0, 255)
        arr[:, :, 2] = np.clip(arr[:, :, 2] + gain * 0.45, 0, 255)
        logo = Image.fromarray(arr.astype(np.uint8), "RGBA")
    cv.paste(logo, (lx, ly), logo)
    base_y = ly + 820 + 46
    a2 = ease_out(fade(u, 1.7, 2.4))
    gold_rule(cv, W/2, base_y, 150 * a2, a2)
    put_text(cv, W/2, base_y + 34, "D E L H I", font(52), IVORY, 10, a2, (1 - a2) * 24)
    a3 = ease_out(fade(u, 2.15, 2.85))
    put_text(cv, W/2, base_y + 120, "WINTER COLLECTION SOURCING", font(32),
             GOLD_LT, 6, a3, (1 - a3) * 20)
    return cv.convert("RGB")

# --------------------------------------------------------------- SCENE 6 ----
def scene6(u):
    cv = Image.new("RGBA", (W, H), IVORY_BG + (255,))
    stripL = cover(HT, 76, H, cx=0.76, cy=0.1, zoom=1.8)   # beige houndstooth edge
    stripR = cover(HB, 76, H, cx=0.75, cy=0.72, zoom=1.8)  # cream herringbone edge
    cv.paste(stripL.convert("RGBA"), (0, 0)); cv.paste(stripR.convert("RGBA"), (W - 76, 0))
    d = ImageDraw.Draw(cv)
    d.line([(76, 0), (76, H)], fill=GOLD + (255,), width=3)
    d.line([(W - 76, 0), (W - 76, H)], fill=GOLD + (255,), width=3)
    cx = W / 2
    a0 = ease_out(fade(u, 0.15, 0.8))
    put_text(cv, cx, 150, "BAHUBALI FABRICS  •  DELHI", font(34), GOLD_DK, 6, a0)
    a1 = ease_out(fade(u, 0.4, 1.2)); dy1 = (1 - a1) * 40
    put_text(cv, cx, 235, "PLAN YOUR WINTER", font(78), INK, 2, a1, dy1)
    put_text(cv, cx, 328, "SOURCING NOW", font(78), INK, 2, a1, dy1)
    gold_rule(cv, cx, 452, 140 * ease_out(fade(u, 1.0, 1.6)), fade(u, 1.0, 1.6))
    # original logo on its black plaque (artwork untouched)
    a2 = ease_out(fade(u, 0.75, 1.55)); dy2 = (1 - a2) * 46
    pw = 470; px, py = int(cx - pw / 2), int(520 + dy2)
    sh = Image.new("RGBA", (pw + 56, pw + 56), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([28, 28, pw + 28, pw + 28], 26, fill=(0, 0, 0, 110))
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    if a2 < 1: sh.putalpha(sh.split()[3].point(lambda v: int(v * a2)))
    cv.paste(sh, (px - 28 + 8, py - 28 + 14), sh)
    plaque = Image.new("RGBA", (pw, pw), (0, 0, 0, 255))
    lg = LOGO_PLAQUE.resize((pw - 16, pw - 16), Image.LANCZOS).convert("RGBA")
    plaque.paste(lg, (8, 8))
    mask = Image.new("L", (pw, pw), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, pw - 1, pw - 1], 26, fill=255)
    if a2 < 1: mask = mask.point(lambda v: int(v * a2))
    cv.paste(plaque, (px, py), mask)
    a3 = ease_out(fade(u, 1.55, 2.25)); dy3 = (1 - a3) * 30
    fcall, _ = fit_font("Call: +91-8700764311", 840, 66, 1)
    put_text(cv, cx, 1095, "Call: +91-8700764311", fcall, INK, 1, a3, dy3)
    a4 = ease_out(fade(u, 1.9, 2.6)); dy4 = (1 - a4) * 26
    fweb, _ = fit_font("www.bahubalifabrics.com", 840, 54, 1)
    put_text(cv, cx, 1205, "www.bahubalifabrics.com", fweb, GOLD_DK, 1, a4, dy4)
    a5 = ease_out(fade(u, 2.3, 3.0))
    gold_rule(cv, cx, 1335, 100 * a5, a5)
    fcap, _ = fit_font("WINTER COLLECTION SOURCING — DELHI, INDIA", 800, 30, 4)
    put_text(cv, cx, 1375, "WINTER COLLECTION SOURCING — DELHI, INDIA",
             fcap, GREY_TXT, 4, a5)
    # bottom fabric swatch strip for a finished, art-directed foot
    a6 = ease_out(fade(u, 2.1, 2.9))
    if a6 > 0:
        foot = cover(VEL, 880, 250, cx=0.5, cy=0.45, zoom=1.15).convert("RGBA")
        if a6 < 1: foot.putalpha(foot.split()[3].point(lambda v: int(v * a6)))
        cv.paste(foot, (100, 1500 + int((1 - a6) * 60)), foot)
        ImageDraw.Draw(cv).rectangle([100, 1500 + int((1 - a6) * 60),
                                       979, 1749 + int((1 - a6) * 60)],
                                      outline=GOLD + (int(255 * a6),), width=3)
    return cv.convert("RGB")

SCENES = [(0, scene1), (4, scene2), (8, scene3), (12, scene4), (18, scene5), (23, scene6)]
XFADE = {4: 0.0, 8: 0.25, 12: 0.25, 18: 0.40, 23: 0.40}  # S1->S2 is a match cut

def render_frame(t):
    idx = max(i for i, (s, _) in enumerate(SCENES) if t >= s)
    start, fn = SCENES[idx]
    fr = fn(t - start)
    if idx + 1 < len(SCENES):
        nstart, nfn = SCENES[idx + 1]
        xf = XFADE.get(nstart, 0)
        if xf and t > nstart - xf:
            fr2 = nfn(t - (nstart - xf))
            fr = Image.blend(fr, fr2, ease_inout((t - (nstart - xf)) / xf))
    return fr

# ---------------------------------------------------------------- audio -----
SR = 48000
def run(cmd): subprocess.run(cmd, check=True, capture_output=True)

def vo_wav(name, max_dur):
    src = os.path.join(AUD, name); out = src.replace(".mp3", "_48k.wav")
    tmp = src.replace(".mp3", "_raw.wav")
    run([FFMPEG, "-y", "-i", src, "-ar", str(SR), "-ac", "1", tmp])
    with wave.open(tmp) as wf: dur = wf.getnframes() / SR
    af = []
    if dur > max_dur:
        af = ["-filter:a", f"atempo={min(1.30, dur / max_dur):.3f}"]
        print(f"[vo] {name} {dur:.2f}s -> tempo-fit to <={max_dur}s")
    else:
        print(f"[vo] {name} {dur:.2f}s OK")
    run([FFMPEG, "-y", "-i", tmp, *af, "-ar", str(SR), "-ac", "1", out])
    with wave.open(out) as wf:
        data = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
    peak = np.abs(data).max() or 1
    return data * (0.78 / peak)

def build_audio(path):
    N = int(DUR * SR); t = np.arange(N) / SR
    music = np.zeros(N, np.float32); sfx = np.zeros(N, np.float32)
    rng = np.random.default_rng(7)
    # warm pad: Dm - Bb - F - C (4 s each, overlapping swells)
    chords = [[146.83, 174.61, 220.0, 293.66], [116.54, 146.83, 174.61, 233.08],
              [174.61, 220.0, 261.63, 349.23], [130.81, 164.81, 196.0, 261.63],
              [146.83, 174.61, 220.0, 293.66], [116.54, 146.83, 174.61, 233.08],
              [174.61, 220.0, 261.63, 349.23]]
    seg = 4.0; ln = int((seg + 1.2) * SR); tt = np.arange(ln) / SR
    env = np.clip(tt / 0.9, 0, 1) * np.clip((seg + 1.2 - tt) / 1.2, 0, 1)
    for i, ch in enumerate(chords):
        sig = np.zeros(ln, np.float32)
        for f in ch:
            sig += np.sin(2 * np.pi * f * tt) + 0.30 * np.sin(2 * np.pi * 2 * f * tt) \
                 + 0.12 * np.sin(2 * np.pi * 3 * f * tt)
        sig += 1.6 * np.sin(2 * np.pi * (ch[0] / 2) * tt)
        sig *= env * (0.85 + 0.15 * np.sin(2 * np.pi * 0.1 * tt))
        s = int(i * seg * SR); e = min(N, s + ln)
        music[s:e] += sig[:e - s]
    music *= 0.045
    # gentle plucked motif from the showcase onward (warmer, confident)
    scale = [293.66, 349.23, 392.0, 440.0, 523.25, 587.33]
    motif = [0, 2, 4, 3, 1, 2, 4, 5, 4, 2, 1, 2, 0, 2, 4, 3]
    pl = int(0.55 * SR); pt = np.arange(pl) / SR
    for k, idx in enumerate(motif):
        s = int((12.2 + k * 0.92) * SR)
        if s + pl > N: break
        f = scale[idx]
        tone = (np.sin(2 * np.pi * f * pt) + 0.25 * np.sin(2 * np.pi * 2 * f * pt)) * np.exp(-pt * 7)
        music[s:s + pl] += tone * 0.05
    # soft low pulse, scenes 1-3
    pu = int(0.30 * SR); pt2 = np.arange(pu) / SR
    pulse = np.sin(2 * np.pi * 52 * pt2) * np.exp(-pt2 * 14) * 0.10
    for ssec in np.arange(0.5, 11.8, 1.0):
        s = int(ssec * SR); music[s:s + pu] += pulse
    # --- SFX ---
    def add(sig, at, gain=1.0):
        s = int(at * SR); e = min(N, s + len(sig)); sfx[s:e] += sig[:e - s] * gain
    def impact(at, g):
        n = int(1.1 * SR); tt = np.arange(n) / SR
        f = 38 + 52 * np.exp(-tt * 6)
        add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 4.5), at, g)
    def whoosh(at, g=0.14, dur=0.75):
        n = int(dur * SR); noise = rng.standard_normal(n).astype(np.float32)
        out = np.zeros(n, np.float32); y = 0.0
        coef = 0.02 + 0.30 * np.sin(np.pi * np.arange(n) / n) ** 2
        for i in range(n):
            y += coef[i] * (noise[i] - y); out[i] = y
        add(out * np.sin(np.pi * np.arange(n) / n) ** 2, at, g * 3.2)
    def tick(at, g=0.05):
        n = int(0.035 * SR); noise = rng.standard_normal(n).astype(np.float32)
        add(np.diff(np.concatenate([[0], noise])) * np.exp(-np.arange(n) / SR * 160), at, g)
    impact(0.05, 0.55); impact(12.05, 0.28); impact(18.05, 0.50)
    whoosh(0.65); whoosh(3.85, 0.11); whoosh(7.85, 0.11); whoosh(11.85, 0.12); whoosh(17.85, 0.11)
    for ssec in np.arange(0.5, 11.9, 0.5): tick(float(ssec), 0.035)
    for ssec in (12.1, 13.6, 15.1, 16.6): whoosh(float(ssec), 0.07, 0.4)  # cloth swishes
    for k, f in enumerate((2637, 3520, 4699)):  # gold shimmer on logo sweep
        n = int(0.9 * SR); tt = np.arange(n) / SR
        add(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 5), 19.45 + k * 0.14, 0.028)
    for k, f in enumerate((659.25, 987.77)):    # closing chime
        n = int(1.7 * SR); tt = np.arange(n) / SR
        add(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 2.6), 25.75 + k * 0.22, 0.05)
    # --- voiceover placement + ducking ---
    vo = np.zeros(N, np.float32)
    plan = [("vo1.mp3", 0.40, 3.4), ("vo2.mp3", 4.40, 3.4), ("vo3.mp3", 8.40, 3.4),
            ("vo4.mp3", 12.40, 5.4), ("vo5.mp3", 19.00, 3.2), ("vo6.mp3", 23.60, 3.9)]
    for name, at, mx in plan:
        clip = vo_wav(name, mx); s = int(at * SR); e = min(N, s + len(clip))
        vo[s:e] += clip[:e - s]
        print(f"[vo] placed {name} at {at:.1f}s, len {len(clip)/SR:.2f}s")
    win = int(0.12 * SR)
    env_vo = np.convolve(np.abs(vo), np.ones(win) / win, mode="same")
    env_vo = np.convolve(env_vo, np.ones(win) / win, mode="same")
    duck = 1 - 0.62 * np.clip(env_vo * 3.2, 0, 1)
    mix = music * duck + sfx * (0.55 + 0.45 * duck) + vo
    # 6 ms stereo width on the music bed only
    dly = int(0.006 * SR)
    right = np.concatenate([np.zeros(dly, np.float32), (music * duck)[:-dly]]) + sfx * (0.55 + 0.45 * duck) + vo
    stereo = np.stack([mix, right], axis=1)
    peak = np.abs(stereo).max() or 1
    stereo = (stereo / peak * 0.89 * 32767).astype(np.int16)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes(stereo.tobytes())
    print(f"[audio] mix written: {path}")

# ---------------------------------------------------------------- main ------
def main():
    silent = os.path.join(ROOT, "frames", "silent.mp4")
    mixwav = os.path.join(AUD, "final_mix.wav")
    final = os.path.join(REPO, "Bahubali_Winter_Reel_Final.mp4")
    preview = os.path.join(REPO, "Bahubali_Winter_Reel_Preview.jpg")
    print(f"[render] {NFRAMES} frames @ {W}x{H} {FPS}fps via {FFMPEG}")
    proc = subprocess.Popen(
        [FFMPEG, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset", "medium",
         "-crf", "17", "-pix_fmt", "yuv420p", silent],
        stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    shots, shot_t = [], [2.0, 6.2, 10.6, 13.0, 15.9, 20.6, 26.6]
    for i in range(NFRAMES):
        t = i / FPS
        fr = render_frame(t)
        proc.stdin.write(fr.tobytes())
        for st in list(shot_t):
            if abs(t - st) < 0.5 / FPS:
                shots.append((st, fr.copy())); shot_t.remove(st)
        if i % 90 == 0: print(f"[render] frame {i}/{NFRAMES} (t={t:.1f}s)", flush=True)
    proc.stdin.close(); proc.wait()
    print("[render] silent video done")
    build_audio(mixwav)
    run([FFMPEG, "-y", "-i", silent, "-i", mixwav, "-c:v", "copy", "-c:a", "aac",
         "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", final])
    # contact-sheet preview (4 over 3)
    tw, th = 360, 640
    sheet = Image.new("RGB", (tw * 4 + 50, th * 2 + 30), (24, 22, 19))
    shots.sort()
    for k, (_, im) in enumerate(shots):
        thumb = im.resize((tw, th), Image.LANCZOS)
        r, c = divmod(k, 4)
        xoff = 10 + c * (tw + 10) if r == 0 else int((tw * 4 + 50 - (tw * 3 + 20)) / 2) + c * (tw + 10)
        sheet.paste(thumb, (xoff, 10 + r * (th + 10)))
    sheet.save(preview, quality=90)
    print(f"[done] {final}\n[done] {preview}")

if __name__ == "__main__":
    main()
