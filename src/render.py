"""Render the reel: frames are drawn in parallel, encoded with x264, audio muxed.

Usage
  python src/render.py                 # full 31 s master (1080x1920, 25 fps)
  python src/render.py --stills 5,20   # contact-sheet stills at given seconds
  python src/render.py --from 16 --to 23 --out cut.mp4   # partial render
"""
from __future__ import annotations

import argparse
import math
import multiprocessing as mp
import os
import subprocess
import sys
import time

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PIL import Image


def ffmpeg_bin():
    import shutil
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()

import core as C
import scenes

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "out")
os.makedirs(OUT_DIR, exist_ok=True)

FPS = 25
FN = {"s1": scenes.scene1, "s2": scenes.scene2, "s3": scenes.scene3,
      "s4": scenes.scene4, "s5": scenes.scene5, "s6": scenes.scene6,
      "s7": scenes.scene7}


def render_frame(i: int) -> bytes:
    t = i / FPS
    for name, a, b in scenes.SCENES:
        if a <= t < b or (name == scenes.SCENES[-1][0] and t >= a):
            img = FN[name](t - a, i)
            break
    else:
        img = np.zeros((C.H, C.W, 3), np.float32)
    return (np.clip(img, 0, 1) * 255.0 + 0.5).astype(np.uint8).tobytes()


def frame_iter(start_i, end_i, workers):
    n = end_i - start_i
    if workers <= 1:
        for i in range(start_i, end_i):
            yield i, render_frame(i)
        return
    ctx = mp.get_context("fork")
    with ctx.Pool(workers) as pool:
        for i, buf in zip(range(start_i, end_i),
                          pool.imap(render_frame, range(start_i, end_i), chunksize=1)):
            yield i, buf


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="t0", type=float, default=0.0)
    ap.add_argument("--to", dest="t1", type=float, default=scenes.TOTAL)
    ap.add_argument("--out", default="bahubali-winter-window-reel.mp4")
    ap.add_argument("--workers", type=int, default=max(1, min(2, os.cpu_count() or 1)))
    ap.add_argument("--crf", type=int, default=17)
    ap.add_argument("--stills", default=None)
    ap.add_argument("--audio", default=os.path.join(ROOT, "assets", "generated", "mix.wav"))
    args = ap.parse_args()

    if args.stills:
        times = [float(x) for x in args.stills.split(",")]
        for t in times:
            for name, a, b in scenes.SCENES:
                if a <= t < b:
                    img = FN[name](t - a, int(t * FPS))
                    break
            p = os.path.join(ROOT, "ref", f"still-{t:05.2f}.png")
            Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(p)
            print("wrote", p)
        return

    start_i = int(round(args.t0 * FPS))
    end_i = int(round(args.t1 * FPS))
    out_path = os.path.join(OUT_DIR, args.out)
    print(f"rendering {end_i - start_i} frames ({args.t0:.2f}-{args.t1:.2f}s) "
          f"with {args.workers} worker(s) -> {out_path}")

    cmd = [ffmpeg_bin(), "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{C.W}x{C.H}", "-r", str(FPS), "-i", "-",
           "-ss", f"{args.t0:.3f}", "-t", f"{args.t1 - args.t0:.3f}", "-i", args.audio,
           "-map", "0:v:0", "-map", "1:a:0",
           "-c:v", "libx264", "-preset", "medium", "-crf", str(args.crf),
           "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.2",
           "-x264-params", "keyint=50:min-keyint=25:ref=3",
           "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
           "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
           "-movflags", "+faststart", "-shortest", out_path]

    t_start = time.time()
    enc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL,
                           stderr=subprocess.PIPE)
    last = time.time()
    for k, (i, buf) in enumerate(frame_iter(start_i, end_i, args.workers)):
        enc.stdin.write(buf)
        if k % 25 == 0:
            now = time.time()
            fps = 25.0 / max(1e-6, now - last) if k else 0
            last = now
            done = k + 1
            eta = (end_i - start_i - done) / max(1e-6, fps) if fps else 0
            print(f"  frame {done}/{end_i - start_i}  {fps:5.1f} fps  eta {eta:5.0f}s",
                  flush=True)
    enc.stdin.close()
    err = enc.stderr.read().decode(errors="ignore")
    rc = enc.wait()
    if rc != 0:
        print(err[-3000:])
        raise SystemExit(f"ffmpeg failed ({rc})")
    print(f"done in {time.time() - t_start:.0f}s -> {out_path} "
          f"({os.path.getsize(out_path) / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
