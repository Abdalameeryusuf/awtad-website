# أوتاد — Design Tokens (DESIGN.md)

Brand for the theatrical performance **"أوتاد"**. Hand this to Claude Code alongside the build spec. The whole UI is **dark and cinematic** (Ashura / Karbala mood): a dark-green gradient base, deep-red accents, white text. This **replaces** the earlier "light Google Forms" look — keep Google-Forms *structure*, but dark themed.

## Mood
Atmospheric, reverent, cinematic. Reference: moonlit teal night, deep-red banners, white calligraphy, a silhouetted figure. Quiet and serious, not playful.

## Core palette (from the brand guideline)
| Token | Hex | Use |
|---|---|---|
| `--bg-green` | `#0F2524` | primary dark-green surface / gradient start |
| `--bg-deep`  | `#071112` | deepest near-black green / gradient end / page base |
| `--accent-rust`   | `#501D11` | red accent (buttons, highlights, fabric tones) |
| `--accent-maroon` | `#30110D` | darker red accent |
| `--text` | `#FFFFFF` | primary text & key information |

Composition ratio (from the guideline): **~50% dark green, ~30% red accent, ~20% white**. Green dominates surfaces; red is used sparingly for accents/emphasis; white for text and key info.

Primary background gradient:
```css
background: linear-gradient(135deg, #0F2524 0%, #071112 100%);
```

## Derived UI tokens (needed for a usable dark UI)
| Token | Value | Use |
|---|---|---|
| `--text-muted` | `rgba(255,255,255,0.72)` | secondary text, field labels |
| `--border`     | `rgba(255,255,255,0.12)` | input borders, dividers |
| `--surface`    | `rgba(255,255,255,0.06)` | card / input fill over the gradient |
| `--focus`      | `#7A2A18` | input focus ring (lightened rust) |

## Functional / status colors (seat board) — derived, brightened for legibility
The raw brand reds are very dark — perfect as fabric/accent, but too dark to signal status. Use these clearer variants on the seat board (adjust to taste). Always pair color with a text label, never color alone.
| State | Token | Hex |
|---|---|---|
| متوفر (plenty) | `--status-ok`   | `#38B48B` |
| يقترب الامتلاء (filling) | `--status-warn` | `#D9A441` (candle-gold, fits the theme) |
| مكتمل (full)   | `--status-full` | `#B0432A` (brightened rust = clear "stop") |

## Typography
- **Primary font: Thmanyah Sans** — the brand font (used in the logo). Self-host the Thmanyah Sans `.woff2` files (in the brand kit) via `@font-face`. Logo/headings use **Bold**.
- **Fallback: IBM Plex Sans Arabic** (Google Fonts) so the site still renders correctly if the Thmanyah file is missing.
- Font stack: `"Thmanyah Sans", "IBM Plex Sans Arabic", "Segoe UI", Tahoma, sans-serif`.
- **Numerals:** use **Eastern Arabic numerals (٠١٢…)** for displayed dates, times, and seat counts to match the Arabic context (e.g. `٨:٣٠`, `١٦٥`). Input fields can still accept normal digits.

## Logo
- The **أوتاد** wordmark (white calligraphy) is the visual title — place it at the top of both the form and the seat board.
- A ready transparent white PNG is provided: **`awtad-logo.png`** (988×610, alpha). Put it at `public/awtad-logo.png` and set `config.logoUrl = "/awtad-logo.png"`. It sits directly on the gradient (no black box). An SVG version would be even sharper if you have one.

## Imagery (optional — v1 can skip)
- The brand poster art is cinematic (moonlit teal + red banners). If used as a hero/background, lay a dark gradient overlay on top so text stays readable. Keep the form itself clean and uncluttered.

## Applying to each screen
- **Registration form:** Google-Forms *structure* (single column, card, clear labels) but dark — gradient page, semi-transparent dark card (`--surface`), white labels, inputs with `--surface` fill + `--border`, rust focus ring, **submit button in rust/maroon with white text**. Logo on top; render the **"الحضور للرجال فقط"** line bold or in a rust accent so it stands out.
- **Seat board:** dark gradient, white show names, **large seat numbers**, status colors above, current show marked with a rust accent badge "العرض الحالي".
- **Door control:** dark theme, oversized **−1** button in rust; the live count is the centerpiece in large white numerals; small white/muted "آخر تحديث" + connection dot.

## Accessibility
White on `#0F2524` ≈ 15:1 contrast (excellent). Keep secondary text ≥ `rgba(255,255,255,0.6)`. Status chips must include a text label, not rely on color alone.
