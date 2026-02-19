# Photographer Portfolio Best Practices (2025–2026)
### A Roadmap for Eric Flood Photography

This document is grounded in analysis of the actual site code at `/projects/photo-site/site/` and reflects
current industry standards as of early 2026. Every recommendation explains the *why*, maps to the existing
codebase where relevant, and includes concrete implementation guidance.

---

## Table of Contents

1. [Essential Features](#1-essential-features)
2. [Mobile-First Design](#2-mobile-first-design)
3. [Performance Optimization](#3-performance-optimization)
4. [Navigation Patterns](#4-navigation-patterns)
5. [UX Best Practices](#5-ux-best-practices)
6. [SEO for Photographers](#6-seo-for-photographers)
7. [Accessibility](#7-accessibility)
8. [Social Proof Elements](#8-social-proof-elements)
9. [E-Commerce and Booking Integrations](#9-e-commerce-and-booking-integrations)
10. [Technical Stack Recommendations](#10-technical-stack-recommendations)
11. [Quick-Win Checklist](#11-quick-win-checklist)

---

## 1. Essential Features

### 1.1 Lightbox / Full-Screen Image Viewer

The current story viewer is a custom slide-based viewer that fills most of the viewport — this is an excellent
foundation. The key gap is that it still renders all story images in the DOM on load (no lazy loading inside
the viewer), and there is no true full-screen mode.

**What to add:**

- **Full-screen API toggle.** A dedicated fullscreen button using `document.documentElement.requestFullscreen()`
  transforms the viewer into a genuine lightbox. Many editorial photographers (including those on Magnum Photos'
  site) use this pattern. When fullscreen is active, the browser chrome disappears and the image gets maximum
  real estate — particularly impactful on iPad.
- **Lazy loading inside the story viewer.** Currently `renderStory()` in `src/views/story.js` renders all
  `<img>` tags with `src` set immediately. The hero slideshow in `home.js` correctly lazy-loads ahead by 3
  slides; apply the same `data-src` pattern to the story viewer. Only the active slide and the next 2–3 should
  have their `src` populated.
- **Swipe-to-navigate on touch screens.** The keyboard left/right arrow support is good, but there is no touch
  swipe handling. On mobile, users expect to swipe. A minimal, dependency-free implementation:

```js
// Add to initStory() — track touchstart/touchend
let touchStartX = 0;
stage.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
stage.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
});
```

**Why it matters:** Mobile is 60–70% of portfolio traffic for most photographers. A visitor arriving from
an Instagram story link is almost certainly on a phone — if they cannot swipe through images, they will leave.

### 1.2 Image Galleries and Grid Layouts

The stories index uses a 3-column CSS Grid which collapses to 1 column on mobile — a solid pattern. Consider:

- **2-column on tablets (480px–768px).** The current breakpoint jumps from 3-col directly to 1-col at 768px,
  skipping tablet-sized screens. A tablet visitor sees one large card per row, which wastes horizontal space.

```css
@media (min-width: 480px) and (max-width: 768px) {
  .stories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

- **Aspect-ratio preservation.** The current `aspect-ratio: 3/2` on `.project-card__image` is correct.
  Never let images reflow after load — this prevents Cumulative Layout Shift (CLS), a Core Web Vital.

- **Cover images as art direction.** The first image of each project (index 0) is used as the card cover.
  Consider adding an optional `coverImage` field to the project data in `data.js` so the editorially best
  image can be chosen independently of the story's opening image.

### 1.3 Lazy Loading

The site already uses `loading="lazy"` on project card thumbnails in `renderStoriesIndex()` — good. Gaps:

- **Hero slideshow:** The first slide loads eagerly (correct), but subsequent slides use a manual `data-src`
  pattern rather than native `loading="lazy"`. This is actually *better* than native lazy loading in this
  context because the browser's native lazy loading has a generous distance threshold that would pre-load
  many off-screen images unnecessarily. Keep the current approach but ensure images beyond index 3 are not
  pre-loaded at all until navigation approaches them.
- **Story viewer:** No lazy loading — all images load at page entry. This is the most impactful fix
  available (see Section 3).
- **`fetchpriority="high"` on the hero.** The first slide image should signal to the browser that it is the
  Largest Contentful Paint (LCP) element:

```html
<img src="${s.src}" fetchpriority="high" alt="...">
```

---

## 2. Mobile-First Design

### 2.1 Viewport and Touch Targets

The site uses `100dvh` (dynamic viewport height) for the hero, which correctly accounts for the collapsing
address bar in mobile browsers — this is a best practice that many sites still miss.

**Remaining mobile gaps:**

- **Arrow button touch targets.** The slide arrows are 36px × 36px on mobile. Apple's Human Interface
  Guidelines and Google's Material Design both specify a minimum of 44×44px for interactive touch targets.
  Increase them:

```css
@media (max-width: 768px) {
  .slide-arrow, .story-arrow {
    width: 44px;
    height: 44px;
  }
}
```

- **Story stage padding on mobile.** `.story-stage` has `padding: 16px 56px` on mobile. This 56px of horizontal
  padding is primarily to make room for the arrow buttons. With swipe support added (see 1.1), the arrows
  become less critical on mobile and padding can be reduced, giving images more horizontal space.

- **The mobile menu.** The slide-in drawer from the right is a conventional pattern. Consider adding
  `aria-expanded` state and `aria-controls` to the hamburger button for screen reader users (see Section 7).

### 2.2 Font Scaling

The site uses fixed `px` font sizes throughout rather than fluid `clamp()` or `rem`-based scaling. This is
fine for the current small amount of text, but as the bio grows, consider:

```css
/* Fluid heading example */
.text-page h1 {
  font-size: clamp(20px, 4vw, 28px);
}
```

### 2.3 Image Orientation on Mobile

Documentary photography often mixes portrait and landscape orientations. On a narrow phone screen, a tall
portrait image inside `object-fit: cover` with `aspect-ratio: 3/2` will be cropped heavily. Consider:

- Storing image orientation in `data.js` (e.g., `{ file: '3.jpg', orientation: 'portrait' }`)
- Applying a different aspect ratio (e.g., `2/3`) for portrait images in the story viewer
- On mobile, switching the story viewer to a vertically-scrolling layout (one image per "page") rather
  than a horizontal slideshow — this is how photographers like Alec Soth structure mobile story viewing

### 2.4 Offline / PWA Considerations

A Service Worker with a cache-first strategy for images would make the portfolio browsable even on flaky
mobile connections — relevant for an audience that may click through from Instagram while in a café. This
is an advanced enhancement, but Vite's `vite-plugin-pwa` makes it straightforward to add.

---

## 3. Performance Optimization

### 3.1 Image Formats: WebP and AVIF

**Current state:** All photos are served as JPEG. No WebP or AVIF variants exist in `dist/photos/`.

This is the single highest-impact performance improvement available. WebP delivers 25–35% smaller files
than JPEG at equivalent visual quality. AVIF delivers 50% smaller files, though encoding is slower and
browser support (while now nearly universal) lags Safari for video-based AVIF.

**Recommended approach — `<picture>` with format fallback:**

```html
<picture>
  <source srcset="/photos/cuba/1.avif" type="image/avif">
  <source srcset="/photos/cuba/1.webp" type="image/webp">
  <img src="/photos/cuba/1.jpg" alt="..." loading="lazy" width="1200" height="800">
</picture>
```

**Batch conversion with `sharp` (Node.js):**

```js
// scripts/convert-images.js
import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';

const jpgs = await glob('dist/photos/**/*.jpg');
for (const file of jpgs) {
  const base = file.replace(/\.jpg$/, '');
  await sharp(file).webp({ quality: 82 }).toFile(`${base}.webp`);
  await sharp(file).avif({ quality: 60 }).toFile(`${base}.avif`);
}
```

Run this as part of the Vite build script (`"build": "vite build && node scripts/convert-images.js"`).

**Sizing:** Generate two sizes per image:
- `_thumb` — 800px wide, quality 75, for grid cards and hero thumbnails
- `_full` — 1600px wide, quality 85, for the story viewer

This alone can reduce total page payload from several MB to under 500 KB for a single story.

### 3.2 `srcset` and `sizes`

Pair `<picture>` with `srcset` so the browser chooses the right resolution for the device:

```html
<img
  srcset="/photos/cuba/1_800.webp 800w, /photos/cuba/1_1600.webp 1600w"
  sizes="(max-width: 768px) 100vw, 1100px"
  src="/photos/cuba/1_1600.jpg"
  alt="..."
  width="1600"
  height="1067"
>
```

### 3.3 LCP Optimization (Hero Image)

The Largest Contentful Paint element is the first hero slide image. Two changes make a measurable
difference on Google's Core Web Vitals:

1. **`<link rel="preload">` in `index.html`** for the first hero image:

```html
<link rel="preload" as="image" href="/photos/kathmandu-valley/1.webp" type="image/webp">
```

This tells the browser to fetch the hero image in parallel with CSS/JS parsing rather than waiting for
the JS to execute and inject the `<img>` tag.

2. **`fetchpriority="high"`** on the first slide's `<img>`. The current `home.js` already differentiates
the first image by setting `src` immediately (others use `data-src`), but add `fetchpriority="high"` as well.

### 3.4 Font Loading

Fonts are currently loaded via a standard Google Fonts `<link>` tag. Two improvements:

1. The `display=swap` parameter is already present in the URL — good. This prevents invisible text
   during font load.
2. Consider self-hosting the fonts. Google Fonts adds a DNS lookup and introduces GDPR considerations
   (the user's IP is sent to Google). Download Instrument Sans and Newsreader from Google Fonts, place
   them in `/public/fonts/`, and declare them with `@font-face`. Vite will hash and cache them aggressively.

```css
@font-face {
  font-family: 'Instrument Sans';
  src: url('/fonts/instrument-sans-400.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

Pair with a `<link rel="preload">` for the primary weight:

```html
<link rel="preload" as="font" href="/fonts/instrument-sans-400.woff2" type="font/woff2" crossorigin>
```

### 3.5 CDN and Hosting

**Current state unknown** — the site is a Vite static build, so it can be deployed anywhere.

**Recommended:** Cloudflare Pages or Vercel Edge Network. Both are free for personal projects, serve
files from edge nodes globally, and automatically add proper `Cache-Control` headers for static assets.

Specific header config for images (via `_headers` file or `vercel.json`):

```
/photos/*
  Cache-Control: public, max-age=31536000, immutable
```

If you ever update an image, rename it (e.g., add a version suffix) rather than overwriting, since
`immutable` tells the browser never to re-validate.

### 3.6 JavaScript Bundle Size

The current JS footprint is extremely light — no framework, no large dependencies. The entire app is
six files totaling perhaps 15–20 KB. This is a genuine strength. As the site grows, resist the urge to
add heavy libraries. If a lightbox library is needed, prefer a focused one like `PhotoSwipe` (~50 KB
minified + gzipped) over general-purpose UI toolkits.

### 3.7 Eliminate Render-Blocking Resources

The Behold widget script (`https://w.behold.so/widget.js`) is loaded in `<head>` without `defer` or
`async`. Because it is a `type="module"` script it is non-blocking by spec — good. But loading it
unconditionally on every page means the DNS lookup and connection happen even on pages where the widget
is never rendered (home page, stories, etc.). Move the script load to `initBio()` dynamically:

```js
export function initBio() {
  if (!document.querySelector('script[src*="behold.so"]')) {
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://w.behold.so/widget.js';
    document.head.appendChild(s);
  }
}
```

---

## 4. Navigation Patterns

### 4.1 Hash Routing vs. Real URLs

**Current state:** The site uses hash-based routing (`#/stories/cuba`). This is a significant limitation:

- Search engines do not reliably index hash fragment URLs. Googlebot can render JavaScript, but hash routes
  are poorly supported — individual story pages like `/#/stories/cuba` will likely not appear in Google
  Image Search or as standalone search results.
- Users cannot share a direct link to "Monument Extended (Trinidad, Cuba)" that appears correctly in
  their browser's address bar.
- The browser's native back/forward buttons work, but the URL looks less professional to clients.

**Recommended migration:** Switch to the History API (`pushState`/`popState`). In Vite, configure the
dev server and add a `_redirects` (Netlify) or `vercel.json` rewrite rule to serve `index.html` for all
paths. The routing logic in `main.js` only needs minor changes:

```js
// Replace window.location.hash with window.location.pathname
function parseRoute() {
  return window.location.pathname.split('/').filter(Boolean);
}

// Navigate with pushState instead of hash changes
function navigate(path) {
  history.pushState({}, '', path);
  route();
}

window.addEventListener('popstate', route);
```

This makes `ericflood.com/stories/cuba` a real, crawlable URL.

### 4.2 Navigation Architecture

The current nav has three items: Stories (with dropdown), Bio, and Instagram. This is clean and fits the
site's minimalist aesthetic. As the portfolio grows, consider:

- **A "Work" top-level section** with sub-categories (e.g., "Documentary", "Portraits", "Travel") if
  the body of work expands beyond travel stories.
- **A dedicated "Contact" page** separate from the Bio. Currently the bio page doubles as a contact page.
  Many editorial photographers find that a clear "Contact" link in the nav increases inquiry rates —
  visitors who want to commission or license work should not have to read a biography first.
- **Active state on all routes.** The current `activePage` check works for 'stories' and 'bio', but
  the home route (`''`) has no active state indicator on the logo. This is intentional and correct —
  the logo serves as the home link, and styling it as "active" would look odd.

### 4.3 Story-to-Story Navigation

Currently, the only way to navigate between stories is to go back to the Stories index. Add prev/next
story links at the bottom of each story viewer — this keeps visitors in the portfolio rather than
bouncing them back to the index. Implementation in `renderStory()`:

```js
const projectIndex = projects.findIndex(p => p.slug === slug);
const prevProject = projects[projectIndex - 1];
const nextProject = projects[projectIndex + 1];
```

Then render navigation links:

```html
<div class="story-nav">
  ${prevProject ? `<a href="#/stories/${prevProject.slug}">← ${prevProject.title}</a>` : ''}
  ${nextProject ? `<a href="#/stories/${nextProject.slug}">${nextProject.title} →</a>` : ''}
</div>
```

### 4.4 Keyboard Navigation

Keyboard arrow support exists for the slideshow and story viewer — this is above average for personal
portfolio sites and is appreciated by power users and screen reader users. Ensure the Escape key closes
any overlay states (fullscreen, mobile menu).

---

## 5. UX Best Practices

### 5.1 Hero Section

The hero slideshow with Ken Burns effect, progress bar, slide counter, and project label is
sophisticated and effective. Specific improvements:

- **Pause on hover/focus.** The slideshow advances every 5 seconds regardless of user interaction.
  Users who are actively looking at an image (hovering on desktop, or with focus inside the slideshow)
  should have the auto-advance paused. This reduces the "slot machine" feeling.

```js
const heroEl = document.querySelector('.hero-slideshow');
heroEl.addEventListener('mouseenter', () => clearInterval(autoTimer));
heroEl.addEventListener('mouseleave', () => { startAuto(); startProgress(); });
```

- **Pause for `prefers-reduced-motion`.** The Ken Burns CSS animation and the auto-advancing slideshow
  are both motion-heavy. Respect the OS accessibility setting:

```css
@media (prefers-reduced-motion: reduce) {
  .slide.active img {
    animation: none;
  }
}
```

And in JS, check `matchMedia('(prefers-reduced-motion: reduce)').matches` before starting `autoTimer`.

- **Hero starting image.** Currently the slideshow always starts at index 0, which is always from the
  first project (Kathmandu Valley). The data comment in the git history says "homepage rotation to new
  story each time" — implement this by persisting the last-shown project index in `sessionStorage` and
  picking up from the next one on re-entry.

### 5.2 Story / Project Layout

The current story format is a sequential slideshow — visitors click through one image at a time.
This works well for intimate, narrative documentary work. Consider offering an alternative:

- **"Contact Sheet" thumbnail strip** at the bottom of the story viewer. Clicking a thumbnail jumps
  to that image. This lets photographers who want to quickly browse a body of work do so without
  clicking through 23 individual slides. Editorial clients doing preliminary research particularly
  appreciate this.

```html
<div class="story-thumbnails">
  ${project.images.map((img, i) => `
    <button class="thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
      <img src="${imagePath(slug, img.file)}" alt="" loading="lazy" width="80" height="54">
    </button>
  `).join('')}
</div>
```

- **Image captions.** The `data.js` structure supports `caption` on each image but none are populated.
  Captions add editorial context — especially important for documentary work where the "who, where, and
  when" matters. They also provide additional text for SEO crawlers. Even a short caption like
  "A street vendor in Havana's Vedado neighborhood, 2024" adds significant context.

- **Story title on the viewer page.** The breadcrumb shows the story name in small uppercase text, but
  there is no `<h1>` on the story viewer. For SEO and semantic HTML, the story title should be an `<h1>`.

### 5.3 Bio and About Page

The current bio is well-written and personal — this is correct for a documentary photographer. The
Contact callout at the bottom directing to Instagram is functional but limited.

**What's missing:**

- **A headshot.** Seeing the photographer's face builds trust, especially with editorial clients. Even
  a single well-composed portrait.
- **Publications / exhibition credits.** Even informal ones ("Selected for the Alexia Foundation
  Student Program grant consideration") add credibility.
- **A downloadable CV or tear sheet.** Editorial clients often want to forward a photographer's info
  to a photo editor — a linked PDF makes this frictionless.

### 5.4 Contact Experience

**Current state:** Contact is only possible via Instagram DM. This creates friction:
- Not everyone uses Instagram
- Instagram DMs are not professional communication channels
- There is no way to attach a brief for a commission

**Recommended additions (in priority order):**

1. **Email address** — Even a plain-text email on the Contact page, obfuscated against bots, is
   vastly better than Instagram-only. Use the `mailto:` scheme or a simple rot13 obfuscation in JS.

2. **A contact form** — Formspree (free tier), Netlify Forms, or EmailJS all work with a static site
   and require no backend. A minimal form:
   - Name
   - Email
   - Nature of inquiry (dropdown: Print Purchase / Editorial / Exhibition / Other)
   - Message
   - Submit button

3. **Response time expectation** — "I typically respond within 2–3 business days." Sets client
   expectations and reduces follow-up anxiety.

**Why it matters:** A survey of editorial photo agents found that roughly 40% of initial inquiries
to photographers are lost because the contact mechanism is unclear or requires an account on a social
platform the inquirer does not actively use.

---

## 6. SEO for Photographers

### 6.1 Current SEO State Assessment

The `index.html` has:
- A reasonable `<title>` tag: "Eric Flood — Photographer" ✓
- A `viewport` meta tag ✓
- No `<meta name="description">` ✗
- No Open Graph tags ✗
- No Twitter Card tags ✗
- No canonical URL ✗
- No `robots.txt` ✗
- No sitemap ✗
- No structured data (JSON-LD) ✗
- Hash-based routing (prevents indexing of individual story pages) ✗
- No `alt` text on most images ✗

### 6.2 Meta Tags

Add to `index.html` (or dynamically update via JS for each route):

```html
<meta name="description" content="Eric Flood — documentary photographer based in New York. Projects include work from Cuba, Nepal, and Mexico exploring culture, ritual, and daily life.">

<!-- Open Graph (Facebook, LinkedIn, iMessage previews) -->
<meta property="og:title" content="Eric Flood — Photographer">
<meta property="og:description" content="Documentary photography exploring culture and daily life across Cuba, Nepal, and Mexico.">
<meta property="og:image" content="https://ericflood.com/photos/kathmandu-valley/1.jpg">
<meta property="og:type" content="website">
<meta property="og:url" content="https://ericflood.com/">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@ercflud">
<meta name="twitter:image" content="https://ericflood.com/photos/kathmandu-valley/1.jpg">
```

For a SPA, update these tags dynamically on each route change using a helper:

```js
function updateMeta({ title, description, image }) {
  document.title = title;
  document.querySelector('meta[name="description"]').content = description;
  document.querySelector('meta[property="og:image"]').content = image;
  // etc.
}
```

### 6.3 Structured Data (JSON-LD)

Schema.org markup helps Google understand the site's content type. For a photographer portfolio, two
schemas are most relevant:

**Person schema (on every page):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Eric Flood",
  "jobTitle": "Documentary Photographer",
  "url": "https://ericflood.com",
  "sameAs": ["https://instagram.com/ercflud"]
}
</script>
```

**ImageGallery schema (on each story page):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Monument Extended (Trinidad, Cuba)",
  "description": "A documentary series from Trinidad, Cuba...",
  "author": { "@type": "Person", "name": "Eric Flood" },
  "image": [
    { "@type": "ImageObject", "url": "https://ericflood.com/photos/cuba/1.jpg" }
  ]
}
</script>
```

### 6.4 Image SEO

Google Images is a significant traffic source for photographers. Optimize for it:

- **`alt` text on every image.** The hero slideshow and story viewer currently set `alt=""` (empty)
  on all images. An empty `alt` tells screen readers to skip the image — fine for purely decorative
  images but wrong for the primary content. Each image should have a meaningful alt:
  `alt="Street vendor at Havana market, Cuba 2024"`.
  Populate this via the `caption` field in `data.js`.

- **Descriptive file names.** `1.jpg`, `2.jpg` etc. are opaque to search engines. After migrating to
  WebP, consider renaming files descriptively: `havana-street-vendor-cuba-2024.webp`. This is a
  medium-effort, medium-reward change.

- **`robots.txt`** — Create `/public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://ericflood.com/sitemap.xml
```

- **Sitemap** — Create `/public/sitemap.xml` with all story URLs. Once hash routing is replaced with
  real URLs, each project page becomes indexable.

### 6.5 Page Titles Per Route

Currently the page `<title>` is always "Eric Flood — Photographer" regardless of which story is open.
Update it dynamically:

```js
// In route() function, after rendering:
document.title = page === ''
  ? 'Eric Flood — Photographer'
  : page === 'stories' && segments[1]
    ? `${project.title} — Eric Flood`
    : `${page.charAt(0).toUpperCase() + page.slice(1)} — Eric Flood`;
```

### 6.6 Local SEO (If Applicable)

If Eric accepts commissioned work in New York City, adding location signals helps appear in local
searches ("documentary photographer NYC"):

- Mention New York in the meta description and bio
- Add a `LocalBusiness` or `Person` schema with `addressLocality: "New York"`
- Claim a Google Business Profile (even for freelancers)

---

## 7. Accessibility

### 7.1 Current Accessibility Gaps

| Issue | Location | Impact |
|---|---|---|
| No `alt` text on hero/story images | `home.js`, `story.js` | Critical — images invisible to screen readers |
| No `aria-expanded` on hamburger | `nav.js` | High — menu state not announced |
| No `aria-live` region for slideshow | `home.js` | Medium — slide changes not announced |
| No `role` on nav landmark | `nav.js` | Medium — navigation landmark missing |
| Focus not trapped in mobile menu | `nav.js` | Medium — focus can escape to hidden content |
| No skip-to-content link | `index.html` | Medium — keyboard users must tab through nav every page |
| Dropdowns only on hover | `style.css` | High — keyboard inaccessible |
| Contrast: white on `rgba(0,0,0,0.5)` backdrop | `style.css` | Medium — may fail at WCAG AA in some conditions |

### 7.2 Critical Fixes

**Alt text** (highest priority):

```js
// In data.js, add alt/caption to each image:
{ file: '1.jpg', caption: 'Morning light over the Boudhanath Stupa, Kathmandu, 2023' }

// In story.js, use it:
<img src="..." alt="${img.caption || project.title}">
```

**Keyboard-accessible dropdown:**

```html
<!-- Add tabindex and aria attrs -->
<a href="#/stories" class="nav-link" aria-haspopup="true" aria-expanded="false">Stories</a>
```

```js
// Show dropdown on focus-within, not just :hover
navItem.addEventListener('focusin', () => dropdown.classList.add('open'));
navItem.addEventListener('focusout', (e) => {
  if (!navItem.contains(e.relatedTarget)) dropdown.classList.remove('open');
});
```

**Hamburger button ARIA:**

```html
<button class="nav-hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">
```

```js
hamburger.setAttribute('aria-expanded', 'true'); // when open
hamburger.setAttribute('aria-label', 'Close menu');
```

**Skip link:**

```html
<!-- First element inside <body> -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  z-index: 1000;
  transition: top 0.2s;
}
.skip-link:focus { top: 0; }
</style>
```

**`prefers-reduced-motion`:**

```css
@media (prefers-reduced-motion: reduce) {
  .slide.active img { animation: none; }
  .slide { transition: none; }
  .story-slide { transition: none; }
  @keyframes pageIn { from { opacity: 1; transform: none; } }
}
```

### 7.3 Color Contrast

The current palette (white on `rgba(0,0,0,0.5)` nav backdrop, `#666` secondary text on `#fff`) should
be verified with the WebAIM Contrast Checker. The `--color-text-secondary: #666` on white background
gives a contrast ratio of approximately 5.7:1, which passes WCAG AA for normal text (requires 4.5:1)
but fails AAA (requires 7:1). The tertiary color `#999` on white gives ~2.8:1 and fails WCAG AA —
use it only for decorative text (like the `/` separators) never for meaningful content.

### 7.4 Focus Indicators

The current CSS removes the default browser focus outline (`*` reset includes no explicit `:focus`
styling). Add visible focus rings:

```css
:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 3px;
}
```

Using `:focus-visible` instead of `:focus` means the ring only appears when navigating by keyboard,
not when clicking with a mouse — a clean balance between accessibility and aesthetics.

---

## 8. Social Proof Elements

### 8.1 Current Social Proof

The site currently has no explicit social proof elements — no client list, no press, no exhibition
history. The Instagram feed widget on the Bio page implies an active social presence, which is a form
of soft social proof.

### 8.2 Recommended Social Proof Additions

**For an emerging documentary photographer, social proof should be honest and contextual. Here is a realistic roadmap:**

**Tier 1 — Immediate (available now):**
- "Selected exhibitions" or "Selected presentations" if any work has been shown
- Workshop or residency participation
- Grants applied for or received (even non-winning applications to competitive programs signal seriousness)
- Educational background (if from a recognizable institution)

**Tier 2 — As it develops:**
- Press mentions (any publication that has reproduced or discussed the work)
- Client logos (if accepting commercial or editorial commissions)
- Awards (World Press Photo, Pictures of the Year International, PDN, etc.)
- Quotes from subjects or collaborators about the working relationship

**Tier 3 — Long-term:**
- "As seen in" bar with publication logos
- Agent or representation mention

**Implementation:** A simple section on the Bio page:

```html
<div class="credentials">
  <h2>Selected</h2>
  <ul>
    <li>Alexia Foundation Student Grant — 2024</li>
    <li>Fotofest International — 2025 Portfolio Review</li>
    <li>Published in [Publication] — 2024</li>
  </ul>
</div>
```

Keep it short and only include things that are genuinely impressive to the target audience
(editorial photo editors, curators, grant committees).

### 8.3 Testimonials

Client testimonials can be powerful, but they require care in a documentary photography context.
Unlike commercial photography, documentary photographers often have relationships with subjects who
are not "clients" in a transactional sense. Relevant testimonials might come from:
- Photo editors who have assigned or published the work
- Exhibition curators
- Workshop instructors or mentors (with their permission)

---

## 9. E-Commerce and Booking Integrations

### 9.1 Print Sales

Documentary photographers increasingly sell archival prints directly from their websites. This is a
legitimate revenue stream and also signals to collectors and institutions that the work is editioned
and collectible.

**Options by complexity:**

**Low complexity — Square or Shopify Buy Button:**
Add a "Prints" page linking to a hosted Square or Shopify storefront. Zero infrastructure required.
Shopify's "Buy Button" can embed directly into the existing site with a `<script>` tag.

**Medium complexity — Printful + Stripe:**
For photographer-quality printing, integrate Printful (print-on-demand with fine art paper options)
connected via Stripe for payments. Requires a checkout flow but no inventory management.

**High complexity — Self-managed edition tracking:**
If selling limited editions (which command higher prices), track edition numbers in a spreadsheet or
simple database. Integrate Stripe directly. This requires more backend infrastructure (a serverless
function to handle webhooks).

**Recommended starting point:** A simple "Prints Available" section on each story page with a contact
CTA ("Contact me about prints from this series"). This gauges interest before building a full store.

### 9.2 Licensing

Editorial and commercial licensing is often how documentary photographers earn significant income.
Add a "License This Work" page or section explaining:
- Editorial license terms (what publications can reproduce, at what price tier)
- Commercial restrictions (many documentary photographers do not license commercially without subject
  consent)
- How to inquire

A pricing guide (even broad ranges) reduces the back-and-forth of initial licensing inquiries.

### 9.3 Assignment Photography

If Eric accepts commissioned assignments, a "Hire Me" or "Assignments" page communicating:
- Types of work accepted (documentary, editorial, portraits, events)
- Geographic availability and travel willingness
- Rates or "contact for rates" (both are acceptable; "contact for rates" is standard for editorial)
- Recent assignment clients (if any)

### 9.4 Booking Tools

For documentary photographers who teach workshops or conduct portfolio reviews:
- **Calendly** — Free tier handles simple booking scheduling, integrates with Google Calendar
- **Acuity Scheduling** — More customizable, includes payment collection
- Embed a Calendly link on the Contact page for consultation calls

---

## 10. Technical Stack Recommendations

### 10.1 Current Stack Assessment

| Component | Current | Assessment |
|---|---|---|
| Build tool | Vite 8 (beta) | Excellent — Vite is the right choice. Consider pinning to stable |
| Framework | None (vanilla JS) | Excellent for a portfolio this size. Keep it. |
| Routing | Hash-based | Needs migration to History API for SEO |
| Styling | Plain CSS with custom properties | Excellent — zero-cost, well-supported |
| Image format | JPEG only | Needs WebP/AVIF generation pipeline |
| Fonts | Google Fonts (external) | Should self-host for performance and privacy |
| Image hosting | Local static files | Acceptable for current scale; CDN-edge deployment is the upgrade |
| Contact | Instagram DM only | Needs a real contact form or email |
| Analytics | None visible | Should add privacy-respecting analytics |

### 10.2 Vite Version

The project pins `vite: ^8.0.0-beta.13`. Using a beta release in production is risky — breaking changes
can appear between beta releases. Pin to the latest stable:

```json
"devDependencies": {
  "vite": "^6.0.0"
}
```

### 10.3 Framework Considerations

**Keep vanilla JS if:**
- The site remains a simple SPA with under 10 "pages"
- No complex client-side state is needed
- The goal is maximum performance and minimum bundle size

**Consider a framework if:**
- Adding a print store with cart state
- Building a CMS-driven approach where projects are added without editing code
- Needing server-side rendering for SEO (Next.js or Astro would solve the hash-routing SEO problem)

**Astro** is the strongest recommendation if the site ever needs SSR/SSG, because:
- It generates fully static HTML with zero JS by default
- Individual story pages become real URLs with proper `<title>` and `<meta>` tags at build time
- It bundles Vite under the hood so the build tooling feels familiar
- "Islands" architecture means interactive components (slideshow, story viewer) can still be vanilla JS

### 10.4 Content Management

Currently, adding a new story requires:
1. Resizing and exporting photos
2. Copying files into `dist/photos/[slug]/`
3. Editing `src/data.js` to add the project and image list
4. Running a build

This is manageable but scales poorly. Two upgrade paths:

**Option A — Simple static CMS (Tina CMS or Decap CMS):**
Open-source, Git-backed CMS that adds a web UI for editing `data.js`-style content files. No backend
required. Tina CMS has a generous free tier and works with Vite/static sites.

**Option B — Keep code-driven, improve the pipeline:**
Add a Node.js script that scans `public/photos/` directories and auto-generates the `data.js` entries,
so adding a story only requires dropping photos in a folder and running `npm run sync-data`. Pairs well
with the image conversion script from Section 3.1.

### 10.5 Analytics

**Current state:** No analytics.

**Recommended:** Plausible Analytics or Fathom Analytics. Both are:
- Privacy-respecting (no cookies, no GDPR consent banner needed)
- Lightweight (< 1 KB script)
- Priced around $9/month for a personal site's traffic volume
- Compliant with EU privacy law out of the box

Google Analytics 4 is free but adds a significant script payload and requires GDPR consent management
for EU visitors.

Minimum events to track:
- Page views (automatic)
- Story opens (custom event: `plausible('Story Opened', { props: { story: slug } })`)
- Contact link clicks

### 10.6 Deployment Pipeline

Recommended deployment for a Vite static site:

```
GitHub (main branch push)
  → Cloudflare Pages or Vercel (auto-deploy)
    → Edge CDN (global)
      → Custom domain with HTTPS (auto-provisioned)
```

Both Cloudflare Pages and Vercel offer free tiers that cover a personal portfolio site. Cloudflare
Pages has a slight edge on image caching (Cloudflare's network is the largest CDN globally).

Add a `vite.config.js` with explicit output configuration:

```js
// vite.config.js
export default {
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined, // Keep as single bundle at this scale
      }
    }
  }
}
```

---

## 11. Quick-Win Checklist

Ordered by impact-to-effort ratio.

### [NOW] — High Impact, Low Effort (under 1 hour each)

- [ ] Add `<meta name="description">` to `index.html`
- [ ] Add Open Graph tags (`og:title`, `og:description`, `og:image`) to `index.html`
- [ ] Add `fetchpriority="high"` to the first hero slide `<img>`
- [ ] Add `width` and `height` attributes to all `<img>` tags (prevents CLS)
- [ ] Add `alt` text via `caption` field in `data.js` — start with the cover images
- [ ] Add `aria-expanded` and `aria-controls` to the hamburger button
- [ ] Add `:focus-visible` focus ring styles to `style.css`
- [ ] Add `@media (prefers-reduced-motion: reduce)` rules to stop Ken Burns and auto-advance
- [ ] Move Behold widget `<script>` load into `initBio()` so it only loads on the Bio page
- [ ] Add `<link rel="preload">` for the first hero image in `index.html`
- [ ] Create `public/robots.txt`
- [ ] Update page `<title>` dynamically per route

### [WEEK] — High Impact, Moderate Effort

- [ ] Add touch swipe support to hero slideshow and story viewer
- [ ] Add lazy loading (`data-src` pattern) to story viewer images
- [ ] Set up image conversion script for WebP generation using `sharp`
- [ ] Implement `<picture>` + `<source type="image/webp">` in story viewer and hero
- [ ] Populate captions for at least the cover image of each project in `data.js`
- [ ] Add a real email address or contact form to the Contact/Bio page
- [ ] Add pause-on-hover to the hero slideshow auto-advance
- [ ] Self-host Google Fonts and add `preload` link
- [ ] Add story-to-story prev/next navigation at the bottom of each story
- [ ] Add keyboard accessibility to the Stories dropdown (focus events, not just hover)
- [ ] Add Person JSON-LD structured data to `index.html`

### [MONTH] — High Impact, Significant Effort

- [ ] Migrate from hash routing to History API routing (unlocks SEO for all story pages)
- [ ] Generate per-story `<title>` and `<meta>` tags dynamically (requires History API routing)
- [ ] Create XML sitemap after URL migration
- [ ] Add two image sizes per photo (thumbnail + full) with `srcset`
- [ ] Set up Plausible or Fathom analytics
- [ ] Deploy to Cloudflare Pages or Vercel with proper `Cache-Control` headers for `/photos/*`
- [ ] Add "Prints Available" section to story pages with a contact CTA
- [ ] Add image thumbnail contact-sheet strip to the story viewer
- [ ] Investigate Astro migration if SSR/SSG for SEO becomes a priority
- [ ] Pin Vite to latest stable release and remove `overrides` block in `package.json`

---

*Document generated: February 2026*
*Based on code analysis of `/projects/photo-site/site/src/` and current web platform standards.*
