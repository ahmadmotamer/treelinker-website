# WhatsApp.com — Style Reference
> sunlit coffee shop conversation

**Theme:** light

WhatsApp's site reads like a warm, human messaging app brought to a marketing canvas: a soft cream backdrop (#fcf5eb) carries the entire page, letting large full-bleed photography and oversized typography do the talking while a single vivid green (#25d366) punctuates every action. The type system is deliberately dramatic — a custom display face scales to 80px hero headlines — balanced by a quiet 16px body. Components are generous and soft: pill-shaped buttons at 50px radius, image cards at 25px, minimal borders or shadows. The palette is ruthlessly restrained — one chromatic brand color, one link blue, one near-black over cream. Less 'SaaS product page', more 'sunlit conversation'.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| WhatsApp Green | `#25d366` | `--color-whatsapp-green` | Primary CTA buttons, active state highlights, the singular chromatic accent — used sparingly |
| Link Blue | `#0373e9` | `--color-link-blue` | Outlined action borders, linked labels, lightweight interactive emphasis |
| Charcoal | `#1c1e21` | `--color-charcoal` | High-contrast neutral action fill for primary buttons on light surfaces |
| Ink Black | `#111b21` | `--color-ink-black` | Deepest text and icon color, input borders, icon strokes |
| Cream Canvas | `#fcf5eb` | `--color-cream-canvas` | Page background across all sections — warm off-white, the sunlit atmosphere |
| Pure White | `#ffffff` | `--color-pure-white` | Card surfaces, outlined button fills, nav background, chat-bubble fills |
| Warm Gray | `#5e5e5e` | `--color-warm-gray` | Secondary/muted body text, helper text, disclaimers, subtle borders |
| Pale Blue Wash | `#f0f4f9` | `--color-pale-blue-wash` | Hairline borders, dividers, input outlines, card edges. Never a CTA color |

## Tokens — Typography

**WhatsApp Sans Var** (substitute: Inter) — sole typeface. 400 for body/UI, 700 for headlines/display.
Sizes: 12, 16, 18, 48, 60, 80px. Line height 1.10–1.39. Letter spacing normal.
Display at 80px is uncommonly large for a product marketing site — magazine-like confidence.

| Role | Size | Line Height | Token |
|------|------|-------------|-------|
| caption | 12px | 1.38 | `--text-caption` |
| body | 16px | 1.34 | `--text-body` |
| body-lg | 18px | 1.39 | `--text-body-lg` |
| heading-sm | 48px | 1.2 | `--text-heading-sm` |
| heading | 60px | 1.1 | `--text-heading` |
| display | 80px | 1.0 | `--text-display` |

## Tokens — Spacing & Shapes

Base unit 4px. Density: comfortable.
Scale: 4, 8, 12, 16, 20, 24, 28, 32, 40, 56, 88px.

Radius: cards 16px · small 8px · images 25px · inputs 50px · buttons 50px.

Layout: page max-width 1200px · section gap 120–160px · card padding 32px · element gap 16–24px.

## Components

### Primary CTA Button (Pill)
Main download/action button — the sole filled button in the system. 50px radius (full pill),
~10–12px vertical / 28px horizontal padding, #25d366 fill, white text 16px/700. Small download
arrow adjacent to the label. Friendly capsule, not a corporate rectangle.

### Ghost Nav Button (Log In)
50px radius, 14–16px vertical / 24–28px horizontal padding, transparent fill, 1px #1c1e21 border,
dark text 16px/400, right-chevron icon. Understated against the green primary.

### Inline Link with Arrow
No button chrome. 16–18px text in #0373e9 weight 400, underlined (text portion only), followed by
a right-arrow (›) in the same blue. Sits inline within body copy.

### Chat Bubble (Incoming)
White #ffffff fill, 8px radius with 2px on the tail corner, #1c1e21 text at 12–14px, timestamp
11px in #5e5e5e right-aligned. Tail points left. Floats freely on the cream canvas.

### Chat Bubble (Outgoing)
Light green #d9fdd3 fill (matching the app), 8px radius, dark text, tail on the right.

### Feature Image Card (Rounded)
25px radius on photographic content, no border, no shadow, no internal padding — the photo fills
the shape edge-to-edge. The rounded shape alone separates it from the cream canvas.

### Phone Mockup Container
Tall portrait container, 25px radius, full-bleed app screenshot, subtle location-pin badge pill at
the bottom. No shadow — the warm cream background makes the shape float.

### Group Avatar Stack
Three to four overlapping circular avatars, 32–40px each, 2px white border for separation,
accompanied by '& 4 others' in small Charcoal type.

### Group Join Badge
50px radius, #25d366 fill, white text 12px/400, 4–8px padding, small group icon left of the label.
Overlay element on hero/group imagery.

### Navigation Bar (Header)
White #ffffff background, 20px horizontal padding per nav item, 18px vertical spacing. Logo left,
nav links left-of-center, ghost Log In + green Download CTA right. Separation via white-on-cream
contrast, no heavy border. No sticky behavior beyond the header.

## Do's

- Use #25d366 for the single primary CTA per viewport — never two competing green buttons on screen
- Set display headlines at 48–80px weight 700 — undersized headlines break the magazine scale
- Use 50px radius for all buttons and tags — the pill is core to the approachable feel
- Let the cream #fcf5eb canvas show through generously — cream is a design choice, not a fallback
- Use 25px radius on all imagery and phone mockups
- Keep #0373e9 exclusively for inline text links — never a background fill or icon color
- Pair 16px body with line-height 1.34–1.39

## Don'ts

- Don't use #25d366 for non-action elements (icons, illustrations, decorative shapes)
- Don't introduce new chromatic colors — the ~2% colorfulness is deliberate restraint
- Don't use sharp corners (0–4px) on any interactive element
- Don't add drop shadows to cards or images — depth comes from surface contrast
- Don't set headlines below 48px
- Don't use #000000 for text — #1c1e21 / #111b21 are the system's warmer blacks
- Don't stack white card on white card — the warm backdrop must anchor each section

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 1 | Cream Canvas | `#fcf5eb` | Base page background, full viewport |
| 2 | Pure White | `#ffffff` | Cards, chat bubbles, elevated panels |
| 3 | Pale Blue | `#f0f4f9` | Input fields, interactive surface differentiation |

## Elevation

No drop shadows, no box-shadow tokens. Depth is entirely surface contrast: cream reads as recessed,
white floats above it, photography sits topmost. Border-radius and color contrast alone distinguish
components.

## Imagery

Full-bleed editorial photography: warm, natural-light candid portraits of people using phones in
real settings (markets, cafes, outdoors). No studio or staged product shots. Natural color, no
filters or duotones. Chat bubbles, avatar stacks and join badges float over photography as native
UI overlays. No illustration system. Iconography minimal: green phone receiver in the logo,
download arrows in CTAs, right-chevrons in ghost buttons. Image-to-text ratio 60/40 in hero,
50/50 in feature sections.

## Layout

Full-bleed hero with a massive photographic background and overlaid headline/CTA stack, then
generous vertical whitespace on cream for feature sections. 1200px centered content, 120–160px
section gaps. Hero text anchored to the left third, chat-bubble UI floating right. Feature sections
alternate centered headline blocks (with floating bubble constellations) and asymmetric two-column
layouts. No sidebar, no mega-menu. Single-column top-to-bottom flow alternating photographic and
text-driven sections.

## Type Scale Philosophy

Extreme scale contrast: 80px display next to 16px body — a 5x jump most systems would consider too
dramatic. Deliberate. Two weights only (400 body/UI, 700 display) keeps decisions binary. 1.0–1.1
line-heights on display are aggressive — type fills space confidently rather than breathing
politely. Body at 1.34–1.39 is the only place the system relaxes. No italic, no light weight, no
condensed variant. Hierarchy beyond size comes from color (Charcoal vs Warm Gray) or the single
accent, never from typographic ornamentation.

## Similar Brands

Apple product pages · Headspace · Duolingo · Notion

## Quick Start — CSS Custom Properties

```css
:root {
  /* Colors */
  --color-whatsapp-green: #25d366;
  --color-link-blue: #0373e9;
  --color-charcoal: #1c1e21;
  --color-ink-black: #111b21;
  --color-cream-canvas: #fcf5eb;
  --color-pure-white: #ffffff;
  --color-warm-gray: #5e5e5e;
  --color-pale-blue-wash: #f0f4f9;

  /* Typography */
  --font-whatsapp-sans-var: 'WhatsApp Sans Var', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --text-caption: 12px;    --leading-caption: 1.38;
  --text-body: 16px;       --leading-body: 1.34;
  --text-body-lg: 18px;    --leading-body-lg: 1.39;
  --text-heading-sm: 48px; --leading-heading-sm: 1.2;
  --text-heading: 60px;    --leading-heading: 1.1;
  --text-display: 80px;    --leading-display: 1;
  --font-weight-regular: 400;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-unit: 4px;
  --spacing-4: 4px;   --spacing-8: 8px;   --spacing-12: 12px; --spacing-16: 16px;
  --spacing-20: 20px; --spacing-24: 24px; --spacing-28: 28px; --spacing-32: 32px;
  --spacing-40: 40px; --spacing-56: 56px; --spacing-88: 88px;

  /* Layout */
  --page-max-width: 1200px;
  --card-padding: 32px;

  /* Border Radius */
  --radius-small: 8px;
  --radius-cards: 16px;
  --radius-images: 25px;
  --radius-inputs: 50px;
  --radius-buttons: 50px;

  /* Surfaces */
  --surface-cream-canvas: #fcf5eb;
  --surface-pure-white: #ffffff;
  --surface-pale-blue: #f0f4f9;
}
```
