# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Anniversary Wrapped** — a Spotify Wrapped-style interactive anniversary gift delivered as a single self-contained HTML file (`anniversary-wrapped.html`). No build step, no dependencies, no server required. Open in a browser.

## Development

Open `anniversary-wrapped.html` directly in a browser. There is no build process, package manager, or dev server. All CSS, JS, and HTML live in one file.

## Architecture

Everything lives in `anniversary-wrapped.html`:

- **CSS** (`:root` CSS variables → component styles → slide-specific styles) — warm palette: `--cream`, `--blush`, `--rose`, `--warm-gold`, `--deep`, `--soft-brown`
- **Slide HTML** — 24 slides (index 0–23), each a `<div class="slide" data-index="N">`. Slides are positioned `absolute`, with opacity/transform transitions driving the enter/exit animations. The `active` class shows a slide; `exit` triggers the out-animation.
- **JavaScript** — inline, no framework. Key globals:
  - `ACTUAL_WALKS`, `ACTUAL_QUASOS`, and `ENGAGEMENT_DATE` — fill-in constants at the top of `script.js`
  - `goToSlide(index)` — central navigation function; handles dot updates, button styling, and side-effects for special slides (confetti on 22, counter on 23, 75 Hard grid on 12)
  - `selectCard(groupId, card)` — drives the pick-card interactive mechanic (hikes slide 3, op shop slide 5)
  - `createSlider(config)` — factory function; powers the guess-slider mechanic on slide 6 (quasos) and slide 7 (dog walks)
  - `triggerConfetti()` — appends short-lived DOM elements animated with `confettiFall` keyframes
  - `updateDaysCounter()` — live count of days since `ENGAGEMENT_DATE`

## Open Items / Placeholders

All `[ # ]` and `[ word ]` placeholders in the HTML need real values before gifting. See `PRD.txt` for the full list of open items (bouldering sessions, dog walk count, dog parent days, car servicing cost, 75 Hard dates, quaso count, word of the year, opening line, closing message, and all photos).

Photo slots are `<div class="photo-slot">` with a `.photo-label` placeholder — replace the `<div>` with an `<img>` tag pointing to the photo file.

## Design Constraints

- **Mobile-first, full-screen** — do not introduce scroll. All content must fit within the viewport for each slide.
- **Palette** — stick to the CSS variables; avoid introducing new colours outside the warm cream/blush/rose/gold/deep family.
- **Fonts** — Cormorant Garamond (serif, display/italic) and DM Sans (sans, body/labels) loaded from Google Fonts. No other fonts.
- **Animation classes** — `.anim-1` through `.anim-5` apply staggered `fadeUp` animations on the active slide's children; add new elements in order.
- **Light slides** — slides with light backgrounds (indices `0, 6, 8, 13, 14, 19`) need dark-coloured nav button text; the `lightSlides` array in `goToSlide` controls this — update it if adding new light-background slides.
