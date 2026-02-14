# Web Design Style Guide

Based on [ianteh.com](https://www.ianteh.com/) and inspiration screenshots.

---

## 1. Design Philosophy

- **Photography-first**: Every design decision serves the images. The UI recedes; the photos dominate.
- **Minimal chrome**: Navigation, labels, and controls are visually lightweight — present but never competing with imagery.
- **Editorial tone**: The site feels like a curated exhibition, not a social feed. Generous whitespace, restrained typography, and deliberate pacing.

---

## 2. Layout

### Homepage / Hero Slideshow
- **Full-bleed hero images** spanning the entire viewport (100vw x 100vh).
- Images fill the screen edge-to-edge with no padding, borders, or rounded corners.
- Navigation arrows sit in small **black squares** (~40x40px) at left/right edges, vertically centered.
- A **project label** anchored to the bottom-left in a semi-transparent dark bar:
  - Format: `STORIES / PROJECT NAME` in all-caps, letterspaced.
- Auto-advances every ~5 seconds with a subtle crossfade/slide transition.

### Story/Gallery Detail Pages
- **Two-column grid** for photo pairs, sitting on a clean white background.
- Images are large and given breathing room — generous margins on all sides.
- **Captions** sit directly below each image in a smaller, lighter font — descriptive paragraph style, left-aligned.
- No decorative borders, shadows, or overlays on images.

### Bio / Text Pages
- Single-column, centered layout with a readable max-width (~700px).
- "Biography" as a simple heading, followed by body text paragraphs.
- A **CTA button** ("CHECK OUT MY INSTAGRAM FEED FOR UPDATES") in a solid black rectangle with white uppercase text.
- Below the CTA, a horizontal row of Instagram thumbnail images.

---

## 3. Navigation

### Structure
```
Logo (top-left)                    Nav Links (top-right) + Social Icons
```

### Primary Nav Items
- Stories (dropdown)
- Commissions (dropdown)
- PhotoShelter
- Bio
- CV

### Behavior
- Nav is **overlaid on the hero image** with white text (adapts for readability).
- On gallery/text pages, nav sits on a **white background** with dark text.
- **Dropdown menus**: Clean white background, left-aligned text list, no icons or decorations. Appears on hover/click.
- Dropdown items use sentence case (e.g., "Line of Least Resistance", "China's New Deserts").
- **Social icons** (Facebook, Instagram, Email) sit to the right of nav links — small, simple, monochrome.

### Mobile
- Collapses to a hamburger menu at ~768px breakpoint.

---

## 4. Typography

### Font Choices
| Element | Style |
|---|---|
| Logo / Site Title | Uppercase, wide letterspacing (~0.3em), light weight, sans-serif |
| Nav Links | Small, uppercase or sentence case, sans-serif, regular weight |
| Project Labels | Uppercase, letterspaced, small size, sans-serif |
| Page Headings | Serif or transitional serif, regular weight, sentence case (e.g., "Biography") |
| Body Text | Serif, regular weight, ~16px, comfortable line-height (~1.6) |
| Captions | Smaller serif or sans-serif, lighter color, ~13-14px |
| CTA Buttons | Uppercase, letterspaced, bold/medium weight, sans-serif |

### Recommended Font Pairings
- **Headings / Logo**: A clean, geometric sans-serif with wide tracking (e.g., `Archivo`, `Inter`, `Helvetica Neue`)
- **Body / Captions**: A readable serif (e.g., `Georgia`, `Libre Baskerville`, `Source Serif Pro`)

---

## 5. Color Palette

The palette is intentionally restrained — the photography provides all the color.

| Role | Value | Usage |
|---|---|---|
| Background | `#FFFFFF` | Default page background |
| Primary Text | `#222222` | Headings, body copy |
| Secondary Text | `#666666` | Captions, metadata |
| Nav Text (on hero) | `#FFFFFF` | White text over full-bleed images |
| Nav Text (on white) | `#333333` | Dark text on white background pages |
| Accent / CTA | `#000000` | Buttons, navigation arrows, project labels |
| CTA Text | `#FFFFFF` | White text on black buttons |
| Borders / Dividers | `#E0E0E0` | Subtle separators if needed (used sparingly) |

**No brand colors.** The photographer's work *is* the color. The UI stays monochrome.

---

## 6. Image Presentation

### General Rules
- Images are always the **largest element on any page**.
- No borders, drop shadows, rounded corners, or filters applied by the UI.
- Maintain original aspect ratios — never crop or distort.
- Use high-quality, optimized images (WebP with JPEG fallback).

### Homepage Slideshow
- Full-viewport (100vw x 100vh), `object-fit: cover`.
- Smooth crossfade transitions between slides.

### Gallery Pages
- Two-up grid with equal-width columns and consistent gutters (~30-40px).
- Single images can span the full content width when shown alone.
- Captions always below, never overlaid.

### Thumbnails / Instagram Feed
- Small, square crops in a horizontal row.
- Consistent sizing, no gaps or minimal gaps.

---

## 7. Spacing & Sizing

| Property | Value |
|---|---|
| Page max-width (text) | ~700px |
| Page max-width (gallery) | ~1200px |
| Section padding | 60-80px vertical |
| Image grid gutter | 30-40px |
| Nav top padding | 20-30px |
| Nav side padding | 30-40px |
| Body font size | 16px |
| Caption font size | 13-14px |
| Logo letterspacing | 0.3em+ |

---

## 8. Interactive Elements

### Navigation Arrows (Slideshow)
- Small black square with a white chevron (`<` / `>`).
- Appears at horizontal edges of the viewport, vertically centered.
- Subtle hover state (slight opacity change).

### Dropdown Menus
- White background, no border-radius, minimal shadow or border.
- Items have comfortable padding (~10px vertical, 20px horizontal).
- Hover state: subtle background highlight or text color shift.

### CTA Buttons
- Solid black background, white uppercase text.
- No border-radius (sharp rectangles).
- Generous padding (~15px 30px).
- Hover: subtle inversion or opacity change.

### Links
- Body links: underline or color shift on hover — no heavy styling.
- Nav links: no underline; active/current page indicated by a subtle dot or underline.

---

## 9. Key Design Patterns

1. **Hero-as-homepage**: No landing page text. The first thing you see is a full-bleed photograph. The work speaks first.
2. **Category > Project > Images**: Content is organized in a clear hierarchy — top-level categories (Stories, Commissions) contain projects, projects contain images with captions.
3. **Overlay navigation**: On image-heavy pages, navigation floats over the content in white. On text pages, it switches to dark-on-white.
4. **Breadcrumb-style labels**: `STORIES / PROJECT NAME` pattern provides context without a traditional breadcrumb trail.
5. **Paired images with captions**: Gallery pages favor a two-column layout where image pairs create visual dialogue, each with its own caption below.

---

## 10. What to Avoid

- Busy backgrounds, gradients, or patterns
- Colored UI elements that compete with photography
- Heavy drop shadows or skeuomorphic effects
- Rounded corners on images or containers
- Decorative icons or illustrations
- Excessive animation or parallax effects
- Dense grids or masonry layouts — give each image room to breathe
- Social media share buttons cluttering the image view
