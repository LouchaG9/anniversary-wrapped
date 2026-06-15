# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Anniversary Wrapped** — a Spotify Wrapped-style interactive anniversary gift delivered as a set of co-located files (`index.html`, `styles.css`, `script.js`, plus `images/` and `audio/`). No build step, no package manager, no dev server. Open `index.html` directly in a browser. All files must stay in the same directory for the HTML's relative links (CSS, JS, images, audio) to resolve.

> **Note:** The project started as a single self-contained HTML file. CSS and JS were later separated into `styles.css` and `script.js` (linked via `<link>` and `<script src="...">`). If the gift needs to be a truly self-contained single file for distribution, inline `styles.css` inside a `<style>` tag and `script.js` inside a `<script>` tag — but note that local `images/` and `audio/` assets still need to ship alongside it.

---

## File Structure

| File | Purpose |
|---|---|
| `index.html` | All 26 slide HTML (slides 0–25). Links to `styles.css` and `script.js`; loads Lucide icons from a CDN. |
| `styles.css` | CSS variables, component styles, animations, responsive breakpoints. |
| `script.js` | JS globals, `goToSlide`, interactive mechanics (sliders, pick cards, country flip, gratitude stack), audio player, confetti, count-ups, Lucide init. |
| `images/` | All photos and country thumbnails (`images/countries/*.jpg`). |
| `audio/` | Three background music tracks, swapped per section. |
| `PRD.txt` | Product requirements document — original slide deck spec and open-items list (now largely complete; historical reference). |

---

## Slide Inventory

26 slides (`data-index` 0–25), each `<div class="slide [bg-class]" data-index="N">`. Several slides use a full-bleed background photo (with `.hero-overlay`) rather than a `bg-*` class.

| Index | Title | Background | Type / Mechanic |
|---|---|---|---|
| 0 | Title | `images/hero.jpg` (deep fallback) | Static — "The 11th year of us", `begin-btn` → slide 1 |
| 1 | Section: Quality Time | `bg-cream` | Section header (number 1) |
| 2 | NYT Games | `images/nyt-games.jpg` | Static — Connections/Wordle streaks, favourite game, crossword |
| 3 | Hike Stats | `images/hiking.jpg` | Count-up — `animateHikingStats()` (hikes 15, countries 4), 138.03 km |
| 4 | Hikes | `bg-cream` | **Pick card** — Schäfler / Oeschinensee / Olpererhutte |
| 5 | Bouldering | `bg-cream` | Count-up — `animateBoulderingStat()` (57 sessions), hardest grade Blue |
| 6 | Op Shop Finds | `bg-cream` | **Pick card** — Dining Table / TCM Poster Frame / Markers / Monopoly |
| 7 | Quasos | `bg-cream` | **Slider** — guess 0–200, reveals `ACTUAL_QUASOS` |
| 8 | Dog (Apollo) | `images/Apollo.jpg` | Count-up — `animateApolloStats()` (walks `ACTUAL_WALKS`, 365 days) |
| 9 | Section: Challenges | `bg-dark` | Section header (number 2) |
| 10 | Uni / Study | `bg-dark` | Typewriter — `initUniTypewriter()` reveals "Too f***ing many." |
| 11 | Car Troubles | `bg-dark` | **Verdict slider** — Mazda vs Subaru, `revealVerdict()` |
| 12 | 75 Hard | `bg-dark` | Static — "75 Hard. Done.", rules pills, dates 2 Feb → 18 Apr 2026 |
| 13 | Veganism | `bg-dark` | Static — milestone |
| 14 | Injury Report | `bg-dark` | Static — humorous |
| 15 | Section: Travel | `bg-gold` | Section header (number 3) |
| 16 | Countries Grid | `bg-gold` | **Flip cards** — 8 countries (IT, CH, AT, DE, SI, IE, FR, JP), `flipCountry()` |
| 17 | New Zealand Teaser | `bg-gold` | Countdown — `updateNZCounter()` to `NZ_DATE` |
| 18 | Section: Highlights | `bg-blush` | Section header (number 4) |
| 19 | Gratitude | `bg-blush` | **Drag stack** — `initGratitudeStack()`, swipe post-its away to reveal `#gratitude-phrase` |
| 20 | Showed Up 365 | `bg-blush` | Count-up — `animateShowedUp()` (365 days in a row) |
| 21 | Turning 31 | `bg-blush` | Static — text only |
| 22 | Phrase of the Year | `bg-blush` | Reveal — `initPhraseReveal()` types out a phrase |
| 23 | Engagement Build-up | `bg-engagement` | Static — teaser |
| 24 | Engagement Reveal | `bg-engagement` | Dynamic — `triggerConfetti()` on entry, 3 photos |
| 25 | Final Slide | `bg-engagement` | Dynamic — `updateDaysCounter()` on entry, closing message |

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

**Rule:** Never introduce colours outside this palette. Use the CSS variables, not hex literals. (The `bg-*` gradients below are the one exception — they hardcode lightened/darkened stops of the palette colours.)

### Background Classes → Slides

| Class | Style | Used on slides |
|---|---|---|
| `.bg-cream` | Solid cream | 1, 4, 5, 6, 7 |
| `.bg-blush` | Gradient 160° (blush → deeper blush) | 18, 19, 20, 21, 22 |
| `.bg-dark` | Gradient 160° (deep → warm brown) | 9, 10, 11, 12, 13, 14 |
| `.bg-gold` | Gradient 160° (warm-gold → darker gold) | 15, 16, 17 |
| `.bg-rose` | Gradient 160° (rose → darker rose) | (defined; not currently used) |
| `.bg-deep-rose` | Gradient 160° (deep rust red) | (defined; not currently used) |
| `.bg-engagement` | Gradient 160° (very dark) | 23, 24, 25 |
| _photo background_ | Inline `background-image` + `.hero-overlay` | 0, 2, 3, 8 |

### Animation System

**Slide transitions** (horizontal slide, direction-aware) — set in `goToSlide()`:
- Incoming slide snaps to `translateX(±60px)` then animates to `0` with `.active`.
- Outgoing slide gets `.exit-left` (forward) or `.exit-right` (back), cleaned up after 650ms.

**Child stagger** — add `.anim-N` to elements in order (1–5); they animate with `fadeUp` on slide activation:

| Class | Delay |
|---|---|
| `.anim-1` | 0.10s |
| `.anim-2` | 0.25s |
| `.anim-3` | 0.40s |
| `.anim-4` | 0.55s |
| `.anim-5` | 0.70s |

**Confetti:** `.confetti-piece` elements use `confettiFall` keyframe (fall + rotate, 2–4s, self-remove after 4s). Colours: `['#C9A96E', '#E8C9B8', '#C97B63', '#F5EFE6', '#fff']`.

### Icons

Lucide icons are written as `<i data-lucide="name">` and converted to inline SVG on load by `lucideInit()` in `script.js` (each SVG inherits the `<i>`'s inline `style`). Loaded via the unpkg CDN `<script>` in the `<head>`. Use kebab-case Lucide names.

### Typography Classes

| Class | Font | Notes |
|---|---|---|
| `.display` / `.display-sm` | Cormorant Garamond | Headlines (per-slide font-size overrides are common inline) |
| `.stat-number` | Cormorant Garamond | Large numerals |
| `.stat-label` | DM Sans | Small uppercase label |
| `.body` | DM Sans | Body copy |
| `.section-label` | DM Sans | Tiny uppercase eyebrow |
| `.italic` | Cormorant Garamond italic | Pull quotes |
| `.word-reveal` | Cormorant Garamond italic | Phrase-of-the-year reveal |
| `.live-counter` | Cormorant Garamond | Days-since counter (gold) |
| `.section-div-title` / `.section-div-number` | Cormorant Garamond | Section header title + big background numeral |

Color utilities: `.text-cream`, `.text-dark`, `.text-gold`, `.text-rose`.

### Responsive Breakpoint

`@media (max-height: 700px)` — reduces font sizes and photo heights for small screens.

### Slide Layout

Slides use `position: absolute` with bottom padding reserving space for the nav bar. All content must fit in the viewport — no overflow/scroll. `overflow: hidden` is the law.

---

## JavaScript (`script.js`)

### Global State & Constants

```javascript
const TOTAL_SLIDES = 26;
const ACTUAL_WALKS   = 246;
const ACTUAL_QUASOS  = 151;
const ENGAGEMENT_DATE = new Date('2025-09-15');
const NZ_DATE         = new Date('2026-07-03');
const TRACKS = [ /* audio config, see below */ ];
let current = 0;               // current slide index
```

### Navigation

**`goToSlide(index)`** — central navigation function:
1. Bounds-checks `index` (0 ≤ index < `TOTAL_SLIDES`).
2. Computes direction from `current`, applies `.exit-left`/`.exit-right` to the old slide and the horizontal enter animation to the new one.
3. Updates `current` and the progress dots (`.active` on `#dot-N`).
4. Toggles `nav-dark` on `#nav` for light-background slides (see `lightSlides`), and `dots-hidden` on slide 0.
5. Fires per-slide side effects (count-ups, typewriters, slider/stack init, confetti, counters).
6. Calls `handleMusicTransition(prevIndex, index)` to cross-fade audio between sections.

**`lightSlides` array** (inside `goToSlide`):
```javascript
const lightSlides = [1, 4, 5, 6, 7, 15, 16, 17, 18, 19, 20, 21, 22];
```
These slides get `nav-dark` (dark-coloured nav dots/button) because their backgrounds are light enough at the bottom. The full-bleed photo slides (0, 2, 3, 8) are deliberately **excluded** — their `.hero-overlay` darkens the bottom, so they keep the default light dots (which also carry a subtle `box-shadow` for legibility on any photo). **Update this array if adding or reordering slides.**

**Per-slide side effects** (the `if (index === N)` block in `goToSlide`):

| Index | Call |
|---|---|
| 3 | `animateHikingStats()` |
| 5 | `animateBoulderingStat()` |
| 8 | `animateApolloStats()` |
| 10 | `initUniTypewriter()` |
| 11 | `initVerdictSlider()` |
| 17 | `updateNZCounter()` |
| 19 | `initGratitudeStack()` |
| 20 | `animateShowedUp()` |
| 22 | `initPhraseReveal()` |
| 24 | `triggerConfetti()` |
| 25 | `updateDaysCounter()` |

**Navigation inputs:**
- Click/tap on `#app`: **left half** → previous slide, **right half** → next slide. Interactive elements are excluded via a `closest()` guard (`.pick-card, .country-card, .gratitude-card, .slider-thumb, .slider-track, .reveal-btn, .year-12-btn, .begin-btn`).
- `←` / `→` arrow keys and `Space` (right/Space = next, left = back).
- The title slide's `begin-btn` calls `goToSlide(1)` directly.

### Audio Player

Background music is a single reused `Audio` element (`bgAudio`, looping) that swaps `src` per section and cross-fades on section boundaries.

**`TRACKS`** — array of `{ url, slides, startTime, fadeInMs }`:

| Track | Slides | File |
|---|---|---|
| Opening / Quality Time | 1–8 | `audio/loving-is-easy.mp3` |
| Challenges | 9–14 | `audio/follow-you.mp3` |
| Engagement + Final | 23–25 | `audio/beyond.mp3` |

Slides not covered by any track (0, 15–22) play no music — `handleMusicTransition` fades the current track out on entry.

Key functions: `_trackForSlide()`, `_fadeTo(target, ms, onDone)`, `_startTrack()`, `_stopTrack()`, `handleMusicTransition(prev, next)`, `toggleMute()` (the `#mute-btn` in the nav), `_updateMuteBtn()`. The mute button is hidden whenever no track is active. Autoplay failures are caught and silently disable music.

### Interactive: Pick Cards

**`selectCard(groupId, card)`** — sets all `.pick-card` in `#groupId` to `.not-selected`, then the clicked one to `.selected` (its `.check-mark` shows via CSS). Used on slides 4 (hikes) and 6 (op shop).

### Interactive: Country Flip

**`flipCountry(card)`** — toggles `.flipped` on a `.country-card` (CSS 3D flip to reveal a photo on the back). Used on slide 16.

### Interactive: Sliders

**`createSlider(config)`** — factory; returns `{ reveal() }`. Config: `{ max, actual, closeMsg, underMsg, overMsg, fillColor, trackId, thumbId, fillId, displayId, revealBtnId, revealResultId, revealMessageId }`. On `reveal()` it hides the button, writes `actual` into the result's `.stat-number`, and picks a message based on the guess vs. `actual` (`closeMsg` if within 5, otherwise `underMsg`/`overMsg`; `{v}` in a message is replaced with the guess).

- `quasoSlider` (slide 7) — max 200, `fillColor: var(--deep)`. Wrapper `revealQuasos()`.

> The previous `walksSlider` is gone — dog walks are now a count-up on slide 8, not a guess.

### Interactive: Verdict Slider (slide 11)

A bespoke two-sided slider (Mazda ↔ Subaru), separate from `createSlider`. `initVerdictSlider()` wires drag/click on first visit and resets to neutral on re-entry; `updateVerdictUI(pct)` moves the thumb and the two fills; `revealVerdict()` shows a message based on which side the thumb leans.

### Interactive: Gratitude Stack (slide 19)

A draggable stack of post-it `.gratitude-card`s. `initGratitudeStack()` resets every card to its base rotation/z-index on entry. `_gratStart`/`_gratEnd` plus document-level `mousemove`/`touchmove` handlers let the user drag the top card; dragging past ~80px throws it off-screen and marks it `.dismissed`, otherwise it springs back.

### Text Reveals

- **`initUniTypewriter()`** (slide 10) — fades in "Too f***ing many." character by character.
- **`initPhraseReveal()`** (slide 22) — fades in the phrase of the year ("the beginning of our biggest and most exciting chapter ever") char by char, then reveals a divider.

### Count-ups

**`countUp(el, target, duration)`** — ease-out cubic numeric count-up. Used by `animateHikingStats()` (15 hikes, 4 countries), `animateBoulderingStat()` (57), `animateApolloStats()` (`ACTUAL_WALKS`, 365 days), `animateShowedUp()` (365).

### Counters

- **`updateNZCounter()`** (slide 17) — days **until** `NZ_DATE` (`Math.ceil`), written to `#nz-days`; shows `0` if past.
- **`updateDaysCounter()`** (slide 25) — days **since** `ENGAGEMENT_DATE` (`Math.floor`), written to `#days-counter`; shows `—` if not yet.

### Confetti

**`triggerConfetti()`** (slide 24) — spawns 40 `.confetti-piece` elements with random position/rotation/duration into `#engagement-slide`; each self-removes after 4s.

### Dead / legacy code

**`buildHardGrid()`** is still defined but **no longer called** — slide 12 (75 Hard) is now a static list of rule pills, not a generated checkmark grid. Safe to ignore or remove.

### Progress Dots & Nav

Built at init: `TOTAL_SLIDES` `.dot` divs appended to `#progress-dots`, each `id="dot-N"`. The nav bar (`#nav`) holds the dots and the `#mute-btn`. `dots-hidden` hides the dots (slide 0); `nav-dark` darkens nav elements over light slides.

---

## Placeholders / Content Status

The deck is essentially fully populated. Notable runtime-filled spots that *look* like placeholders but are **not** TODOs:
- `#quaso-slider-display` shows `[ — ]` and the reveal `.stat-number` shows `[ # ]` in the static HTML — both are overwritten by `createSlider` at runtime.

Real values now live in code: `ACTUAL_WALKS = 246`, `ACTUAL_QUASOS = 151`. Photos (hero, NYT, hiking, Apollo, hikes, op-shop finds, country thumbnails, gratitude post-its, engagement ×3) are all wired to files in `images/`.

If re-gifting for a different year, the things to refresh are: the two `ACTUAL_*` constants, `ENGAGEMENT_DATE` / `NZ_DATE`, the `TRACKS` files, all `images/`, and the per-slide copy (stats, dates, closing message on slide 25).

---

## Design Constraints

- **No scroll** — all content must fit the viewport on each slide. `overflow: hidden`.
- **Palette only** — use CSS variables; no colours outside the warm cream/blush/rose/gold/deep family.
- **Google Fonts only** — Cormorant Garamond (serif, display/italic) and DM Sans (sans, body/labels). Lucide for icons.
- **Stagger animations** — assign `.anim-1`…`.anim-5` to slide children in visual order. They replay on every visit.
- **Light slides** — update the `lightSlides` array in `goToSlide()` whenever adding/reordering slides with light backgrounds.
- **Audio sections** — if you add or reorder slides, update each track's `slides` array in `TRACKS` so the music still matches the sections.
- **Mobile-first** — default to a single-column layout; use grids sparingly (pick cards, country cards).
