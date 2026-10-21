"""The seven scenes of "Winter Ka Window Chhota Hai" (31 s, 9:16, 1080x1920).

Real client fabric photographs and the client's original logo are composited
here; the AI stills are used only as environment plates and are never asked to
invent a weave, a colour or a logo.
"""
from __future__ import annotations

import functools
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import core as C
from core import (H, W, GOLD, IVORY, RED, CHAR, clamp, ease_in, ease_in_out,
                  ease_out, lerp, ramp, smooth, text_layer, put_text, hairline,
                  tick, light_sweep, blur, blur_a, over, blend_add, blend_screen,
                  scrim)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO_PATH = os.path.join(ROOT, "assets", "logo", "bahubali-logo.png")

# Cut points follow the recorded Hindi VO so no two lines ever overlap.
SCENES = [
    ("s1", 0.00, 4.62),
    ("s2", 4.62, 9.12),
    ("s3", 9.12, 12.96),
    ("s4", 12.96, 16.62),
    ("s5", 16.62, 23.06),
    ("s6", 23.06, 26.16),
    ("s7", 26.16, 31.00),
]
TOTAL = 31.0


# ------------------------------------------------------------------ assets
@functools.lru_cache(maxsize=8)
def logo(width: int) -> Image.Image:
    im = Image.open(LOGO_PATH).convert("RGBA")
    im = im.crop(im.split()[3].getbbox())
    s = width / im.width
    return im.resize((width, max(1, int(im.height * s))), Image.LANCZOS)


def logo_rgb_a(width: int):
    arr = np.asarray(logo(width), np.float32) / 255.0
    return arr[..., :3], arr[..., 3]


def paste(arr_rgb, rgb, a, x, y, opacity=1.0):
    h, w = a.shape
    x, y = int(round(x)), int(round(y))
    tx0, ty0 = max(0, x), max(0, y)
    tx1, ty1 = min(W, x + w), min(H, y + h)
    if tx1 <= tx0 or ty1 <= ty0:
        return arr_rgb
    ox, oy = tx0 - x, ty0 - y
    sa = a[oy:oy + (ty1 - ty0), ox:ox + (tx1 - tx0)] * opacity
    sr = rgb[oy:oy + (ty1 - ty0), ox:ox + (tx1 - tx0)]
    arr_rgb[ty0:ty1, tx0:tx1] = C.over(arr_rgb[ty0:ty1, tx0:tx1], sr, sa)
    return arr_rgb


def add_at(arr_rgb, rgb, x, y, opacity=1.0):
    h, w = rgb.shape[:2]
    x, y = int(round(x)), int(round(y))
    tx0, ty0 = max(0, x), max(0, y)
    tx1, ty1 = min(W, x + w), min(H, y + h)
    if tx1 <= tx0 or ty1 <= ty0:
        return arr_rgb
    ox, oy = tx0 - x, ty0 - y
    sr = rgb[oy:oy + (ty1 - ty0), ox:ox + (tx1 - tx0)]
    arr_rgb[ty0:ty1, tx0:tx1] = arr_rgb[ty0:ty1, tx0:tx1] + sr * opacity
    return arr_rgb


def panel_quad(cx, cy, w, h, rx=0.0, ry=0.0, rz=0.0, persp=1.0):
    return C.project_quad(cx, cy, w, h, rx, ry, rz, persp)


def wrap_text_mask(layer, progress, softness=0.06):
    """Vertical trim-path style reveal from the baseline up."""
    h = layer.height
    yy = np.linspace(0, 1, h, dtype=np.float32)
    cut = 1.0 - progress
    return np.clip((yy - (cut - softness)) / max(1e-4, softness), 0, 1)


def put_at_baseline(img, layer, x, baseline, alpha=1.0, anchor_x="left",
                    scale=1.0, mask_rows=None):
    y = baseline - layer.baseline * scale
    ax = "tl"
    if anchor_x == "center":
        ax = "tc"
    return put_text(img, layer, x, y, alpha=alpha, anchor=ax, scale=scale,
                    mask_rows=mask_rows)


def caption_plate(img, x0=60, y0=1300, x1=760, y1=1580, strength=0.55):
    """Soft elliptical darkening under a lower-left caption so it always reads."""
    yy = np.linspace(0, H, H, dtype=np.float32)[:, None]
    xx = np.linspace(0, W, W, dtype=np.float32)[None, :]
    cy, cx = (y0 + y1) / 2.0, (x0 + x1) / 2.0
    ry, rx = (y1 - y0) / 1.35, (x1 - x0) / 1.1
    m = np.exp(-(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2) * 1.6) * strength
    return img * (1 - m[..., None])


def micro_caption(img, text, x, y, alpha, tracking=0.22, color=(206, 172, 100)):
    if alpha <= 0.01:
        return img
    lay = text_layer(text, 20, 600, color, tracking=tracking)
    put_text(img, lay, x, y, alpha=alpha)
    return img


# ------------------------------------------------------------------ scene 1
T1_A = text_layer("WINTER DEMAND", 92, 800, IVORY, tracking=0.005, line_height=1.02)
T1_B = text_layer("IS COMING", 92, 800, IVORY, tracking=0.005, line_height=1.02)
T1_C = text_layer("IS YOUR FABRIC SOURCING READY?", 30, 500, (219, 208, 190), tracking=0.15)
T1_K = text_layer("BAHUBALI FABRICS  ·  DELHI", 18, 600, (186, 154, 90), tracking=0.3)


def scene1(t, fi):
    p = ease_in_out(t / 4.0)
    img = C.view(C.plate("scene1-desk.jpg"), lerp(0.52, 0.60, p), lerp(0.40, 0.55, p),
                 lerp(1.03, 1.14, p))
    # window light drifting over the desk + implied page flutter (no morphing)
    img = light_sweep(img, x0=lerp(200, 1050, t / 4.0), width=230, angle=64,
                      strength=0.05, color=(1.0, 0.94, 0.80))
    for a, b in ((0.18, 0.40), (0.46, 0.64), (0.70, 0.86)):
        q = smooth(t, a, b)
        if 0 < q < 1:
            img = light_sweep(img, x0=lerp(-220, 1250, q), width=85, angle=76,
                              strength=0.075 * math.sin(q * math.pi),
                              color=(1.0, 0.97, 0.90))
    img = C.dust(img, t, alpha=0.55, count=16, seed=11)
    img = scrim(img, top=0.30, bottom=0.18)

    a1 = ramp(t, 0.30, 0.68)
    dy = lerp(22, 0, ease_out((t - 0.30) / 0.5))
    put_at_baseline(img, T1_A, 96, 300 + dy, alpha=a1)
    put_at_baseline(img, T1_B, 96, 394 + dy, alpha=a1)
    ln = ramp(t, 0.62, 0.98)
    if ln > 0:
        hairline(img, 96, 432, 96 + 92 * ease_out((t - 0.62) / 0.4), 432, color=GOLD,
                 alpha=0.85 * ln, width=1.5)
    put_at_baseline(img, T1_C, 96, 474, alpha=0.94 * ramp(t, 0.76, 1.14))
    put_at_baseline(img, T1_K, 96, 1780, alpha=0.55 * ramp(t, 1.3, 1.7))
    if t > 3.55:
        img = C.view(img, 0.5, 0.5, 1 + 0.05 * smooth(t, 3.55, 4.0))
    return C.finish(img, t, fi, vig=0.46, bloom_amt=0.24, grain_amt=0.017, seed=1,
                    saturation=0.9)


# ------------------------------------------------------------------ scene 2
T2_NUM = text_layer("25–40", 132, 700, IVORY, tracking=-0.014)
T2_DAYS = text_layer("DAYS*", 26, 600, (208, 172, 98), tracking=0.26)
T2_SUP = text_layer("SOURCING + LAB-DIPS + APPROVALS", 25, 500, (222, 210, 192), tracking=0.17)
T2_FOOT = text_layer("Lead time varies by fabric, supplier and approvals.", 20, 400,
                     (190, 183, 170), tracking=0.01)


def scene2(t, fi):
    p = ease_in_out(t / 4.5)
    img = C.view(C.macro("stack-dark"), lerp(0.42, 0.60, p), lerp(0.56, 0.44, p),
                 lerp(1.16, 1.30, p))
    fo = lerp(5.0, 0.0, smooth(t, 0.1, 1.5))
    if fo > 0.2:
        img = C.over(blur(img, fo), img, np.full((H, W), smooth(t, 0.5, 1.6), np.float32))
    img = light_sweep(img, x0=lerp(-300, 1350, ease_in_out(t / 4.5)), width=320,
                      angle=52, strength=0.09, color=(1.0, 0.95, 0.84))
    img = scrim(img, top=0.22, bottom=0.62, mid=0.10, mid_at=0.58)

    # timeline rule + gold marker
    draw = ramp(t, 0.5, 1.4)
    y = 1122
    if draw > 0:
        xa = lerp(96, 984, ease_out(draw, 2))
        hairline(img, 96, y, xa, y, color=(228, 216, 198), alpha=0.5, width=1.3)
        for i in range(9):
            tx = 96 + (984 - 96) * i / 8
            if tx <= xa:
                th = 9 if i % 4 == 0 else 5
                hairline(img, tx, y - th, tx, y + th, color=(228, 216, 198),
                         alpha=0.38, width=1.1)
    mk = ramp(t, 1.3, 1.7)
    if mk > 0:
        tick(img, 540, y, 12 * ease_out(mk) + 3, color=GOLD, alpha=0.95 * mk, glow=0.45)

    num_p = smooth(t, 1.05, 1.8)
    if num_p > 0:
        sc = lerp(0.965, 1.0, ease_out(num_p))
        put_at_baseline(img, T2_NUM, 96, 1290, alpha=0.99 * min(1, num_p * 2.4),
                        scale=sc, mask_rows=wrap_text_mask(T2_NUM, ease_out(num_p, 1.6)))
    dp = ramp(t, 1.45, 1.85)
    if dp > 0:
        dw = T2_NUM.width * 1.0
        put_at_baseline(img, T2_DAYS, 96 + dw + 26, 1288, alpha=0.95 * dp)
        hairline(img, 96 + dw + 26, 1304, 96 + dw + len("DAYS*") * 18, 1304,
                 color=GOLD, alpha=0.7 * dp, width=1.2)
    sp = ramp(t, 1.8, 2.25)
    put_at_baseline(img, T2_SUP, 96, 1372, alpha=0.92 * sp)
    fp = ramp(t, 2.4, 2.9)
    put_at_baseline(img, T2_FOOT, 96, 1424, alpha=0.55 * fp)
    return C.finish(img, t, fi, vig=0.44, bloom_amt=0.22, grain_amt=0.016, seed=2,
                    saturation=0.94)


# ------------------------------------------------------------------ scene 3
T3_A = text_layer("SHORTER LAUNCH", 82, 800, IVORY, tracking=0.0, line_height=1.04)
T3_B = text_layer("WINDOWS", 82, 800, IVORY, tracking=0.0, line_height=1.04)
T3_C = text_layer("EVERY DAY COUNTS", 31, 600, (208, 172, 96), tracking=0.22)
T3_D = text_layer("FASTER COLLECTION CYCLES", 21, 500, (204, 195, 180), tracking=0.2)
T3_LBL = text_layer("LONG LEAD TIME", 18, 600, (200, 192, 176), tracking=0.24)
T3_LBL2 = text_layer("SQUEEZED WINDOW", 18, 600, (196, 116, 88), tracking=0.24)


def scene3(t, fi):
    p = ease_in_out(t / 3.9)
    img = C.view(C.plate("scene3-planning.jpg"), lerp(0.44, 0.54, p),
                 lerp(0.50, 0.545, p), lerp(1.04, 1.16, p), rot=lerp(-1.2, 0.0, p))
    img = light_sweep(img, x0=lerp(300, 900, p), width=360, angle=58,
                      strength=0.045, color=(1.0, 0.96, 0.88))
    img = scrim(img, top=0.34, bottom=0.42)

    y_long = 1046
    grow = ramp(t, 0.3, 1.1)
    if grow > 0:
        xa = lerp(96, 984, ease_out(grow, 2))
        hairline(img, 96, y_long, xa, y_long, color=(238, 230, 214), alpha=0.92, width=2.2,
                 glow=0.10)
        for i in range(15):
            tx = 96 + (984 - 96) * i / 14
            if tx <= xa:
                hairline(img, tx, y_long - 7, tx, y_long + 7, color=(238, 230, 214),
                         alpha=0.5, width=1.1)


    sh = ramp(t, 1.45, 2.15)
    if sh > 0:
        x_end = lerp(984, 500, ease_in_out(sh))
        y2 = 1160
        # connector: the long bar's end drops down to the squeezed bar
        hairline(img, x_end, y_long + 10, x_end, y2 - 10, color=(238, 230, 214),
                 alpha=0.55 * sh, width=1.2)
        hairline(img, 96, y2, x_end, y2, color=(238, 230, 214), alpha=0.95, width=3.2,
                 glow=0.12)
        hairline(img, x_end, y2 - 13, x_end, y2 + 13, color=(216, 178, 102),
                 alpha=0.95 * sh, width=1.8, glow=0.35)
        for i in range(3):
            ax = x_end + 30 + i * 34
            av = (0.45 - i * 0.12) * sh
            if av > 0:
                hairline(img, ax, y2 - 8, ax + 16, y2, color=(214, 176, 100),
                         alpha=av, width=1.3)
                hairline(img, ax, y2 + 8, ax + 16, y2, color=(214, 176, 100),
                         alpha=av, width=1.3)
        red_p = ramp(t, 1.95, 2.4)
        if red_p > 0:
            hairline(img, 500, y2, lerp(500, 872, ease_out(red_p)), y2,
                     color=(206, 74, 56), alpha=1.0 * red_p, width=3.2, glow=0.3)


    a = ramp(t, 0.45, 0.9)
    dy = lerp(18, 0, ease_out((t - 0.45) / 0.5))
    put_at_baseline(img, T3_A, 96, 300 + dy, alpha=a)
    put_at_baseline(img, T3_B, 96, 390 + dy, alpha=a)
    c = ramp(t, 1.05, 1.45)
    if c > 0:
        hairline(img, 96, 426, 96 + 74 * ease_out((t - 1.05) / 0.4), 426, color=GOLD,
                 alpha=0.8 * c, width=1.5)
    put_at_baseline(img, T3_C, 96, 468, alpha=0.95 * c)
    put_at_baseline(img, T3_D, 96, 1512, alpha=0.72 * ramp(t, 2.3, 2.8))
    return C.finish(img, t, fi, vig=0.44, bloom_amt=0.18, grain_amt=0.015, seed=3,
                    saturation=0.88)


# ------------------------------------------------------------------ scene 4
T4_A = text_layer("LATE SOURCING", 68, 800, IVORY, tracking=0.0)
T4_B = text_layer("MISSED", 68, 800, (212, 72, 54), tracking=0.0)
T4_C = text_layer("SELLING WINDOW", 68, 800, IVORY, tracking=0.0)
T4_D = text_layer("PLAN EARLY. LOCK THE WINDOW.", 22, 500, (200, 192, 178), tracking=0.2)


def scene4(t, fi):
    p = ease_in_out(t / 3.7)
    img = C.view(C.plate("scene4-rack.jpg"), lerp(0.38, 0.62, p), lerp(0.50, 0.54, p),
                 lerp(1.05, 1.15, p))
    img = C.grade(img, exposure=0.99, contrast=1.06, saturation=0.74, cool=0.55)
    img = light_sweep(img, x0=lerp(1080, -220, p), width=260, angle=48,
                      strength=0.045, color=(0.86, 0.92, 1.0))
    img = scrim(img, top=0.42, bottom=0.22)
    img = img * (1 - 0.18 * smooth(t, 2.9, 3.65))

    a1 = ramp(t, 0.28, 0.68)
    if a1 > 0:
        put_at_baseline(img, T4_A, 96, 296, alpha=0.98 * a1,
                        mask_rows=wrap_text_mask(T4_A, ease_out(a1, 1.6)))
    a2 = ramp(t, 1.15, 1.56)
    if a2 > 0:
        put_at_baseline(img, T4_B, 96, 386, alpha=a2,
                        mask_rows=wrap_text_mask(T4_B, ease_out(a2, 1.6)))
    a3 = ramp(t, 1.3, 1.74)
    if a3 > 0:
        put_at_baseline(img, T4_C, 96, 476, alpha=a3,
                        mask_rows=wrap_text_mask(T4_C, ease_out(a3, 1.6)))
    d = ramp(t, 2.05, 2.5)
    if d > 0:
        hairline(img, 96, 512, 96 + 66 * ease_out((t - 2.05) / 0.4), 512,
                 color=(186, 62, 48), alpha=0.9 * d, width=1.5)
    put_at_baseline(img, T4_D, 96, 554, alpha=0.66 * d)
    return C.finish(img, t, fi, vig=0.52, bloom_amt=0.16, grain_amt=0.018, seed=4,
                    saturation=0.8)


# ------------------------------------------------------------------ scene 5
T5_W = [("TEXTURE.", text_layer("TEXTURE.", 66, 700, IVORY, tracking=0.03),
         "ZIGZAG JACQUARD"),
        ("COLOUR.", text_layer("COLOUR.", 66, 700, IVORY, tracking=0.03),
         "GEOMETRIC WEAVE"),
        ("CHOICE.", text_layer("CHOICE.", 66, 700, IVORY, tracking=0.03),
         "CORDED TWILL")]
T5_HEAD = text_layer("PLAN YOUR WINTER", 68, 800, CHAR, tracking=0.0, line_height=1.04)
T5_HEAD2 = text_layer("COLLECTION", 68, 800, CHAR, tracking=0.0, line_height=1.04)
T5_SUB = text_layer("TEXTURE · COLOUR · CHOICE", 21, 600, (146, 112, 50),
                    tracking=0.18)

# hand-placed 2.5D composition: a layered physical swatch display, back -> front
HERO = [
    ("B-dark",   250,  806, 420, 0.8, -7.0, 0.06),
    ("E-navy",   842,  854, 400, 0.9,  8.0, 0.12),
    ("C-ivory",  542,  956, 430, 1.2,  1.5, 0.02),
    ("A-olive",  352, 1210, 340, 1.6, -5.0, 0.20),
    ("B-beige",  716, 1232, 358, 1.7,  4.0, 0.27),
    ("E-beige",  954, 1146, 214, 2.0, -11.0, 0.34),
    ("F-crimson", 206, 1402, 250, 2.2, -9.0, 0.40),
    ("D-brown",  494, 1428, 300, 2.1,  2.0, 0.46),
    ("F-teal",   798, 1384, 240, 2.4,  7.0, 0.52),
]


def hero_panels(img, u, cam_x, cam_y, zoom, scale=1.0):
    for i, (name, px, py, pw, depth, rz, delay) in enumerate(HERO):
        p = clamp((u - delay) / 0.72)
        if p <= 0:
            continue
        e = ease_out(p, 3.0)
        alpha = ease_out(clamp(p * 1.35), 2.0) * (0.99 if depth < 1.6 else 0.94)
        cx = px + (1 - e) * (-46 - 22 * (i % 3)) + cam_x * depth * 17.0
        cy = py + (1 - e) * (70 + 20 * (i % 4)) + cam_y * depth * 14.0
        w = pw * zoom * scale * (1.0 + 0.022 * depth)
        h = pw * 0.78 * zoom * scale * (1.0 + 0.022 * depth)
        rx = (1 - e) * 0.08
        ry = (1 - e) * -0.12 + 0.015 * math.sin(u * 0.7 + i)
        quad = panel_quad(cx, cy, w, h, rx=rx, ry=ry, rz=rz + (1 - e) * 3.0)
        light = 0.94 + 0.08 * math.cos(i * 1.6 + u * 0.45)
        img = C.draw_panel(img, C.swatch(name), quad, alpha=alpha,
                           shadow=0.34 + 0.04 * depth,
                           shadow_off=(8 + 3 * depth, 18 + 6 * depth),
                           shadow_blur=18 + 4 * depth, light=light)
    return img


MACROS = [
    # (vmacro, cx0, cx1, cy0, cy1, zoom0, zoom1, sweep x0->x1, angle)
    ("jacquard", 0.44, 0.56, 0.50, 0.42, 1.12, 1.30, (-420, 700), 44),
    ("geo",      0.60, 0.42, 0.52, 0.46, 1.08, 1.26, (1300, -220), 126),
    ("cord",     0.50, 0.40, 0.46, 0.56, 1.10, 1.28, (200, 1120), 30),
]


def scene5(t, fi):
    # --- three macro texture beats
    if t < 2.55:
        beats = [(0.0, 0.95, 0), (0.95, 1.72, 1), (1.72, 2.55, 2)]
        for a, b, idx in beats:
            if a <= t < b:
                u = (t - a) / (b - a)
                name, cx0, cx1, cy0, cy1, z0, z1, sweep, ang = MACROS[idx]
                img = C.view(C.macro(name), lerp(cx0, cx1, u), lerp(cy0, cy1, u),
                             lerp(z0, z1, ease_in_out(u)))
                img = light_sweep(img, x0=lerp(sweep[0], sweep[1], u), width=230,
                                  angle=ang, strength=0.12, color=(1.0, 0.96, 0.88))
                label, lay, cap = T5_W[idx]
                wp = ramp(t, a + 0.16, a + 0.48)
                img = scrim(img, bottom=0.40, top=0.22)
                img = caption_plate(img)
                if wp > 0:
                    put_at_baseline(img, lay, 96, 1444, alpha=wp,
                                    mask_rows=wrap_text_mask(lay, ease_out(wp, 1.6)))
                    hairline(img, 96, 1478, 96 + 54 * ease_out((t - a - 0.2) / 0.35),
                             1478, color=GOLD, alpha=0.8 * wp, width=1.4)
                    micro_caption(img, cap, 96, 1496, 0.7 * ramp(t, a + 0.3, a + 0.6))
                return C.finish(img, t, fi, vig=0.40, bloom_amt=0.22,
                                grain_amt=0.016, seed=5, saturation=0.98)

    # --- the display: layered real swatches in a warm ivory studio
    u = t - 2.55
    cam_x = math.sin(u * 0.30) * 0.7 + (u / 4.0) * 0.4
    cam_y = -0.10 + u * 0.045
    zoom = 1.0 + 0.05 * ease_in_out(u / 4.2)
    base = C.view(C.plate("scene5-studio.jpg"), lerp(0.50, 0.485, u / 4.2),
                  lerp(0.52, 0.47, u / 4.2), zoom * 1.03)
    base = light_sweep(base, x0=lerp(-120, 1250, ease_in_out(u / 4.2)), width=400,
                       angle=62, strength=0.045, color=(1.0, 0.96, 0.88))
    img = hero_panels(base.copy(), u, cam_x, cam_y, zoom)
    img = light_sweep(img, x0=lerp(-420, 1450, u / 4.2), width=540, angle=68,
                      strength=0.03, color=(1.0, 0.97, 0.92))
    img = C.edge_soften(img, amount=0.42, inner=0.62, radius=7.0)
    wash = np.zeros((H, W), np.float32)
    wash[:560, :] = 1.0
    wash = blur_a(wash, 90) * 0.42
    img = img * (1 - wash[..., None]) + np.array([0.93, 0.91, 0.87], np.float32) * wash[..., None]
    # photographic falloff behind the swatch wall so the cards read with depth
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
    fall = np.exp(-(((xx - 0.5) / 0.62) ** 2 + ((yy - 0.52) / 0.55) ** 2))
    img = img * (1 - 0.20 * fall[..., None])

    hp = ramp(t, 3.0, 3.5)
    if hp > 0:
        dy = lerp(18, 0, ease_out((t - 3.0) / 0.5))
        put_at_baseline(img, T5_HEAD, 96, 268 + dy, alpha=hp * 0.95)
        put_at_baseline(img, T5_HEAD2, 96, 268 + dy + 78, alpha=hp * 0.95)
    sp = ramp(t, 3.32, 3.72)
    if sp > 0:
        hairline(img, 96, 388, 96 + 64 * ease_out((t - 3.32) / 0.4), 388,
                 color=(150, 116, 52), alpha=0.75 * sp, width=1.4)
    put_at_baseline(img, T5_SUB, 96, 422, alpha=0.85 * ramp(t, 3.45, 3.85))
    return C.finish(img, t, fi, vig=0.30, bloom_amt=0.15, grain_amt=0.014, seed=6,
                    saturation=1.0, contrast=1.03)


# ------------------------------------------------------------------ scene 6
T6_CITY = text_layer("DELHI", 26, 600, (214, 178, 104), tracking=0.5)
T6_SUB = text_layer("WINTER KA WINDOW CHHOTA HAI", 24, 500, (198, 188, 172), tracking=0.14)


def scene6(t, fi):
    z = lerp(1.03, 1.11, ease_in_out(t / 3.1))
    img = C.view(C.plate("scene6-brand.jpg"), 0.5, 0.5, z)
    img = C.dust(img, t, alpha=0.5, count=28, seed=8)

    for name, px, py, pw, rz, dl in (("B-dark", 92, 1600, 290, -12, 0.0),
                                     ("C-grey", 990, 300, 250, 14, 0.15),
                                     ("A-olive", 992, 1690, 290, 8, 0.28)):
        p = clamp((t - dl) / 1.0)
        if p <= 0:
            continue
        e = ease_out(p, 2.5)
        quad = panel_quad(px + (1 - e) * 80, py + (1 - e) * 55, pw, pw * 0.78,
                          rx=0.05, ry=0.1, rz=rz)
        img = C.draw_panel(img, C.swatch(name), quad, alpha=0.5 * e, shadow=0.5,
                           shadow_off=(10, 22), shadow_blur=26, light=0.38)

    lw = 520
    lp = ramp(t, 0.40, 1.0)
    if lp > 0:
        gw = int(lw * lerp(0.94, 1.0, ease_out(lp, 2.4)))
        arr = np.asarray(logo(gw), np.float32) / 255.0
        x0 = (W - gw) // 2
        gy = 556 - (arr.shape[0] - logo(lw).height) // 2
        halo = blur_a(arr[..., 3], 34)[..., None] * np.array([1.0, 0.84, 0.52], np.float32)
        img = add_at(img, halo, x0, gy, opacity=0.26 * lp)
        img = paste(img, arr[..., :3], arr[..., 3], x0, gy, opacity=lp)

        sw = ramp(t, 1.0, 1.9)
        if 0 < sw < 1:
            band = light_sweep(np.zeros_like(img), x0=lerp(x0 - 300, x0 + gw + 300, sw),
                               width=175, angle=20, strength=1.0, color=(1.0, 0.90, 0.66))
            m = np.zeros((H, W), np.float32)
            m[max(0, gy - 30):gy + arr.shape[0] + 30, max(0, x0 - 30):x0 + gw + 30] = 1.0
            m = blur_a(m, 26)
            img = blend_screen(img, band * m[..., None], opacity=0.48)

    cp = ramp(t, 1.45, 1.85)
    if cp > 0:
        cy = 556 + logo(lw).height + 78
        put_at_baseline(img, T6_CITY, W / 2, cy, alpha=cp, anchor_x="center")
        cw = T6_CITY.width
        hairline(img, W / 2 - cw / 2 - 110, cy - 9, W / 2 - cw / 2 - 28, cy - 9,
                 color=GOLD, alpha=0.7 * cp, width=1.2)
        hairline(img, W / 2 + cw / 2 + 28, cy - 9, W / 2 + cw / 2 + 110, cy - 9,
                 color=GOLD, alpha=0.7 * cp, width=1.2)
        put_at_baseline(img, T6_SUB, W / 2, cy + 74, alpha=0.78 * ramp(t, 1.72, 2.18),
                        anchor_x="center")

    imp = smooth(t, 0.55, 0.95) * (1 - smooth(t, 1.4, 2.4))
    if imp > 0.01:
        img = img + imp * 0.04 * np.array([1.0, 0.86, 0.6], np.float32)
    return C.finish(img, t, fi, vig=0.42, bloom_amt=0.24, grain_amt=0.014, seed=7,
                    saturation=1.0)


# ------------------------------------------------------------------ scene 7
T7_HEAD = text_layer("PLAN YOUR WINTER", 56, 800, CHAR, tracking=0.0, line_height=1.06)
T7_HEAD2 = text_layer("SOURCING NOW", 56, 800, CHAR, tracking=0.0, line_height=1.06)
T7_LBL = text_layer("CALL", 19, 600, (150, 116, 52), tracking=0.34)
T7_PH = text_layer("+91 87007 64311", 54, 600, (30, 31, 30), tracking=0.01)
T7_WEB = text_layer("www.bahubalifabrics.com", 30, 500, (54, 55, 52), tracking=0.02)


def scene7(t, fi):
    z = lerp(1.005, 1.045, ease_in_out(t / 4.85))
    img = C.view(C.plate("scene7-endcard.jpg"), 0.5, lerp(0.5, 0.494, t / 4.85), z)
    img = C.edge_soften(img, amount=0.55, inner=0.62, radius=9.0)
    img = light_sweep(img, x0=lerp(-240, 1250, ease_in_out(t / 4.85)), width=480,
                      angle=66, strength=0.03, color=(1.0, 0.97, 0.92))

    lw = 356
    lp = ramp(t, 0.25, 0.7)
    if lp > 0:
        gw = int(lw * lerp(0.97, 1.0, ease_out(lp, 2)))
        arr = np.asarray(logo(gw), np.float32) / 255.0
        img = paste(img, arr[..., :3], arr[..., 3], (W - gw) // 2, 366, opacity=lp)

    hp = ramp(t, 0.70, 1.2)
    if hp > 0:
        dy = lerp(20, 0, ease_out((t - 0.70) / 0.55))
        put_at_baseline(img, T7_HEAD, W / 2, 930 + dy, alpha=hp, anchor_x="center")
        put_at_baseline(img, T7_HEAD2, W / 2, 930 + dy + 66, alpha=hp, anchor_x="center")

    dp = ramp(t, 1.25, 1.58)
    if dp > 0:
        e = ease_out((t - 1.25) / 0.35)
        hairline(img, W / 2 - 150 * e, 1032, W / 2 + 150 * e, 1032, color=GOLD,
                 alpha=0.75 * dp, width=1.3)

    pp = ramp(t, 1.5, 1.86)
    if pp > 0:
        put_at_baseline(img, T7_LBL, W / 2, 1084, alpha=0.9 * pp, anchor_x="center")
        put_at_baseline(img, T7_PH, W / 2, 1140, alpha=pp, anchor_x="center")
    put_at_baseline(img, T7_WEB, W / 2, 1234, alpha=0.95 * ramp(t, 1.8, 2.15),
                    anchor_x="center")

    return C.finish(img, t, fi, vig=0.22, bloom_amt=0.05, grain_amt=0.011, seed=9,
                    saturation=0.97, contrast=1.01)
