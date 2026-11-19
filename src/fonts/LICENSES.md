# Fonts: licences

## Archivo (variable): the only font family used on the site

| File | Axes kept | Size |
|---|---|---|
| `Archivo-Variable.woff2` | `wght` 400–900, `wdth` 62–125 (roman) | ~117 KB |
| `Archivo-Italic-Variable.woff2` | `wght` 400–600, `wdth` fixed at 100 (italic) | ~32 KB |

- **Designers:** Omnibus-Type (Héctor Gatti, with the Omnibus-Type team).
- **Licence:** SIL Open Font License 1.1. The full text is in [`OFL-Archivo.txt`](./OFL-Archivo.txt). The licence allows commercial use, self-hosting, web embedding, subsetting and modification. The copyright notice declares no Reserved Font Name, so a modified build can keep the name "Archivo". Keep `OFL-Archivo.txt` next to the files.
- **Official source:**
  - Google Fonts repository: https://github.com/google/fonts/tree/main/ofl/archivo, with the files `Archivo[wdth,wght].ttf` and `Archivo-Italic[wdth,wght].ttf`, version 2.001.
  - Upstream project: https://github.com/Omnibus-Type/Archivo
- **SHA-256 of the downloaded source TTF files:**
  - `Archivo[wdth,wght].ttf`: `0e094a7d3c7c4c25cf1310c4b30014f1dae9332220b1c2c88f4fa996f0b05053`
  - `Archivo-Italic[wdth,wght].ttf`: `305d13b4eb80e62f7d517f78d7c045250d977552a420f2dbed906f314e761305`
- **Conversion (19/11/2026):** done with fontTools 4.x and brotli.
  1. `fontTools.varLib.instancer` narrowed the axes: roman to `wght=400:900` and `wdth=62:125`; italic to `wght=400:600` and `wdth=100`.
  2. `fontTools.subset` converted to WOFF2 with all OpenType features kept (`tnum`, `frac`, `case`, `zero`, …). The Unicode subset is Latin and Latin-1, Latin Extended-A, general punctuation (U+2000–206F, which includes the narrow no-break space U+202F used in French typography), €, ×, −, ≤ and ≥, and arrows.

These files are a subsetted and instanced derivative of the original, distributed under the same OFL 1.1. The fonts must not be sold on their own.
