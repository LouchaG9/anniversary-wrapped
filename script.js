const TOTAL_SLIDES = 24;
const ACTUAL_WALKS = 0; // Replace with your number
const ENGAGEMENT_DATE = new Date('2025-09-15');

let current = 0;
let sliderValue = 400;
let revealed = false;

// ── BUILD PROGRESS DOTS ──
const dotsEl = document.getElementById('progress-dots');
for (let i = 0; i < TOTAL_SLIDES; i++) {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' active' : '');
  d.id = `dot-${i}`;
  dotsEl.appendChild(d);
}

// ── SLIDE NAVIGATION ──
function goToSlide(index) {
  if (index < 0 || index >= TOTAL_SLIDES) return;

  const current_slide = document.querySelector('.slide.active');
  const next_slide = document.querySelector(`.slide[data-index="${index}"]`);

  if (!next_slide) return;

  current_slide.classList.remove('active');
  current_slide.classList.add('exit');
  setTimeout(() => current_slide.classList.remove('exit'), 600);

  next_slide.classList.add('active');

  document.getElementById(`dot-${current}`)?.classList.remove('active');
  document.getElementById(`dot-${index}`)?.classList.add('active');

  current = index;

  // Update next button style based on slide bg
  const btn = document.getElementById('next-btn');
  const lightSlides = [0, 6, 8, 13, 14, 19];
  if (lightSlides.includes(current)) {
    btn.classList.add('dark');
  } else {
    btn.classList.remove('dark');
  }

  // Hide next on final slide
  btn.style.display = current === TOTAL_SLIDES - 1 ? 'none' : '';

  // Special actions
  if (index === 22) triggerConfetti();
  if (index === 23) updateDaysCounter();
  if (index === 12) buildHardGrid();
}

function nextSlide() {
  goToSlide(current + 1);
}

// Tap anywhere on slide to advance (except interactive elements)
document.getElementById('app').addEventListener('click', (e) => {
  const interactive = e.target.closest('.pick-card, .slider-thumb, .slider-track, .reveal-btn, #next-btn, .year-12-btn');
  if (!interactive) nextSlide();
});

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

// ── INTERACTIVE: SLIDER ──
const track = document.getElementById('slider-track');
const thumb = document.getElementById('slider-thumb');
const fill = document.getElementById('slider-fill');
const display = document.getElementById('slider-display');

const MIN_WALKS = 0;
const MAX_WALKS = 800;

function updateSlider(pct) {
  pct = Math.max(0, Math.min(1, pct));
  const val = Math.round(pct * MAX_WALKS);
  sliderValue = val;
  fill.style.width = (pct * 100) + '%';
  thumb.style.left = (pct * 100) + '%';
  display.textContent = val;
}

// Initialize slider
updateSlider(0.5);

function getSliderPct(e, el) {
  const rect = el.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  return (clientX - rect.left) / rect.width;
}

let dragging = false;

thumb.addEventListener('mousedown', () => dragging = true);
thumb.addEventListener('touchstart', () => dragging = true, {passive: true});
track.addEventListener('click', (e) => updateSlider(getSliderPct(e, track)));

document.addEventListener('mousemove', (e) => {
  if (dragging) updateSlider(getSliderPct(e, track));
});
document.addEventListener('touchmove', (e) => {
  if (dragging) updateSlider(getSliderPct(e.touches[0], track));
}, {passive: true});
document.addEventListener('mouseup', () => dragging = false);
document.addEventListener('touchend', () => dragging = false);

function revealWalks() {
  revealed = true;
  document.getElementById('reveal-btn').style.display = 'none';
  const result = document.getElementById('reveal-result');
  result.classList.add('show');
  const diff = Math.abs(sliderValue - ACTUAL_WALKS);
  let msg = '';
  if (ACTUAL_WALKS === 0) {
    msg = 'Update this with the real number!';
  } else if (diff < 20) {
    msg = 'Incredibly close. You really do know us. 🎯';
  } else if (diff < 80) {
    msg = 'Pretty close! You know us well. 🐾';
  } else {
    msg = `You guessed ${sliderValue}. The real answer might surprise you.`;
  }
  document.getElementById('reveal-message').textContent = msg;
}

// ── 75 HARD GRID ──
function buildHardGrid() {
  const grid = document.getElementById('hard-grid');
  if (grid.children.length > 0) return;
  for (let i = 0; i < 75; i++) {
    const cell = document.createElement('div');
    cell.className = 'check-cell done';
    grid.appendChild(cell);
  }
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

// ── DAYS COUNTER ──
function updateDaysCounter() {
  const now = new Date();
  const diff = Math.floor((now - ENGAGEMENT_DATE) / (1000 * 60 * 60 * 24));
  document.getElementById('days-counter').textContent = diff > 0 ? diff : '—';
}

// ── KEYBOARD NAV ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
  if (e.key === 'ArrowLeft') goToSlide(current - 1);
});
