# Bahubali Fabrics — “Winter Ka Window Chhota Hai”

A finished 31-second vertical commercial (9:16, 1080 × 1920, 25 fps, Hindi voiceover),
plus the engine that produced it, the production microsite that documents it, and every
asset it was cut from.

**Watch it:** open `site/index.html` (or run the preview server below) — the reel, the
storyboard, the fabric library and the QC sheet are all in one page.

**Deliverables**

| File | What it is |
| --- | --- |
| `deliverables/bahubali-winter-reel-1080x1920-feed.mp4` | **Feed-ready MP4** — 1080 × 1920, H.264 High@4.1, 8.4 Mbps, 25 fps, AAC 48 kHz (33 MB) |
| `deliverables/bahubali-winter-window-reel-1080x1920.mp4` | High-bitrate master of the same 31 s cut (50 MB) |
| `deliverables/poster.jpg` | Cover frame (02:90) |
| `site/media/reel-720.mp4` | Light 720 × 1280 copy for preview, WhatsApp and web |
| `site/index.html` | Production microsite: reel, storyboard, asset provenance, sound map, spec, QC |

```bash
# preview the site
cd site && python3 -m http.server 8080 --bind 0.0.0.0

# re-render the film (≈4 min on 2 cores)
.venv/bin/python src/assets.py     # rebuild swatch plates from the client photography
.venv/bin/python src/audio.py      # rebuild music, SFX and the mixed voiceover
.venv/bin/python src/render.py     # encode the master into out/
```

---

## 1. What was built, and the one rule behind it

The brief's central instruction was: **let AI build the room, keep the product real.**
That rule is enforced in code, not by convention.

* **Environment plates are AI.** Six generated stills (`assets/plates/`) supply the desk,
  the planning table, the retail rack, the studio wall, the brand background and the end
  card. They are only ever used as plate, never as product.
* **Fabric is the client's photography.** Every swatch in the film is cropped from
  `assets/fabric/`, masked along its true pinked edge (`src/assets.py`), given a cut-edge
  highlight and a contact shadow, then perspective-warped into the frame as a 3D panel
  (`src/core.py → draw_panel`). There is no generative step anywhere in that path.
* **The logo is the original file.** `assets/logo/bahubali-logo.png` is composited with
  its own alpha; the halo and the gold sweep live in the composite (`blend_screen`), so
  the emblem's pixels are never touched.
* **Type is shaped, not guessed.** Pillow here ships without Raqm, so `src/hbtext.py`
  shapes every string with HarfBuzz and rasterises with FreeType. Devanagari matras,
  conjuncts (`क्‍ष`, `र्म`), Latin kerning and numerals all come out correct — mixed
  Hindi + Latin lines are split into script runs so a `?` inside a Hindi sentence never
  renders as a tofu box.

## 2. Scene sheet

| # | Time | Scene | Frames |
| --- | --- | --- | --- |
| 1 | 00:00 – 04:15 | The winter countdown | dark sourcing desk, light drift, push-in |
| 2 | 04:15 – 09:03 | The hidden wait | macro slider on real fabric + `25–40 DAYS*` |
| 3 | 09:03 – 12:24 | The window gets smaller | overhead desk, timeline compresses |
| 4 | 12:24 – 16:15 | The cost of being late | late-season rack, grade goes cool |
| 5 | 16:15 – 23:02 | The fabric discovery | 3 macro beats → 11 real swatches in 2.5D |
| 6 | 23:02 – 26:10 | The brand reveal | original logo, gold sweep, shimmer |
| 7 | 26:10 – 31:00 | The CTA | ivory end card, number + site, long hold |

Cut points are locked to the recorded Hindi VO (`src/audio.py → VO_CUES`), so no two
voice lines overlap anywhere in the film.

## 3. Sound

`src/audio.py` synthesises the whole bed: a D-minor pedal with a sub pulse and a ticking
clock (0–13 s), a dip for the missed window, an arpeggio lift on the fabric reveal, and
an A-major resolve under the brand. SFX are generated too — paper flutter, digital draws,
marker ticks, whooshes, a gold shimmer and a chime. The voice is EQ'd (95 Hz high-pass,
2.6 kHz presence), compressed 3:1, de-essed, then the music is sidechain-ducked −62 %
under speech and the mix is driven into a look-ahead limiter. Target ≈ −14 LUFS / −1 dBTP.

Re-record the VO by replacing `assets/audio/vo-01…07.wav` (same file names) and running
`src/audio.py` again; the cue times are in `VO_CUES`.

## 4. Changing copy or timing

Everything that a client is likely to ask for is data, not baked pixels:

| Want to change | Where |
| --- | --- |
| Any on-screen line | the `T*_` text layers at the top of each scene in `src/scenes.py` |
| Colours | `INK / IVORY / GOLD / RED` in `src/core.py` |
| Scene lengths | `SCENES` in `src/scenes.py` (then `VO_CUES` in `src/audio.py`) |
| Swatch order in the display | `HERO` in `src/scenes.py` |
| Which crop of which photo | `CROPS` / `VERTICAL_MACROS` in `src/assets.py` |
| Safe margins, font sizes | the `put_at_baseline(...)` calls per scene |

## 5. Factual safeguard

The brief flagged the industry figures. The film therefore shows `25–40 DAYS*` with a
**permanent on-screen qualifier** — “Lead time varies by fabric, supplier and approvals”
— visible for the whole beat. The `8–12 launches/year` statistic was dropped and replaced
with the non-numeric `FASTER COLLECTION CYCLES`. Confirm your own lead times before
publishing the `25–40` range.

## 6. Repo map

```
assets/fabric/      client photography, untouched originals
assets/logo/        original logo, untouched
assets/plates/      generated environment stills (AI, background only)
assets/fonts/       Noto Sans instances (Latin + Devanagari), 300–800
assets/audio/       recorded Hindi voiceover, one file per scene
assets/generated/   derived swatch plates, vertical macros, mix.wav (rebuildable)
src/hbtext.py       HarfBuzz + FreeType text shaping and rasterising
src/assets.py       crop → pinked mask → cut edge → contact shadow
src/core.py         camera, 2.5D panel warp, scrims, grade, bloom, grain
src/scenes.py       the seven scenes
src/audio.py        music, SFX, voice processing, mix
src/render.py       parallel frame renderer + x264 encode + mux
site/               production microsite (static, no dependencies)
deliverables/       delivery master + poster
```

`assets/generated/`, `out/`, `ref/`, `node_modules/` and `.venv/` are rebuildable and
ignored by git.
