const TOTAL_SLIDES = 27;
const ACTUAL_WALKS = 246;
const ACTUAL_QUASOS = 151; // Replace with your number
const ENGAGEMENT_DATE = new Date('2025-09-15');
const NZ_DATE = new Date('2026-07-03');

const TRACKS = [
  {
    url:       'audio/loving-is-easy.mp3',
    slides:    [1, 2, 3, 4, 5, 6, 7, 8, 9],  // Opening / Quality Time section
    startTime: 0,
    fadeInMs:  3000,
  },
  {
    url:       'audio/follow-you.mp3',
    slides:    [10, 11, 12, 13, 14, 15],      // Challenges section
    startTime: 60,
    fadeInMs:  2000,
  },
  {
    url:       'audio/the-great-escape.mp3',
    slides:    [16, 17, 18],                 // Travel section
    startTime: 36,
    fadeInMs:  2000,
  },
  {
    url:       'audio/potion.mp3',
    slides:    [19, 20, 21, 22, 23],         // Highlights section
    startTime: 41,
    fadeInMs:  2000,
  },
  {
    url:       'audio/beyond.mp3',
    slides:    [24, 25, 26],                 // Engagement build-up, reveal + final
    startTime: 66,
    fadeInMs:  2000,
  },
];

let current = 0;

// ── BUILD PROGRESS DOTS ──
const dotsEl = document.getElementById('progress-dots');
for (let i = 0; i < TOTAL_SLIDES; i++) {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  d.id = `dot-${i}`;
  dotsEl.appendChild(d);
}
document.getElementById('nav').classList.add('dots-hidden');

// ── SLIDE NAVIGATION ──
function goToSlide(index) {
  if (index < 0 || index >= TOTAL_SLIDES) return;

  const current_slide = document.querySelector('.slide.active');
  const next_slide = document.querySelector(`.slide[data-index="${index}"]`);

  if (!next_slide) return;

  const direction   = index > current ? 1 : -1;
  const exitClass   = direction > 0 ? 'exit-left' : 'exit-right';
  const enterOffset = direction > 0 ? '60px' : '-60px';

  // Exit current slide in correct direction
  current_slide.classList.remove('active');
  current_slide.classList.add(exitClass);
  setTimeout(() => current_slide.classList.remove(exitClass), 650);

  // Snap incoming slide to start position (no transition), then animate in
  next_slide.style.transition = 'none';
  next_slide.style.transform  = `translateX(${enterOffset})`;
  void next_slide.offsetHeight; // force reflow to commit initial position
  next_slide.style.transition = '';
  next_slide.style.transform  = '';
  next_slide.classList.add('active');

  document.getElementById(`dot-${current}`)?.classList.remove('active');
  document.getElementById(`dot-${index}`)?.classList.add('active');

  const prevIndex = current;
  current = index;

  const lightSlides = [1, 4, 5, 6, 7, 8, 16, 17, 18, 19, 20, 21, 23];
  document.getElementById('nav').classList.toggle('nav-dark', lightSlides.includes(index));
  document.getElementById('nav').classList.toggle('dots-hidden', index === 0);

  // Special actions
  if (index === 3)  animateHikingStats();
  if (index === 5)  animateBoulderingStat();
  if (index === 6)  animateYogaStat();
  if (index === 9)  { animateApolloStats(); triggerChickens(); }
  if (index === 11) initUniTypewriter();
  if (index === 21) animateShowedUp();
  if (index === 12) initVerdictSlider();
  if (index === 18) updateNZCounter();
  if (index === 23) initPhraseReveal();
  if (index === 20) initGratitudeStack();
  if (index === 25) triggerConfetti();
  if (index === 26) updateDaysCounter();

  handleMusicTransition(prevIndex, index);
}

function nextSlide() {
  goToSlide(current + 1);
}

// Left half = back, right half = forward (skip interactive elements)
document.getElementById('app').addEventListener('click', (e) => {
  const interactive = e.target.closest('.pick-card, .country-card, .gratitude-card, .slider-thumb, .slider-track, .reveal-btn, .year-12-btn, .begin-btn, .back-to-start-btn');
  if (interactive) return;
  if (e.clientX < window.innerWidth / 2) goToSlide(current - 1);
  else goToSlide(current + 1);
});

// ── INTERACTIVE: COUNTRY FLIP ──
function flipCountry(card) {
  card.classList.toggle('flipped');
}

// ── INTERACTIVE: PICK CARDS ──
function selectCard(groupId, card) {
  const group = document.getElementById(groupId);
  const cards = group.querySelectorAll('.pick-card');
  cards.forEach(c => {
    c.classList.remove('selected', 'not-selected');
    c.classList.add('not-selected');
  });
  card.classList.remove('not-selected');
  card.classList.add('selected');
}

// ── SLIDER FACTORY ──
function createSlider({ max, actual, trackId, thumbId, fillId, displayId, revealBtnId, revealResultId, revealMessageId, closeMsg, underMsg, overMsg, fillColor }) {
  const track = document.getElementById(trackId);
  const thumb = document.getElementById(thumbId);
  const fill  = document.getElementById(fillId);
  const disp  = document.getElementById(displayId);

  if (fillColor) fill.style.background = fillColor;

  const btn = document.getElementById(revealBtnId);
  btn.disabled = true;

  let value    = 0;
  let dragging = false;

  function enableBtn() { btn.disabled = false; }

  function update(pct) {
    pct = Math.max(0, Math.min(1, pct));
    value = Math.round(pct * max);
    fill.style.width = (pct * 100) + '%';
    thumb.style.left = (pct * 100) + '%';
    disp.textContent = value;
  }

  function pctFromEvent(e) {
    const rect    = track.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return (clientX - rect.left) / rect.width;
  }

  update(0.5);

  thumb.addEventListener('mousedown',  ()  => { dragging = true; enableBtn(); });
  thumb.addEventListener('touchstart', ()  => { dragging = true; enableBtn(); }, { passive: true });
  track.addEventListener('click',      (e) => { update(pctFromEvent(e)); enableBtn(); });

  document.addEventListener('mousemove',  (e) => { if (dragging) update(pctFromEvent(e)); });
  document.addEventListener('touchmove',  (e) => { if (dragging) update(pctFromEvent(e.touches[0])); }, { passive: true });
  document.addEventListener('mouseup',    ()  => dragging = false);
  document.addEventListener('touchend',   ()  => dragging = false);

  function reveal() {
    document.getElementById(revealBtnId).style.display = 'none';
    const resultEl = document.getElementById(revealResultId);
    resultEl.classList.add('show');
    resultEl.querySelector('.stat-number').textContent = actual;
    const diff = Math.abs(value - actual);
    let msg;
    if (actual === 0)        msg = 'Update this with the real number!';
    else if (diff <= 5)      msg = closeMsg || 'Incredibly close!';
    else if (value < actual) msg = underMsg ? underMsg.replace('{v}', value) : `You guessed ${value}. The real answer might surprise you.`;
    else                     msg = overMsg  || `You guessed ${value}. The real answer might surprise you.`;
    document.getElementById(revealMessageId).textContent = msg;
  }

  return { reveal };
}

const quasoSlider = createSlider({
  max:             200,
  actual:          ACTUAL_QUASOS,
  trackId:         'quaso-slider-track',
  thumbId:         'quaso-slider-thumb',
  fillId:          'quaso-slider-fill',
  displayId:       'quaso-slider-display',
  revealBtnId:     'quaso-reveal-btn',
  revealResultId:  'quaso-reveal-result',
  revealMessageId: 'quaso-reveal-message',
  closeMsg:        'Wow. Your brain must be the shape of a croissant.',
  underMsg:        'You guessed {v}. Do you really think we only ate that many?',
  overMsg:         'This looks more like how many croissants you wished we ate.',
  fillColor:       'var(--deep)',
});

function revealQuasos() { quasoSlider.reveal(); }

// ── VERDICT SLIDER (slide 11) ──
let verdictPct = 0.5;
let verdictInitialised = false;

function initVerdictSlider() {
  const verdictBtn = document.getElementById('verdict-reveal-btn');

  if (verdictInitialised) {
    // Reset to neutral on each visit
    document.getElementById('verdict-result').style.display = 'none';
    verdictBtn.style.display = 'inline-flex';
    verdictBtn.disabled = true;
    updateVerdictUI(0.5);
    return;
  }
  verdictInitialised = true;
  verdictBtn.disabled = true;

  const track     = document.getElementById('verdict-track');
  const thumb     = document.getElementById('verdict-thumb');
  const fillLeft  = document.getElementById('verdict-fill-left');
  const fillRight = document.getElementById('verdict-fill-right');
  let dragging = false;

  function enableVerdictBtn() { verdictBtn.disabled = false; }

  function updateVerdictUI(pct) {
    pct = Math.max(0, Math.min(1, pct));
    verdictPct = pct;
    thumb.style.left = (pct * 100) + '%';
    fillLeft.style.width  = (pct * 100) + '%';
    fillRight.style.width = ((1 - pct) * 100) + '%';
  }

  function pctFromEvent(e) {
    const rect    = track.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return (clientX - rect.left) / rect.width;
  }

  updateVerdictUI(0.5);

  thumb.addEventListener('mousedown',  ()  => { dragging = true; enableVerdictBtn(); });
  thumb.addEventListener('touchstart', ()  => { dragging = true; enableVerdictBtn(); }, { passive: true });
  track.addEventListener('click',      (e) => { updateVerdictUI(pctFromEvent(e)); enableVerdictBtn(); });
  document.addEventListener('mousemove',  (e) => { if (dragging) updateVerdictUI(pctFromEvent(e)); });
  document.addEventListener('touchmove',  (e) => { if (dragging) updateVerdictUI(pctFromEvent(e.touches[0])); }, { passive: true });
  document.addEventListener('mouseup',    ()  => dragging = false);
  document.addEventListener('touchend',   ()  => dragging = false);
}

function updateVerdictUI(pct) {
  pct = Math.max(0, Math.min(1, pct));
  verdictPct = pct;
  const thumb     = document.getElementById('verdict-thumb');
  const fillLeft  = document.getElementById('verdict-fill-left');
  const fillRight = document.getElementById('verdict-fill-right');
  if (!thumb) return;
  thumb.style.left = (pct * 100) + '%';
  fillLeft.style.width  = (pct * 100) + '%';
  fillRight.style.width = ((1 - pct) * 100) + '%';
}

// ── UNI TYPEWRITER (slide 10) ──
const NBSP = " ";
function initUniTypewriter() {
  const el = document.getElementById('uni-text');
  el.innerHTML = '';

  [['Too f***ing'], ['many.']].forEach(([line]) => {
    const lineEl = document.createElement('div');
    for (const char of line) {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? ' ' : char;
      span.style.cssText = char === ' ' ? 'opacity:0; display:inline; white-space:pre; transition:opacity 0.08s ease;' : 'opacity:0; display:inline-block; transition:opacity 0.08s ease;';
      lineEl.appendChild(span);
    }
    el.appendChild(lineEl);
  });

  setTimeout(() => {
    const spans = el.querySelectorAll('span');
    spans.forEach((span, i) => {
      setTimeout(() => { span.style.opacity = '1'; }, i * 55);
    });
  }, 350);
}

// ── PHRASE REVEAL (slide 23) ──
function initPhraseReveal() {
  const container = document.getElementById('phrase-container');
  container.innerHTML = '';
  document.getElementById('phrase-divider').style.opacity = '0';

  const lines = ['the beginning of', 'our biggest and most', 'exciting chapter ever'];
  lines.forEach((line) => {
    const lineEl = document.createElement('div');
    for (const char of line) {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? ' ' : char;
      span.style.cssText = 'opacity:0; display:inline-block; transition:opacity 0.12s ease;';
      lineEl.appendChild(span);
    }
    container.appendChild(lineEl);
  });

  setTimeout(() => {
    const spans = container.querySelectorAll('span');
    spans.forEach((span, i) => {
      setTimeout(() => { span.style.opacity = '1'; }, i * 35);
    });
    setTimeout(() => {
      document.getElementById('phrase-divider').style.opacity = '1';
    }, spans.length * 35 + 200);
  }, 300);
}

function revealVerdict() {
  document.getElementById('verdict-reveal-btn').style.display = 'none';
  const result = document.getElementById('verdict-result');
  const msg    = document.getElementById('verdict-message');
  result.style.display = 'block';
  if (verdictPct < 0.35) {
    msg.textContent = 'One breakdown, one crash, one very stressful roadside phone call. A fair verdict.';
  } else if (verdictPct > 0.65) {
    msg.textContent = 'Zero incidents, just an eye-watering servicing bill. Mechanically perfect, financially painful.';
  } else {
    msg.textContent = 'A diplomatic answer. Very on-brand.';
  }
}

// ── 75 HARD GRID ──
function buildHardGrid() {
  const grid = document.getElementById('hard-grid');
  if (grid.children.length > 0) return;

  const months = [
    { label: 'Feb', total: 28, startDay: 2, endDay: 28 },
    { label: 'Mar', total: 31, startDay: 1, endDay: 31 },
    { label: 'Apr', total: 30, startDay: 1, endDay: 18 },
  ];

  let cellIndex = 0;

  months.forEach(({ label, total, startDay, endDay }) => {
    const block = document.createElement('div');
    block.className = 'month-block';

    const labelEl = document.createElement('div');
    labelEl.className = 'month-label text-cream';
    labelEl.textContent = label;
    block.appendChild(labelEl);

    const monthGrid = document.createElement('div');
    monthGrid.className = 'month-grid';

    for (let i = 1; i <= total; i++) {
      const cell = document.createElement('div');
      if (i >= startDay && i <= endDay) {
        cell.className = 'check-cell done';
        cell.style.animationDelay = `${cellIndex * 14}ms`;
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', 'square-check');
        icon.style.cssText = 'width:12px;height:12px;';
        cell.appendChild(icon);
      } else {
        cell.className = 'check-cell empty';
      }
      cellIndex++;
      monthGrid.appendChild(cell);
    }

    block.appendChild(monthGrid);
    grid.appendChild(block);
  });
}

// ── AUDIO PLAYER ──
const bgAudio = new Audio();
bgAudio.loop   = true;
bgAudio.volume = 0;

let musicActive = false;
let audioMuted  = false;
let _fadeTimer  = null;

function _trackForSlide(index) {
  return TRACKS.find(t => t.slides.includes(index)) || null;
}

function _fadeTo(target, ms, onDone) {
  clearInterval(_fadeTimer);
  const steps = 40;
  const tick  = ms / steps;
  const step  = (target - bgAudio.volume) / steps;
  _fadeTimer  = setInterval(() => {
    bgAudio.volume = parseFloat(Math.max(0, Math.min(1, bgAudio.volume + step)).toFixed(3));
    if (Math.abs(bgAudio.volume - target) < 0.02) {
      bgAudio.volume = target;
      clearInterval(_fadeTimer);
      if (target === 0) { bgAudio.pause(); bgAudio.currentTime = 0; }
      if (onDone) onDone();
    }
  }, tick);
}

function _startTrack(track) {
  musicActive    = true;
  bgAudio.src    = track.url;
  bgAudio.currentTime = track.startTime ?? 0;
  bgAudio.volume = 0;
  bgAudio.play().then(() => _fadeTo(0.8, track.fadeInMs ?? 2000)).catch(() => { musicActive = false; _updateMuteBtn(); });
  _updateMuteBtn();
}

function _stopTrack(onDone) {
  if (!musicActive) { if (onDone) onDone(); return; }
  musicActive = false;
  _fadeTo(0, 1500, onDone);
  _updateMuteBtn();
}

function handleMusicTransition(prevIndex, nextIndex) {
  const prevTrack = _trackForSlide(prevIndex);
  const nextTrack = _trackForSlide(nextIndex);
  if (prevTrack === nextTrack) return;
  if (prevTrack && nextTrack) _stopTrack(() => _startTrack(nextTrack));
  else if (nextTrack)         _startTrack(nextTrack);
  else                        _stopTrack();
}

function toggleMute() {
  audioMuted    = !audioMuted;
  bgAudio.muted = audioMuted;
  _updateMuteBtn();
}

function _updateMuteBtn() {
  const btn = document.getElementById('mute-btn');
  if (!btn) return;
  btn.style.opacity       = musicActive ? '1' : '0';
  btn.style.pointerEvents = musicActive ? 'auto' : 'none';
  btn.textContent         = audioMuted ? '✕' : '♫';
}

// ── CONFETTI ──
function triggerConfetti() {
  const colors = ['#C9A96E', '#E8C9B8', '#C97B63', '#F5EFE6', '#fff'];
  const slide = document.getElementById('engagement-slide');
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.top = '-10px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 0.5 + 's';
      piece.style.animationDuration = (2 + Math.random() * 2) + 's';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      slide.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }, i * 40);
  }
}

// ── CHICKENS ──
function triggerChickens() {
  const slide = document.getElementById('apollo-slide');
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.textContent = '🐔';
      piece.style.cssText = `
        position:absolute; top:-40px; font-size:${24 + Math.random() * 20}px;
        left:${Math.random() * 100}%; pointer-events:none; z-index:10;
        animation:confettiFall ${2 + Math.random() * 2}s ease-in forwards;
        animation-delay:${Math.random() * 0.4}s;
        transform:rotate(${Math.random() * 360}deg);
      `;
      slide.appendChild(piece);
      setTimeout(() => piece.remove(), 4000);
    }, i * 50);
  }
}

// ── STAT COUNT-UPS ──
function animateHikingStats() {
  countUp(document.getElementById('hike-count'),      15, 1800);
  countUp(document.getElementById('countries-hiked'),  4, 1400);
}

function animateBoulderingStat() {
  const el = document.getElementById('boulder-sessions');
  countUp(el, 57, 2000);
  setTimeout(() => { el.textContent = '57ish'; }, 2000);
}

function animateYogaStat() {
  countUp(document.getElementById('yoga-sessions'), 92, 2000);
}

function animateShowedUp() {
  countUp(document.getElementById('showed-up-days'), 365, 2500);
}

// ── APOLLO STAT COUNT-UP ──
function countUp(el, target, duration) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function animateApolloStats() {
  countUp(document.getElementById('apollo-walks'), ACTUAL_WALKS, 2500);
  countUp(document.getElementById('apollo-days'),  365, 2500);
}

// ── DAYS COUNTER ──
function updateNZCounter() {
  const now  = new Date();
  const diff = Math.ceil((NZ_DATE - now) / (1000 * 60 * 60 * 24));
  document.getElementById('nz-days').textContent = diff > 0 ? diff : '0';
}

function updateDaysCounter() {
  const now = new Date();
  const diff = Math.floor((now - ENGAGEMENT_DATE) / (1000 * 60 * 60 * 24));
  document.getElementById('days-counter').textContent = diff > 0 ? diff : '—';
}

// ── LUCIDE ICON INIT ──
function lucideInit(root) {
  (root || document).querySelectorAll('i[data-lucide]').forEach(el => {
    const name = el.getAttribute('data-lucide')
      .split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('');
    const icon = lucide[name];
    if (!icon) return;
    const svg = lucide.createElement(icon);
    svg.style.cssText = el.style.cssText;
    el.replaceWith(svg);
  });
}

lucideInit();

// ── GRATITUDE STACK ──
let _gratDrag = null;

function initGratitudeStack() {
  _gratDrag = null;
  document.querySelectorAll('.gratitude-card').forEach(c => {
    c.classList.remove('dismissed');
    c.style.transition = 'none';
    c.style.transform  = `translate(-50%, -50%) rotate(${c.dataset.rot}deg)`;
    c.style.opacity    = '1';
    c.style.zIndex     = c.dataset.z;
  });
  const hint = document.getElementById('gratitude-hint');
  if (hint) hint.style.opacity = '0.4';
}

function _gratStart(e, card) {
  if (card.classList.contains('dismissed')) return;
  const alive = [...document.querySelectorAll('.gratitude-card:not(.dismissed)')];
  if (!alive.length) return;
  const top = alive.reduce((a, b) => +a.dataset.z > +b.dataset.z ? a : b);
  if (top !== card) return;
  const pt = e.touches ? e.touches[0] : e;
  _gratDrag = { card, sx: pt.clientX, sy: pt.clientY, cx: 0, cy: 0, baseRot: parseFloat(card.dataset.rot) || 0 };
  card.style.transition = 'none';
  if (e.cancelable) e.preventDefault();
}

document.addEventListener('mousemove', function(e) {
  if (!_gratDrag) return;
  _gratDrag.cx = e.clientX - _gratDrag.sx;
  _gratDrag.cy = e.clientY - _gratDrag.sy;
  const rot = _gratDrag.baseRot + _gratDrag.cx * 0.07;
  _gratDrag.card.style.transform = `translate(calc(-50% + ${_gratDrag.cx}px), calc(-50% + ${_gratDrag.cy}px)) rotate(${rot}deg)`;
});

document.addEventListener('touchmove', function(e) {
  if (!_gratDrag) return;
  const pt = e.touches[0];
  _gratDrag.cx = pt.clientX - _gratDrag.sx;
  _gratDrag.cy = pt.clientY - _gratDrag.sy;
  const rot = _gratDrag.baseRot + _gratDrag.cx * 0.07;
  _gratDrag.card.style.transform = `translate(calc(-50% + ${_gratDrag.cx}px), calc(-50% + ${_gratDrag.cy}px)) rotate(${rot}deg)`;
  e.preventDefault();
}, { passive: false });

document.addEventListener('mouseup',  _gratEnd);
document.addEventListener('touchend', _gratEnd);

function _gratEnd() {
  if (!_gratDrag) return;
  const { card, cx, cy, baseRot } = _gratDrag;
  _gratDrag = null;
  if (Math.hypot(cx, cy) > 80) {
    const angle   = Math.atan2(cy, cx);
    const tx      = Math.cos(angle) * 700;
    const ty      = Math.sin(angle) * 700;
    const finalRot = baseRot + cx * 0.25;
    card.style.transition = 'transform 0.5s cubic-bezier(0.55,0,1,0.45), opacity 0.35s ease 0.1s';
    card.style.transform  = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${finalRot}deg)`;
    card.style.opacity    = '0';
    document.getElementById('gratitude-hint')?.style && (document.getElementById('gratitude-hint').style.opacity = '0');
    setTimeout(() => card.classList.add('dismissed'), 500);
  } else {
    card.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    card.style.transform  = `translate(-50%, -50%) rotate(${baseRot}deg)`;
  }
}

// ── KEYBOARD NAV ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
  if (e.key === 'ArrowLeft') goToSlide(current - 1);
});
