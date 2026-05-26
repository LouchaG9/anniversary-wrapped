const TOTAL_SLIDES = 23;
const ACTUAL_WALKS = 285;
const ACTUAL_QUASOS = 151; // Replace with your number
const ENGAGEMENT_DATE = new Date('2025-09-15');

let current = 0;

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

  // Special actions
  if (index === 21) triggerConfetti();
  if (index === 22) updateDaysCounter();
  if (index === 11) { buildHardGrid(); lucideInit(document.getElementById('hard-grid')); }
}

function nextSlide() {
  goToSlide(current + 1);
}

// Left half = back, right half = forward (skip interactive elements)
document.getElementById('app').addEventListener('click', (e) => {
  const interactive = e.target.closest('.pick-card, .slider-thumb, .slider-track, .reveal-btn, .year-12-btn');
  if (interactive) return;
  if (e.clientX < window.innerWidth / 2) goToSlide(current - 1);
  else goToSlide(current + 1);
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

// ── SLIDER FACTORY ──
function createSlider({ max, actual, trackId, thumbId, fillId, displayId, revealBtnId, revealResultId, revealMessageId, closeMsg, underMsg, overMsg, fillColor }) {
  const track = document.getElementById(trackId);
  const thumb = document.getElementById(thumbId);
  const fill  = document.getElementById(fillId);
  const disp  = document.getElementById(displayId);

  if (fillColor) fill.style.background = fillColor;

  let value    = 0;
  let dragging = false;

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

  thumb.addEventListener('mousedown',  ()  => dragging = true);
  thumb.addEventListener('touchstart', ()  => dragging = true, { passive: true });
  track.addEventListener('click',      (e) => update(pctFromEvent(e)));

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

// ── 75 HARD GRID ──
function buildHardGrid() {
  const grid = document.getElementById('hard-grid');
  if (grid.children.length > 0) return;

  const months = [
    { label: 'Feb', total: 28, startDay: 2, endDay: 28 },
    { label: 'Mar', total: 31, startDay: 1, endDay: 31 },
    { label: 'Apr', total: 30, startDay: 1, endDay: 18 },
  ];

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
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', 'square-check');
        icon.style.cssText = 'width:12px;height:12px;';
        cell.appendChild(icon);
      } else {
        cell.className = 'check-cell empty';
      }
      monthGrid.appendChild(cell);
    }

    block.appendChild(monthGrid);
    grid.appendChild(block);
  });
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

// ── KEYBOARD NAV ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
  if (e.key === 'ArrowLeft') goToSlide(current - 1);
});
