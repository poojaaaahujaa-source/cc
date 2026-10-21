"""Sound design + mix: music bed, design SFX and the Hindi voiceover.

Everything is synthesised here (no stock libraries): a restrained cinematic
bed that starts tense and resolves warm at the brand reveal, plus tactile
paper, ticking, marker-draw, whoosh and chime accents.  The voice is the
recorded Hindi VO, ducked under, EQ'd, compressed and de-essed.
"""
from __future__ import annotations

import os

import numpy as np
import av

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VO_DIR = os.path.join(ROOT, "assets", "audio")
OUT_DIR = os.path.join(ROOT, "assets", "generated")
os.makedirs(OUT_DIR, exist_ok=True)
TOTAL = 31.0
N = int(SR * TOTAL)


def env(n, attack, decay, sr=SR):
    t = np.arange(n) / sr
    a = np.clip(t / max(1e-4, attack), 0, 1)
    d = np.exp(-np.maximum(0, t - attack) / max(1e-4, decay))
    return a * d


def onepole_lp(x, cutoff, sr=SR):
    a = np.exp(-2 * np.pi * cutoff / sr)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def lp_fast(x, cutoff, sr=SR):
    """FFT low-pass with a smooth rolloff (cheap and clean for beds)."""
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / sr)
    Hh = 1 / (1 + (f / max(1e-3, cutoff)) ** 4)
    return np.fft.irfft(X * Hh, n)


def hp_fast(x, cutoff, sr=SR):
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / sr)
    Hh = 1 - 1 / (1 + (f / max(1e-3, cutoff)) ** 4)
    return np.fft.irfft(X * Hh, n)


def noise(n, seed, kind="white"):
    rng = np.random.default_rng(seed)
    x = rng.standard_normal(n)
    if kind == "pink":
        X = np.fft.rfft(x)
        f = np.fft.rfftfreq(n, 1 / SR)
        X /= np.sqrt(np.maximum(f, 1.0))
        x = np.fft.irfft(X, n)
    return x / (np.abs(x).max() + 1e-9)


def place(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf) or len(sig) == 0:
        return
    j = min(len(buf), i + len(sig))
    seg = sig[: j - i] * gain
    l = np.sqrt((1 - pan) / 2) if pan else 0.7071
    r = np.sqrt((1 + pan) / 2) if pan else 0.7071
    buf[i:j, 0] += seg * (l * 1.414)
    buf[i:j, 1] += seg * (r * 1.414)


# ---------------------------------------------------------------- elements
def boom(dur=1.2, f0=58, f1=38, seed=1):
    n = int(SR * dur)
    t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.42)
    click = noise(n, seed) * np.exp(-t / 0.012) * 0.35
    return hp_fast(body + click, 24)


def tick(seed=2, dur=0.05, f=2400):
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = noise(n, seed) * np.exp(-t / 0.004) * 0.6
    x += np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) * 0.3
    return hp_fast(x, 1200)


def paper(dur=0.42, seed=3, bright=2400, gain=1.0):
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = noise(n, seed, "pink")
    flutter = (0.55 + 0.45 * np.sin(2 * np.pi * 17 * t + seed))
    x = x * flutter * env(n, 0.02, 0.16)
    return hp_fast(x, 700) * gain


def whoosh(dur=0.9, seed=4, f_up=True):
    """Air move: three overlapping bands whose cutoffs sweep with the motion."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    p = t / dur
    q = p if f_up else 1 - p
    x = noise(n, seed, "pink")
    out = np.zeros(n)
    for c, w in ((700.0, 0.5), (2400.0, 0.35), (5200.0, 0.2)):
        centre = c * (0.35 + 1.6 * q)
        seg = lp_fast(x, float(np.mean(centre)))
        out += seg * w * (0.4 + 0.6 * q)
    out = hp_fast(out, 180)
    return out * np.sin(np.pi * p) ** 1.4


def riser(dur=1.6, f0=110, f1=520, seed=5):
    n = int(SR * dur)
    t = np.arange(n) / SR
    p = (t / dur) ** 1.6
    f = f0 + (f1 - f0) * p
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * 0.5 + np.sin(2 * ph) * 0.2 + np.sin(3 * ph) * 0.08
    air = hp_fast(noise(n, seed, "pink"), 2000) * 0.35
    e = (t / dur) ** 2.2
    return (x + air) * e


def draw_sweep(dur=0.5, seed=6):
    """Crisp digital line-draw: filtered noise with a rising pitch tick."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = noise(n, seed) * 0.5 + np.sin(2 * np.pi * (900 + 1400 * t / dur) * t) * 0.35
    return hp_fast(x, 1800) * env(n, 0.01, 0.12)


def shimmer(dur=1.8, seed=7):
    n = int(SR * dur)
    t = np.arange(n) / SR
    base = np.sin(2 * np.pi * 2637 * t) * 0.25 + np.sin(2 * np.pi * 3951 * t) * 0.16
    base += np.sin(2 * np.pi * 5274 * t) * 0.08
    bell = np.exp(-t / 0.55) * (1 - np.exp(-t / 0.004))
    return base * bell


def chime(dur=2.2, seed=8):
    n = int(SR * dur)
    t = np.arange(n) / SR
    parts = [(1046.5, 0.30, 0.9), (1568.0, 0.20, 0.7), (2093.0, 0.12, 0.5), (3136.0, 0.06, 0.3)]
    x = np.zeros(n)
    for f, a, d in parts:
        x += np.sin(2 * np.pi * f * t) * a * np.exp(-t / d)
    return x * (1 - np.exp(-t / 0.003))


# ---------------------------------------------------------------- music bed
def chord(freqs, n, detune=0.004, seed=0):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k, f in enumerate(freqs):
        for d in (-detune, 0.0, detune):
            out += np.sin(2 * np.pi * f * (1 + d) * t + k * 1.7) * 0.33 / (1 + 0.25 * k)
    return out / max(1e-6, np.abs(out).max())


def music():
    """Tense bed (0-13 s) -> dark dip (13-16) -> lift (16-27) -> resolve (27-31)."""
    t = np.arange(N) / SR
    bed = np.zeros(N)

    # --- tension: low pedal + pulse
    d_minor = [73.42, 110.0, 146.83, 174.61]      # D2 A2 D3 F3
    a_minor = [55.0, 110.0, 164.81, 220.0]
    pads = np.zeros(N)
    seg1 = (t >= 0) & (t < 13.0)
    c1 = chord(d_minor, N)
    pads += c1 * (0.9 * (t < 8.6) + 0.7 * ((t >= 8.6) & (t < 13.0)))
    seg2 = (t >= 13.0) & (t < 16.2)
    c2 = chord(a_minor, N)
    pads = np.where(seg2, c2 * 0.62, pads)
    seg3 = (t >= 16.2) & (t < 22.7)
    c3 = chord([92.5, 138.59, 185.0, 277.18], N)   # F#m-ish colour, brighter
    pads = np.where(seg3, c3 * 0.55, pads)
    seg4 = (t >= 22.7) & (t < 31.0)
    c4 = chord([110.0, 164.81, 220.0, 329.63], N)  # A major resolve
    pads = np.where(seg4, c4 * 0.6, pads)

    # slow amplitude breathing
    pads *= 0.82 + 0.18 * np.sin(2 * np.pi * 0.09 * t)
    pads = lp_fast(pads, 1500)
    bed += pads * 0.30

    # --- sub pulse (8th notes) in the tension and lift sections
    pulse = np.zeros(N)
    for i in range(int(13.2 / 0.5)):
        at = 0.5 * i
        n = int(SR * 0.34)
        tt = np.arange(n) / SR
        s = np.sin(2 * np.pi * (55 if at < 13 else 82.4) * tt) * np.exp(-tt / 0.11)
        place(pulse[:, None] if pulse.ndim > 1 else pulse, s, at, 0.5) if False else None
        i0 = int(at * SR)
        j0 = min(N, i0 + n)
        pulse[i0:j0] += s[: j0 - i0] * 0.5
    pulse = lp_fast(pulse, 180)
    gate = np.where((t < 13.0), 1.0, 0.0) * 0.5 + np.where((t >= 16.2) & (t < 27.0), 1.0, 0.0) * 0.7
    bed += pulse * gate * 0.55

    # --- ticking clock motif (very subtle), 1-13 s
    ticks = np.zeros(N)
    for i in range(int(12 * 4)):
        at = 0.6 + i * 0.25
        if at > 12.6:
            break
        acc = 1.0 if i % 4 == 0 else 0.55
        i0 = int(at * SR)
        s = tick(seed=20 + i, dur=0.03, f=1800 if i % 4 else 2600) * acc * 0.30
        j0 = min(N, i0 + len(s))
        ticks[i0:j0] += s[: j0 - i0]
    bed += ticks * 0.55

    # --- lift layer: arpeggio from 16.2 s
    arp = np.zeros(N)
    notes = [220.0, 277.18, 329.63, 440.0, 554.37]
    for i in range(int((27.0 - 16.2) / 0.25)):
        at = 16.2 + i * 0.25
        f = notes[i % len(notes)] * (2 if (i // 5) % 2 else 1)
        n = int(SR * 0.34)
        tt = np.arange(n) / SR
        s = np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.13) * 0.16
        i0 = int(at * SR)
        j0 = min(N, i0 + n)
        arp[i0:j0] += s[: j0 - i0] * (0.55 if at < 22.7 else 0.4)
    arp = lp_fast(arp, 5200)
    bed += arp * 0.5

    # --- air: filtered noise swell, very low
    air = noise(N, 31, "pink")
    air = hp_fast(lp_fast(air, 2600), 500) * 0.02
    air *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.05 * t)
    bed += air

    # fade in / final resolve
    fade = np.clip(t / 0.6, 0, 1) * np.clip((TOTAL - t) / 1.4, 0, 1)
    bed *= fade
    return bed


# ---------------------------------------------------------------- voice
def load_vo(name):
    c = av.open(os.path.join(VO_DIR, name))
    s = c.streams.audio[0]
    chunks = []
    for f in c.decode(s):
        a = f.to_ndarray()
        chunks.append(a.reshape(-1))
    x = np.concatenate(chunks).astype(np.float64)
    sr = s.rate
    if sr != SR:
        n = int(len(x) * SR / sr)
        x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)
    return x


def trim_vo(x, thr=0.02):
    envl = np.convolve(np.abs(x), np.ones(400) / 400, mode="same")
    idx = np.where(envl > envl.max() * thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(0.03 * SR))
    b = min(len(x), idx[-1] + int(0.10 * SR))
    return x[a:b]


def deess(x):
    hi = hp_fast(x, 6500)
    envl = np.convolve(np.abs(hi), np.ones(240) / 240, mode="same")
    g = 1.0 / (1.0 + 2.4 * np.clip(envl / (envl.max() + 1e-9) - 0.25, 0, 1))
    return x - hi * (1 - g)


def compress(x, thr=0.18, ratio=3.2, atk=0.004, rel=0.12):
    envl = np.abs(x)
    # smooth envelope
    a_att = np.exp(-1 / (atk * SR))
    a_rel = np.exp(-1 / (rel * SR))
    e = np.empty_like(envl)
    acc = 0.0
    for i in range(len(envl)):
        c = a_att if envl[i] > acc else a_rel
        acc = c * acc + (1 - c) * envl[i]
        e[i] = acc
    g = np.where(e > thr, (thr / np.maximum(e, 1e-9)) ** (1 - 1 / ratio), 1.0)
    return x * g


def eq_voice(x):
    # gentle low cut + presence lift, then de-ess
    x = hp_fast(x, 95)
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    shape = np.ones_like(f)
    shape += 0.22 * np.exp(-((f - 2600) ** 2) / (2 * 1200 ** 2))
    shape += 0.10 * np.exp(-((f - 5200) ** 2) / (2 * 900 ** 2))
    shape -= 0.25 * np.exp(-((f - 320) ** 2) / (2 * 140 ** 2))
    x = np.fft.irfft(X * np.clip(shape, 0.2, 3), n)
    return deess(x)


VO_CUES = [  # (file, start time) — timed to the cut, one line per scene
    ("vo-01.wav", 0.12),
    ("vo-02.wav", 4.72),
    ("vo-03.wav", 9.20),
    ("vo-04.wav", 13.00),
    ("vo-05.wav", 16.64),
    ("vo-06.wav", 23.20),
    ("vo-07.wav", 26.42),
]


def build(verbose=True):
    music_st = music()
    sfx = np.zeros((N, 2), np.float64)
    vo = np.zeros((N, 2), np.float64)

    # ---- scene 1
    place(sfx, boom(1.4, 56, 36, 1), 0.0, 0.55)
    place(sfx, paper(0.5, 11), 0.16, 0.30, -0.15)
    place(sfx, paper(0.4, 12), 0.40, 0.20, 0.15)
    place(sfx, paper(0.34, 13), 0.66, 0.14, -0.1)
    place(sfx, riser(1.6, 90, 420, 5), 2.90, 0.11)
    place(sfx, whoosh(0.85, 14), 3.72, 0.17, 0.1)
    # ---- scene 2
    place(sfx, whoosh(0.7, 15), 4.66, 0.10, -0.15)
    place(sfx, draw_sweep(0.6, 16), 5.15, 0.17, -0.1)
    place(sfx, boom(0.9, 70, 44, 18), 6.02, 0.16)
    place(sfx, tick(17, 0.06, 1200), 6.05, 0.20)
    place(sfx, tick(19, 0.05, 1500), 6.58, 0.13)
    # ---- scene 3
    place(sfx, paper(0.35, 20), 9.16, 0.14, 0.12)
    for i in range(6):
        place(sfx, tick(30 + i, 0.04, 2600 - i * 180), 9.42 + 0.30 * i, 0.09, 0.1 - 0.04 * i)
    place(sfx, draw_sweep(0.5, 21), 10.52, 0.13, 0.05)
    place(sfx, whoosh(0.8, 22, f_up=False), 12.22, 0.12, -0.1)
    # ---- scene 4
    place(sfx, boom(1.0, 52, 34, 23), 12.96, 0.34)
    place(sfx, boom(0.8, 62, 40, 24), 14.16, 0.22)
    place(sfx, whoosh(1.0, 25, f_up=False), 15.70, 0.12, 0.0)
    # ---- scene 5 texture beats
    for i, at in enumerate((16.64, 17.57, 18.37)):
        place(sfx, whoosh(0.55, 40 + i), at, 0.14, (-0.2, 0.2, 0.0)[i])
        place(sfx, tick(50 + i, 0.05, 1400), at + 0.12, 0.10)
    place(sfx, shimmer(2.1, 60), 19.24, 0.10, 0.0)
    for i in range(8):
        place(sfx, paper(0.3, 70 + i), 19.45 + 0.19 * i, 0.07, (-1) ** i * 0.18)
    place(sfx, riser(1.5, 130, 480, 61), 21.50, 0.13)
    # ---- scene 6 brand reveal
    place(sfx, riser(0.85, 200, 620, 63), 22.96, 0.10)
    place(sfx, boom(1.9, 60, 32, 62), 23.06, 0.52)
    place(sfx, shimmer(2.4, 64), 23.30, 0.16)
    place(sfx, whoosh(1.1, 65), 23.78, 0.08, 0.15)
    # ---- scene 7 CTA
    place(sfx, whoosh(0.9, 66, f_up=False), 26.02, 0.10)
    place(sfx, tick(67, 0.06, 1100), 27.72, 0.14)
    place(sfx, tick(68, 0.05, 1500), 27.98, 0.10)
    place(sfx, chime(2.6, 69), 29.00, 0.22)
    place(sfx, boom(1.4, 54, 34, 70), 30.20, 0.10)

    # ---- voice
    for i, (f, at) in enumerate(VO_CUES):
        x = trim_vo(load_vo(f))
        x = eq_voice(x)
        x = compress(x, 0.22, 3.0)
        x = x / (np.abs(x).max() + 1e-9) * 0.9
        i0 = int(at * SR)
        n = len(x)
        j0 = min(N, i0 + n)
        if verbose:
            print(f"  VO {f} at {at:5.2f}s  dur {n/SR:4.2f}s  ends {(at+n/SR):5.2f}s")
        vo[i0:j0, 0] += x[: j0 - i0]
        vo[i0:j0, 1] += x[: j0 - i0]

    vo_mono = vo[:, 0]
    # ducking sidechain from the voice
    envl = np.abs(vo_mono)
    envl = np.convolve(envl, np.ones(2400) / 2400, mode="same")
    duck = 1.0 - 0.62 * np.clip(envl / 0.06, 0, 1)
    duck = np.convolve(duck, np.ones(4800) / 4800, mode="same")

    mix = np.zeros((N, 2), np.float64)
    mix[:, 0] += music_st * 0.34 * duck
    mix[:, 1] += music_st * 0.34 * duck
    mix += sfx * 0.85 * (0.55 + 0.45 * duck[:, None])
    mix += vo * 0.95

    # master: gentle glue compression + soft clip + loudness
    mix = np.stack([compress(mix[:, 0], 0.30, 2.0), compress(mix[:, 1], 0.30, 2.0)], axis=1)
    # loudness stage: drive into a look-ahead limiter for ~-14 LUFS integrated
    def limit(ch, ceiling=0.885):
        envl = np.abs(ch)
        a = np.exp(-1 / (0.004 * SR))
        r = np.exp(-1 / (0.060 * SR))
        e = np.empty_like(envl)
        acc = 0.0
        for i in range(len(envl)):
            c = a if envl[i] > acc else r
            acc = c * acc + (1 - c) * envl[i]
            e[i] = acc
        g = np.minimum(1.0, ceiling / np.maximum(e, 1e-9))
        # smooth the gain curve so limiting stays transparent
        g = np.convolve(g, np.ones(240) / 240, mode="same")
        return ch * g

    mix = np.stack([limit(mix[:, 0] * 2.1), limit(mix[:, 1] * 2.1)], axis=1)
    mix = np.tanh(mix) * 0.995
    mix *= 10 ** (-1.0 / 20) / (np.abs(mix).max() + 1e-9)

    wav = os.path.join(OUT_DIR, "mix.wav")
    import wave
    with wave.open(wav, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
    if verbose:
        rms = np.sqrt((mix ** 2).mean())
        print(f"  mix -> {wav}  ({os.path.getsize(wav)/1e6:.1f} MB, rms {20*np.log10(rms):.1f} dBFS)")
    return wav


if __name__ == "__main__":
    build()
