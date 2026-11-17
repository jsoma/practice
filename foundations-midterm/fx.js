// Celebrations: confetti, cannons, and a small shake.
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['#2340c4', '#17784a', '#ffe45c', '#e8457c', '#8fa3ff', '#5fcf98', '#ff9f43'];

let canvas, ctx, pieces = [], running = false;

function setup() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  ctx = canvas.getContext('2d');
  const size = () => { canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; };
  size();
  addEventListener('resize', size);
}

function launch(x, y, count, angle, spread, speed) {
  setup();
  const dpr = devicePixelRatio;
  for (let i = 0; i < count; i++) {
    const a = angle + (Math.random() - 0.5) * spread;
    const v = speed * (0.5 + Math.random() * 0.7);
    pieces.push({
      x: x * dpr, y: y * dpr,
      vx: Math.cos(a) * v * dpr, vy: Math.sin(a) * v * dpr,
      w: (6 + Math.random() * 6) * dpr, h: (8 + Math.random() * 8) * dpr,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0, max: 110 + Math.random() * 60, round: Math.random() < 0.3,
    });
  }
  if (!running) { running = true; requestAnimationFrame(tick); }
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dpr = devicePixelRatio;
  pieces = pieces.filter(p => p.life < p.max && p.y < canvas.height + 40 * dpr);
  for (const p of pieces) {
    p.life++;
    p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.32 * dpr;
    p.x += p.vx; p.y += p.vy; p.r += p.vr;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (p.max - p.life) / 30);
    ctx.translate(p.x, p.y); ctx.rotate(p.r);
    ctx.fillStyle = p.color;
    // Flip the piece as it spins so it flutters.
    const flutter = Math.abs(Math.cos(p.life * 0.15 + p.r));
    if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
    else ctx.fillRect(-p.w / 2, -p.h * flutter / 2, p.w, p.h * flutter);
    ctx.restore();
  }
  if (pieces.length) requestAnimationFrame(tick);
  else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

const center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

// A small burst upward from an element.
export function burst(el, size = 1) {
  if (reduceMotion() || !el) return;
  const [x, y] = center(el);
  launch(x, y, Math.round(36 * size), -Math.PI / 2, Math.PI * 0.8, 11 + 4 * size);
}

// Two cannons from the bottom corners.
export function cannons(rounds = 1) {
  if (reduceMotion()) return;
  for (let i = 0; i < rounds; i++) {
    setTimeout(() => {
      launch(0, innerHeight, 80, -Math.PI / 3, 0.6, 25);
      launch(innerWidth, innerHeight, 80, -Math.PI * 2 / 3, 0.6, 25);
    }, i * 350);
  }
}

// Stop any confetti still falling, e.g. when the next answer is wrong.
export function clearConfetti() { pieces = []; }

export function shake(el) {
  if (reduceMotion() || !el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), {once: true});
}
