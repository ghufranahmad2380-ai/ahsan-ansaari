# Ahsan Liaqat — Portfolio

A single-page, cinematic portfolio site for **Ahsan Liaqat**, doctor based in Faisalabad, Pakistan.
No build step, no framework, no dependencies — plain HTML, CSS and JavaScript that runs from a
static host or straight off the file system.

Live sections: **Hero → About → Professional Journey → Philosophy → Scratch (interactive reveal) →
Gallery → Contact**.

---

## Structure

```
index.html                  single page, all sections
assets/
  css/styles.css            design tokens + all layout/components (~47 KB)
  js/main.js                curtain, hero sequence, reveals, scratch, lightbox, nav, contact
  favicon.svg
  img/
    hero/                   hero slides (portrait crops, 1000 × 1778)
    thumb/                  gallery thumbnails (560 px wide, lazy-loaded)
    full/                   lightbox originals (matching file names)
photos/                     unedited source photographs
```

## Local preview

Open `index.html` directly, or serve the folder so relative paths behave exactly as in production:

```bash
npx serve .
# or
python -m http.server 8000
```

## Editing content

| What | Where |
|---|---|
| **Email / phone** | `assets/js/main.js` → `CONTACT = { email, phone, note }`. Fill a value and the card swaps "To be published" for a live `mailto:` / `tel:` link *and* the **Reach out** button starts a mail draft. Leave it empty and the button shows an honest "still being confirmed" toast. |
| Journey entries | `index.html` → `#journey` timeline items (`PLACEHOLDER` eyebrow, title, body). Nothing is invented; replace with verified institutions, roles and years. |
| Gallery | `index.html` → `#gallery`; each tile is `<button class="gallery__item is-square|is-tall" data-full="…" data-caption="…">` wrapping a `thumb/` image. Add the matching `full/` file for the lightbox. |
| Hero slides | `index.html` → `.hero__media`; `hero-01` is preloaded and active, the rest lazy-load and rotate. |
| Hero video (optional) | Drop `hero.mp4` into `assets/video/` and add `data-video="assets/video/hero.mp4"` to `.hero` — the video layer fades in above the photo sequence once it can play. |
| Metadata | `index.html` `<head>` — title, description, canonical, Open Graph / Twitter, JSON-LD `Person`. Update the domain (`https://ahsanliaqat.com/`) if it changes. |

## Design system

- **Palette** — forest `#1E3B2F`, deep ink `#0B1A15`, sage, gold `#C8B48A`, cream `#F5F0E6`.
- **Type** — Cormorant Garamond (display) + Jost (UI), loaded from Google Fonts.
- **Motion** — one easing family; every reveal is `IntersectionObserver` driven, and everything
  collapses gracefully under `prefers-reduced-motion: reduce`.

## Features

- Curtain intro that lifts on load.
- Crossfading hero with slow Ken Burns drift, framed so the face is never cropped.
- Scroll-reveal with clip/translate/fade variants and staggered delays.
- Interactive **scratch** panel — canvas `destination-out` brushing, live cleared-% meter,
  auto-reveal at 55 %, reset control, touch- and keyboard-friendly.
- Masonry gallery with a full lightbox: Esc / arrow keys / swipe, focus trap, focus returned to
  the originating tile on close.
- Scroll-spy navigation, sticky header, mobile menu with scroll lock.
- Honest content policy: unverified contact and career details render as placeholders, never as
  invented facts.

## Accessibility

Semantic landmarks, one `<h1>`, labelled controls, visible focus states, `aria-expanded` on the
menu, `aria-hidden` decorative imagery, descriptive `alt` text on gallery photographs, WCAG AA
contrast across all text (lowest pair 4.71:1) and no horizontal overflow from 390 px to 1440 px+.

## Deploy

Any static host works. For GitHub Pages: **Settings → Pages → Source: Deploy from a branch →
`main` / `root`**. The `canonical` and JSON-LD URLs assume `https://ahsanliaqat.com/` — point the
domain there or edit them.
