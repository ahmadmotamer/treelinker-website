# Design references

Style references captured for TreeLinker's marketing site. Each file is a full token +
component spec. They are *references*, not the site's system — TreeLinker currently runs
"Pressed Linen" (neumorphic cream, `assets/css/style.css`).

- [whatsapp.md](whatsapp.md) — warm cream canvas, one green CTA, 80px display type, pill
  everything, zero shadows, full-bleed candid photography.
- [signal.md](signal.md) — pale blue/white bands, outlined-only CTAs, Inter 800 headlines at
  1.07 leading, 8px buttons / 16px panels, halftone-dot illustration, dark slate footer.

## Where they agree

Both are messaging-app marketing sites and share the same skeleton, which is the part worth
copying:

| | Shared convention |
|---|---|
| Container | 1200px max-width, centered, generous gutters |
| Type | Sole typeface, two or three weights, extreme display-vs-body contrast, tight display leading (≤1.2) and relaxed body leading (≥1.34) |
| Color | One accent, used only for interaction. No status colors, no second chroma, no gradients |
| Structure | Vertical sequence of sections alternating text-left/visual-right; no grids, no sidebars, no mega-menus |
| Chrome | Minimal header: mark left, links, one CTA right. No sticky behavior beyond the header |
| Imagery | Exactly one visual idiom per site, applied everywhere |

## Where they diverge — the axis to choose on

| | WhatsApp | Signal |
|---|---|---|
| Canvas | Warm cream `#fcf5eb` | Cool paper `#f6f6f6` + full-bleed color bands |
| Accent use | Filled green CTA — an invitation | Outlined blue CTA — an offer, never a demand |
| Radius | 50px pills, 25px images | 8px buttons, 16px panels |
| Depth | None. Surface contrast only | One shadow token, on mockups and panels only |
| Display type | 80px / 700 | 60px / 800 |
| Body leading | 1.34 (tight, dense) | 1.50 (airy) |
| Section rhythm | 120–160px of whitespace | 64–80px + edge-to-edge color band changes |
| Visual idiom | Candid editorial photography + floating chat UI | Halftone blue dots + phone mockups. No photography |
| Footer | Light, part of the canvas | Dark slate, the only dark surface |

Read as a spectrum: **WhatsApp = warm, photographic, filled, pillowy, whitespace-separated.
Signal = cool, illustrative, outlined, squared, band-separated.**

## Relation to TreeLinker's current system

"Pressed Linen" already sits nearer WhatsApp: one warm surface (`--color-cream #F2EFE4`)
carrying the whole page, no borders, a single green family for action. The differences to be
aware of if either reference is borrowed from:

- TreeLinker encodes role through neumorphic depth (raised / pressed / engraved). WhatsApp
  forbids shadows outright and Signal allows exactly one — neither elevation model transfers.
  Taking their radii or type scale does not mean taking their flatness.
- TreeLinker's display type is far smaller than either reference. Scaling the hero up is the
  cheapest way to borrow their confidence without touching the surface system.
- Both references cap themselves at two or three font weights. That constraint transfers cleanly.
