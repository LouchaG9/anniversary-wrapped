# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Anniversary Wrapped** — a Spotify Wrapped-style interactive anniversary gift delivered as a set of three co-located files (`index.html`, `styles.css`, `script.js`). No build step, no package manager, no dev server. Open `index.html` directly in a browser. All three files must stay in the same directory for the HTML's relative links to resolve.

> **Note:** The project started as a single self-contained HTML file. CSS and JS were later separated into `styles.css` and `script.js` (linked via `<link>` and `<script src="...">`). If the gift needs to be a truly self-contained single file for distribution, inline `styles.css` inside a `<style>` tag and `script.js` inside a `<script>` tag in the HTML before delivery.

---

## File Structure

| File | Purpose |
|---|---|
| `index.html` | All 24 slide HTML (558 lines). Links to `styles.css` and `script.js`. |
| `styles.css` | CSS variables, component styles, animations, responsive breakpoints. |
| `script.js` | JS globals, `goToSlide`, interactive mechanics (sliders, pick cards), confetti, counter. |
| `PRD.txt` | Product requirements document — full slide deck spec and open items list. |

---

## Slide Inventory

24 slides (index 0–23), each `<div class="slide [bg-class]" data-index="N">`.

| Index | Title | Background | Type |
|---|---|---|---|
| 0 | Title | `bg-cream` | Static — hero photo, "11 Years of Us" |
| 1 | Section: Quality Time | `bg-blush` | Section header |
| 2 | NYT Games | `bg-dark` | Static — Wordle 103 days, Spelling Bee, Crossword |
| 3 | Hikes | `bg-dark` | **Pick card** — Opera Hut / Ocean & Sea / Zermatt |
| 4 | Bouldering | `bg-rose` | Static — `[ # ]` sessions, Blue grade |
| 5 | Op Shop Finds | `bg-dark` | **Pick card** — Dining Table / TCM Poster Frame |
| 6 | Quasos | `bg-gold` | **Slider** — guess 0–200, reveals `ACTUAL_QUASOS` |
| 7 | Dog Walks | `bg-blush` | **Slider** — guess 0–800, reveals `ACTUAL_WALKS` |
| 8 | Dog Parents | `bg-cream` | Static — `[ # ]` days, dog photo |
| 9 | Section: Challenges | `bg-dark` | Section header |
| 10 | Uni / Study | `bg-dark` | Static — humorous |
| 11 | Car Troubles | `bg-dark` | Static — Mazda vs Subaru, `[ # ]` Subaru servicing cost |
| 12 | 75 Hard | `bg-rose` | Dynamic — `buildHardGrid()` generates 75 checkmark cells |
| 13 | Veganism | `bg-cream` | Static — milestone |
| 14 | Section: Travel | `bg-blush` | Section header — "8 countries. Counting." |
| 15 | Countries Grid | `bg-dark` | Static — 8 country cards (IT, CH, AT, DE, SI, IE, FR, JP) |
| 16 | New Zealand Teaser | `bg-gold` | Static — "Coming Soon, Country #9" |
| 17 | Section: Highlights | `bg-dark` | Section header |
| 18 | Showed Up 365 | `bg-cream` | Static — large "365" centred |
| 19 | Turning 31 | `bg-blush` | Static — 2 birthday photos side by side |
| 20 | Word of the Year | `bg-dark` | Static — `[ word ]` reveal |
| 21 | Engagement Build-up | `bg-engagement` | Static — teaser |
| 22 | Engagement Reveal | `bg-engagement` | Dynamic — `triggerConfetti()` on entry |
| 23 | Final Slide | `bg-engagement` | Dynamic — `updateDaysCounter()` on entry, "Year 12 →" button |

---

## CSS

### Variables (`:root`)

```css
--cream:       #F5EFE6   /* off-white, light background */
--blush:       #E8C9B8   /* warm pink-beige */
--rose:        #C97B63   /* salmon-rose accent */
--warm-gold:   #C9A96E   /* gold highlight */
--deep:        #2C1F14   /* dark brown, primary dark bg/text */
--soft-brown:  #8B6355   /* muted brown, secondary */
--text-light:  #F5EFE6
--text-dark:   #2C1F14
```

**Rule:** Never introduce colours outside this palette. Use the CSS variables, not hex literals.

### Background Classes → Slides

| Class | Style | Used on slides |
|---|---|---|
| `.bg-cream` | Solid cream | 0, 8, 13, 18 |
| `.bg-blush` | Gradient 160° (light→medium blush) | 1, 7, 14, 19 |
| `.bg-dark` | Gradient 160° (deep→soft-brown) | 2, 3, 5, 9, 10, 11, 15, 17, 20 |
| `.bg-rose` | Gradient 160° (rose→dark) | 4, 12 |
| `.bg-gold` | Gradient 160° (warm-gold→muted) | 6, 16 |
| `.bg-engagement` | Gradient 160° (very dark) | 21, 22, 23 |

### Animation System

**Slide transitions** (opacity + translateY):
- Enter (`.slide.active`): `translateY(30px→0)`, `opacity 0→1`, 0.6s ease
- Exit (`.slide.exit`): `translateY(0→-30px)`, `opacity 1→0`, 0.6s ease

**Child stagger** — add `.anim-N` to elements in order (1–5); they animate with `fadeUp` on slide activation:

| Class | Delay |
|---|---|
| `.anim-1` | 0.10s |
| `.anim-2` | 0.25s |
| `.anim-3` | 0.40s |
| `.anim-4` | 0.55s |
| `.anim-5` | 0.70s |

**Confetti:** `.confetti-piece` elements use `confettiFall` keyframe (fall 100vh + rotate 720°, 2–4s, self-remove after 4s).

### Typography Classes

| Class | Font | Size | Weight |
|---|---|---|---|
| `.display` | Cormorant Garamond | 52px | 300 |
| `.display-sm` | Cormorant Garamond | 38px | 300 |
| `.stat-number` | Cormorant Garamond | 88px | 300 |
| `.stat-label` | DM Sans | 13px | 400, uppercase |
| `.body` | DM Sans | 15px | 300 |
| `.section-label` | DM Sans | 10px | 400, uppercase |
| `.italic` | Cormorant Garamond italic | 22px | 300 |
| `.word-reveal` | Cormorant Garamond italic | 72px | 300 |
| `.live-counter` | Cormorant Garamond | 72px | 300 (gold) |

Color utilities: `.text-cream`, `.text-dark`, `.text-gold`, `.text-rose`.

### Photo Slots

Replace `<div class="photo-slot [photo-hero|photo-sm|photo-xs]">` with `<img>` when adding photos:

| Size class | Height |
|---|---|
| `.photo-hero` | 240px |
| `.photo-sm` | 140px |
| `.photo-xs` | 100px |

### Responsive Breakpoint

`@media (max-height: 700px)` — reduces font sizes and photo heights for small screens. Only one breakpoint; all other sizing is relative or fixed.

### Slide Layout

Slides use `position: absolute; padding: 40px 28px 80px` (80px bottom reserves space for the nav bar). All content must fit in the viewport — no overflow/scroll.

---

## JavaScript (`script.js`)

### Global State & Constants

```javascript
const TOTAL_SLIDES = 24;
const ACTUAL_WALKS = 0;        // ← fill in before gifting
const ACTUAL_QUASOS = 0;       // ← fill in before gifting
const ENGAGEMENT_DATE = new Date('2025-09-15');
let current = 0;               // current slide index
```

### Navigation

**`goToSlide(index)`** — central navigation function:
1. Bounds-checks `index` (0 ≤ index < 24)
2. Removes `.active` from current slide, adds `.exit` (cleaned up after 600ms)
3. Adds `.active` to target slide, updates `current`
4. Updates progress dots (`.active` class on `#dot-N`)
5. Checks `lightSlides` array to apply/remove `.dark` class on nav buttons
6. Shows/hides `#prev-btn` and `#next-btn` at bounds
7. Fires side effects for special slides:
   - Slide 12: `buildHardGrid()` (once)
   - Slide 22: `triggerConfetti()`
   - Slide 23: `updateDaysCounter()`

**`lightSlides` array** (inside `goToSlide`):
```javascript
const lightSlides = [0, 6, 8, 13, 14, 19];
```
These slides have light backgrounds and need dark-coloured nav button text. **Update this array if adding slides with `bg-cream`, `bg-blush`, or `bg-gold` backgrounds.**

**Navigation inputs:**
- Tap/click on `#app` (excluding interactive elements) → `nextSlide()`
- `←` / `→` arrow keys and `Space` → `goToSlide(current ± 1)`
- `#prev-btn` / `#next-btn` buttons

### Interactive: Pick Cards

**`selectCard(groupId, card)`** — called via `onclick="selectCard('groupId', this)"`:
- Finds all `.pick-card` inside `#groupId`
- Removes `.selected` / `.not-selected` from all
- Sets all to `.not-selected`, then sets clicked card to `.selected`
- The `.check-mark` child becomes visible via CSS on `.selected`

**HTML pattern:**
```html
<div class="pick-grid" id="[groupId]">
  <div class="pick-card" onclick="selectCard('[groupId]', this)">
    <div class="pick-card-photo">...</div>
    <div class="pick-card-inner">
      <div class="pick-emoji">🏔️</div>
      <div>
        <div class="pick-card-label">Label</div>
        <div class="pick-card-sub">Subtitle</div>
      </div>
    </div>
    <div class="check-mark">✓</div>
  </div>
</div>
```

### Interactive: Sliders

**`createSlider(config)`** — factory; returns `{ reveal() }`. Called once per slider at init.

Config object:
```javascript
{
  max:            800,          // max value
  actual:         ACTUAL_WALKS, // answer (0 = not yet filled in)
  nearThreshold:  80,           // diff within which "near" message fires
  closeMsg:       "...",        // shown when diff ≤ 5
  nearMsg:        "...",        // shown when diff ≤ nearThreshold
  fillColor:      "...",        // optional CSS color for fill bar
  // DOM IDs:
  trackId, thumbId, fillId, displayId,
  revealBtnId, revealResultId, revealMessageId
}
```

Slider instances:
- `walksSlider` (slide 7) — max 800, threshold 80
- `quasoSlider` (slide 6) — max 200, threshold 10, `fillColor: var(--deep)`

Wrapper functions `revealWalks()` and `revealQuasos()` delegate to the respective slider's `.reveal()`.

### Special Mechanics

**`buildHardGrid()`** — runs once on slide 12 entry; generates 75 `.check-cell.done` divs in `#hard-grid`.

**`triggerConfetti()`** — runs on slide 22 entry; creates 40 `.confetti-piece` elements with random position, rotation, and duration (2–4s); each self-removes after 4s. Colors: `['#C9A96E', '#E8C9B8', '#C97B63', '#F5EFE6', '#fff']`.

**`updateDaysCounter()`** — runs on slide 23 entry; calculates `Math.floor((now - ENGAGEMENT_DATE) / 86400000)` and writes to `#days-counter`. Shows `—` if result < 0.

### Progress Dots

Built dynamically at script init: 24 `.dot` divs appended to `#progress-dots`, each with `id="dot-N"`. The active dot is wider (18px), less rounded (3px border-radius); inactive dots are small (5px), circular, 30% opacity.

---

## Placeholders — Complete List

All items below must be filled before gifting.

### In `script.js`

| Constant | Default | Replace with |
|---|---|---|
| `ACTUAL_WALKS` | `0` | Total dog walks this year |
| `ACTUAL_QUASOS` | `0` | Total quasos eaten this year |

### In `anniversary-wrapped.html`

| Slide | Pattern | Replace with |
|---|---|---|
| 0 | `[ your opening line ]` in title | One-sentence opening |
| 4 | `[ # ]` sessions | Bouldering sessions count |
| 8 | `[ # ]` days | Days as dog parents |
| 11 | `$[ # ]` | Subaru servicing cost |
| 12 | `[ Start date ] → [ End date ]` | 75 Hard start and end dates |
| 20 | `[ word ]` | Word of the year |
| 23 | `[ your closing message here ]` | Closing message |

### Photo Slots (replace `<div class="photo-slot">` with `<img>`)

| Slide | Label | Photo needed |
|---|---|---|
| 0 | `[ hero photo ]` | Couple hero photo |
| 8 | `[ dog photo ]` | Dog photo |
| 19 | `[ your birthday photo ]` / `[ her birthday photo ]` | Two birthday photos |
| 22 | Three engagement photo slots | Engagement photos (×3) |

---

## Design Constraints

- **No scroll** — all content must fit the viewport on each slide. `overflow: hidden` is the law.
- **Palette only** — use CSS variables; no hex literals or colours outside the warm cream/blush/rose/gold/deep family.
- **Google Fonts only** — Cormorant Garamond (serif, display/italic) and DM Sans (sans, body/labels). No other fonts.
- **Stagger animations** — assign `.anim-1` through `.anim-5` to slide children in visual order. Animations fire on `.slide.active`, so they replay on every visit.
- **Light slides** — update the `lightSlides` array in `goToSlide()` whenever adding a slide with `bg-cream`, `bg-blush`, or `bg-gold` background.
- **Mobile-first** — default to a single-column layout; use a 2-column grid sparingly (photos, country cards).
