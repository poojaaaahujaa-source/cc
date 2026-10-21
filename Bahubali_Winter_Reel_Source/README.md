# Bahubali Fabrics — Winter Collection Sourcing Reel (Source)

Finished film: `../Bahubali_Winter_Reel_Final.mp4`
(1080×1920, 9:16, 28 s, 30 fps, H.264 + AAC 48 kHz — Instagram Reel ready)

## Reproduce the render

```bash
pip install pillow numpy imageio imageio-ffmpeg
python3 Bahubali_Winter_Reel_Source/render_reel.py
```

`render_reel.py` does everything: PIL motion-graphics (macro push-ins,
kinetic type, animated sourcing timeline, compressing launch-window,
fabric showcase with texture-match dissolves, logo reveal with a masked
gold sweep, ivory end card) → raw frames piped to FFmpeg (libx264) →
synthesised royalty-free music/SFX mixed & ducked under the Hindi
voiceover in `audio/vo1–vo6.mp3` → final mux + preview contact sheet.

## Assets (all original uploads, unretouched)

| File | Original upload |
|---|---|
| `assets/fabric_houndstooth.png` | Bahubali Fabrics Post-1.png |
| `assets/fabric_herringbone.png` | Gemini_Generated_Image_haxb5chaxb5chaxb.png |
| `assets/fabric_geometric.png` | Gemini_Generated_Image_stkf2hstkf2hstkf.png |
| `assets/whatsapp_0929.jpg` | WhatsApp Image 2026-09-29 (ribbed swatches) |
| `assets/whatsapp_1001.jpg` | WhatsApp Image 2026-10-01 (chevron swatches) |
| `assets/whatsapp_1008.jpg` | WhatsApp Image 2026-10-08 (velvet colour range) |
| `assets/logo_original.png` | Bahubali Logo.png (used untouched) |

Fabric colours/patterns are never altered — every product shot is a
straight crop of an uploaded photograph. The logo PNG has a transparent
background and is composited as-is (opacity + gold sweep only).

## Scene map

1. 00:00–00:04 Fabric First — green houndstooth macro push-in
2. 00:04–00:08 Sourcing Timeline — SOURCING / LAB-DIPS / APPROVALS
3. 00:08–00:12 Shorter Window — swatch panels + compressing timeline
4. 00:12–00:18 Showcase — TEXTURE. COLOUR. CHOICE. / PLAN YOUR WINTER COLLECTION
5. 00:18–00:23 Brand Reveal — original logo, gold sweep, DELHI
6. 00:23–00:28 End Card — +91-8700764311 · www.bahubalifabrics.com

Intermediates (`frames/silent.mp4`, `audio/final_mix.wav`, `*_48k.wav`)
are regenerated on each run and git-ignored.
