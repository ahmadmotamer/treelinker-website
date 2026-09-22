# Signal Messenger — Style Reference
> Frosted privacy glass. A nearly white room washed in pale blue light, with one vivid blue line marking every door you can open.

**Theme:** light

Signal speaks through a frosted privacy glass aesthetic: a nearly monochrome canvas of white and
pale blue washes, with one confident blue accent guiding the eye to interactions. Deliberately
restrained — weight 800 headlines carry all the visual weight alone, surrounded by generous
whitespace and almost no ornamentation. Buttons are outlined rather than filled, signaling honesty
over persuasion; the only solid color blocks appear in product mockups and the dark slate footer.
A halftone dot illustration style provides the sole decorative personality, rendered entirely in
brand blue. Technical documentation elevated to brand: trustworthy, quiet, precise.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Signal Blue | `#2c6bed` | `--color-signal-blue` | Outlined CTA borders/text, links, halftone illustrations |
| Deep Signal | `#2942ff` | `--color-deep-signal` | Navigation links and brand mark — cooler, more electric, chrome-level interaction |
| Signal Sky | `#9dbbf8` | `--color-signal-sky` | Hero section wash, large decorative panels — soft periwinkle |
| Signal Mist | `#a5cad5` | `--color-signal-mist` | Secondary feature panel backgrounds — desaturated teal that breaks page rhythm |
| Ink | `#1b1b1b` | `--color-ink` | Primary body and heading text — soft black at AAA contrast |
| Slate | `#404654` | `--color-slate` | Secondary body text — cool gray with a faint violet cast |
| Twilight | `#3c3744` | `--color-twilight` | Footer background — muted purple-black, no pure-black harshness |
| Fog | `#e9e9e9` | `--color-fog` | Hairline borders, dividers, footer link text |
| Paper | `#f6f6f6` | `--color-paper` | Page canvas — off-white that warms stark white without going cream |
| White | `#ffffff` | `--color-white` | Card and component surfaces, section separation. Never a CTA fill |

## Tokens — Typography

**Inter** (substitute: system-ui stack) — sole typeface. Only three weights: 400, 600, 800.
Sizes: 16, 20, 28, 40, 60px. Line height 1.07–1.50.
Weight 800 headlines with tight 1.07–1.14 leading create near-solid blocks of type that anchor the
page. 600 handles buttons and subheadings. 400 body at 1.50 gives generous reading rhythm. The
extreme contrast between 800 display and 400 body is the typographic signature.

| Role | Size | Line Height | Token |
|------|------|-------------|-------|
| body | 16px | 1.5 | `--text-body` |
| subheading | 20px | 1.4 | `--text-subheading` |
| heading-sm | 28px | 1.38 | `--text-heading-sm` |
| heading | 40px | 1.14 | `--text-heading` |
| display | 60px | 1.07 | `--text-display` |

## Tokens — Spacing & Shapes

Base unit 6px. Density: comfortable.
Scale: 12, 18, 24, 30, 48px.

Radius: buttons 8px · images 16px · panels 16px. The radius gap between interactive and visual
elements is intentional.

Shadow (the only one): `rgba(0,0,0,0.12) 0 4px 12px, rgba(0,0,0,0.08) 0 0 2px` — `--shadow-md`.

Layout: page max-width 1200px · section gap 64–80px · card padding 30–48px · element gap 12–24px.

## Components

### Outlined Primary Action Button
The primary CTA across the site ('Get Signal', 'Donate to Signal'). White fill, 1.5px #2c6bed
border, #2c6bed text, 8px radius, Inter 600/16px, 12px vertical / 24px horizontal padding. The
outlined treatment reads as an invitation rather than a command.

### Filled Teal Action Button
Secondary/contextual only. Solid #a5cad5 (or deeper teal) fill, white text, 8px radius, Inter
600/16px, same padding. Used only when the button sits on a light blue panel where an outlined
button would lack contrast.

### Navigation Link
#2942ff text, Inter 400/16px, no underline by default, 24px horizontal spacing, right-aligned in
the header. No background, no border.

### Display Headline
Inter 800 at 60px (display) or 40px (section heading), #1b1b1b, line-height 1.07 / 1.14.
Left-aligned, no max line length enforced.

### Body Paragraph
Inter 400/16px, #404654 for secondary body, #1b1b1b for primary, line-height 1.50, max-width ~480px
in feature sections.

### Hero Phone Mockup Container
Two angled phone mockups (group video call + chat) as PNGs on the Signal Sky background. No
container border or background — the phones float freely with the soft elevation shadow.

### Feature Content Panel
Signal Mist or Signal Sky background, 16px radius, soft shadow, 30–48px padding. Contains a phone
mockup, an encrypted message snippet, or the halftone globe.

### Encrypted Message Chip
Filled teal pill, white monospace text showing a random string (e.g. `7a#v9*ht035v:q*`) with a
small lock icon. Sits inside a feature panel — visual proof of the product's core promise.

### Halftone Globe Illustration
Earth in concentric Signal Blue dots with three speech bubbles floating around it, on Signal Sky.
The site's only decorative illustration style.

### Footer Link Column
Column heading Inter 600/16px in white; links Inter 400/14px in #e9e9e9, 12px vertical spacing.
Five columns: Organization, Download, Social, Help, plus a copyright block on the left.

### Signal Mark Lockup
Speech-bubble logo in #2942ff + 'Signal' wordmark in Inter 600/20px, #1b1b1b, left-aligned in the
header. Always bubble + text, never the bubble alone.

## Do's

- Use Inter weight 800 for all headlines — the contrast against 400 body is the signature
- Line-height 1.07 at 60px display, 1.14 at 40px section headings — architectural type
- Outlined buttons (1.5px #2c6bed border, white fill) as the default CTA; filled only on colored panels
- 8px radius on all buttons, 16px on all image/panel containers
- Alternate Signal Sky (#9dbbf8) hero washes with Signal Mist (#a5cad5) secondary panels for rhythm
- Body line-height 1.50
- Limit brand blue to interactive elements, links and the halftone illustration

## Don'ts

- Don't use filled blue buttons on white backgrounds
- Don't add gradients, extra shadows beyond `--shadow-md`, or decorative borders
- Don't use colors outside the palette — no warm accents, no status colors beyond the blue family
- Don't set headline line-height above 1.20
- Don't use pill-shaped buttons (9999px) — the 8px radius distinguishes Signal from consumer apps
- Don't add photography, abstract graphics, or any illustration style other than halftone dots
- Don't use Inter at 500 or 700 — the three-weight gap (400/600/800) is the scale

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Paper | `#f6f6f6` | Page canvas |
| 1 | White | `#ffffff` | Cards and component surfaces |
| 2 | Signal Sky | `#9dbbf8` | Hero wash, large brand-color panels |
| 3 | Signal Mist | `#a5cad5` | Secondary feature panels |
| 4 | Twilight | `#3c3744` | Footer ground — the only dark surface |

## Elevation

Product mockup cards and elevated feature panels only:
`0 4px 12px rgba(0,0,0,0.12), 0 0 2px rgba(0,0,0,0.08)`

## Imagery & Illustration System

Product photography means phone mockups showing real app UI — nothing else. No lifestyle
photography, no abstract gradients, no stock imagery. Exactly one illustration style: halftone dot
patterns. Subjects (Earth, speech bubbles, people) rendered as concentric circles of Signal Blue
dots on Signal Sky. Dot size varies for tonal depth — larger for darker areas, smaller for
highlights. Deliberately analog, evoking newsprint. No flat, gradient, or line-art illustrations.
Icons are minimal, line-style, monochrome.

## Layout

1200px centered container with generous side gutters. The page is a vertical sequence of
full-width color bands rather than a continuous white canvas: white → pale blue hero → white
feature → muted teal feature → white → pale blue donate band → dark slate footer. Each band spans
edge-to-edge; content inside stays centered. Hero is an asymmetric 2-column split — text left
(~40%), phone mockups right (~60%). Feature sections alternate text-left/visual-right and
text-right/visual-left. 64–80px vertical separation. Minimal top bar: mark left, text links right.
Footer is a 5-column link grid on dark slate with copyright and contact on the left.

## Button Philosophy

Buttons are outlined by default — a deliberate departure from the filled-CTA convention. The
brand's voice is invitational, not promotional: an outlined button asks, a filled button demands.
The single filled exception is a button on a colored panel where outlining would lack contrast.
This restraint makes the outlined blue button the most recognizable UI element on the site.
Never introduce a third button style.

## Similar Brands

Proton · Wire · Standard Notes · Element · Mozilla

## Quick Start — CSS Custom Properties

```css
:root {
  /* Colors */
  --color-signal-blue: #2c6bed;
  --color-deep-signal: #2942ff;
  --color-signal-sky: #9dbbf8;
  --color-signal-mist: #a5cad5;
  --color-ink: #1b1b1b;
  --color-slate: #404654;
  --color-twilight: #3c3744;
  --color-fog: #e9e9e9;
  --color-paper: #f6f6f6;
  --color-white: #ffffff;

  /* Typography */
  --font-inter: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --text-body: 16px;       --leading-body: 1.5;
  --text-subheading: 20px; --leading-subheading: 1.4;
  --text-heading-sm: 28px; --leading-heading-sm: 1.38;
  --text-heading: 40px;    --leading-heading: 1.14;
  --text-display: 60px;    --leading-display: 1.07;
  --font-weight-regular: 400;
  --font-weight-semibold: 600;
  --font-weight-extrabold: 800;

  /* Spacing */
  --spacing-unit: 6px;
  --spacing-12: 12px; --spacing-18: 18px; --spacing-24: 24px;
  --spacing-30: 30px; --spacing-48: 48px;

  /* Layout */
  --page-max-width: 1200px;

  /* Border Radius */
  --radius-buttons: 8px;
  --radius-images: 16px;
  --radius-panels: 16px;

  /* Shadows */
  --shadow-md: rgba(0, 0, 0, 0.12) 0px 4px 12px 0px, rgba(0, 0, 0, 0.08) 0px 0px 2px 0px;

  /* Surfaces */
  --surface-paper: #f6f6f6;
  --surface-white: #ffffff;
  --surface-signal-sky: #9dbbf8;
  --surface-signal-mist: #a5cad5;
  --surface-twilight: #3c3744;
}
```
