# QC report — master check

| Check | Result |
| --- | --- |
| Runtime | 31.00 s, 775 frames @ 25 fps |
| Resolution / aspect | 1080 × 1920, 9:16 (even dimensions for yuv420p) |
| Video codec | H.264 High@4.1, CRF 21 / 8.4 Mbps, yuv420p, BT.709 tags, `+faststart` |
| Container check | `moov` before `mdat`; 16 timeline frames re-extracted from the encode and inspected |
| Audio | AAC 192 kbps, 48 kHz stereo, −1 dBTP ceiling |
| Integrated loudness | ≈ −15 LUFS (measured RMS −15.2 dBFS); confirm on delivery platform |
| Logo integrity | original PNG alpha composited; red/gold untouched |
| Fabric integrity | crops only; pinked masks follow the real edge; no recolour |
| Devanagari | shaped via HarfBuzz; matras/conjuncts verified in the type specimen |
| Voice / music | VO centred, music ducked −62 % under speech |
| Voice timing | seven lines, zero overlap (checked at build time; 0.12 s minimum gap) |
| Decoded levels | peak 0.976 · RMS −15.3 dBFS over 31 s |
| CTA hold | number + site stable 28.0 → 31.0 s |
| Claim qualifier | “Lead time varies by fabric, supplier and approvals” on screen for the whole `25–40` beat |
| First frame | starts on picture, no black or fade-in |
| Last frame | holds on the end card, no fade to black |

## Known, deliberate choices

* The end card is a static-ish hold on purpose: 3 s of stability beats a decorative zoom.
* The `8–12 launches/year` statistic from the draft was **not** used; the film says
  “FASTER COLLECTION CYCLES” instead, because the figure was not sourced.
* Scene 4 is the only cool-graded beat; it returns to warm on the product turn.
