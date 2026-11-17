// The heat meter: a hand-drawn glass tube that fills with fire.
// It's painted on a canvas each frame so the flames can move.

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow = () => matchMedia('(max-width: 1080px)').matches;
const MAX = 10;

function seeded(seed) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

export function createHeat() {
  const el = document.createElement('div');
  el.className = 'heat';
  el.setAttribute('role', 'img');
  const canvas = document.createElement('canvas');
  const shield = document.createElement('span');
  shield.className = 'shield';
  shield.hidden = true;
  shield.innerHTML = '<svg viewBox="0 0 24 28" aria-hidden="true"><path d="M12 1.5 22 5.5v8c0 6.5-4.5 10.5-10 13-5.5-2.5-10-6.5-10-13v-8Z"/></svg>';
  el.append(canvas, shield);
  const ctx = canvas.getContext('2d');

  let target = 0, shown = null, horizontal = null, w = 0, h = 0, raf = 0, last = 0, shakeUntil = 0;
  let outline = null, texture = null;
  const embers = [];

  // Size the canvas and redraw the parts that don't move.
  function layout() {
    horizontal = narrow();
    const cssW = horizontal ? 124 : 84, cssH = horizontal ? 42 : 300;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px'; canvas.style.height = cssH + 'px';
    // Draw as if vertical; horizontal just rotates the drawing.
    w = horizontal ? cssH : cssW; h = horizontal ? cssW : cssH;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (horizontal) { ctx.translate(cssW, 0); ctx.rotate(Math.PI / 2); }
    buildTube();
  }

  // Tube geometry, in vertical coordinates.
  const geo = () => {
    const cx = w / 2, tw = horizontal ? 14 : 22;
    const top = horizontal ? 26 : 74, bulbR = horizontal ? 11 : 20, bulbY = h - bulbR - (horizontal ? 3 : 8);
    return {cx, tw, top, bulbR, bulbY, bottom: bulbY - bulbR * 0.6};
  };

  function buildTube() {
    const {cx, tw, top, bulbR, bulbY} = geo();
    const r = seeded(7);
    const wobble = () => (r() - 0.5) * 1.6;
    // Outline: up the right side, round the top, down the left, round the bulb.
    const p = new Path2D();
    const steps = 14;
    p.moveTo(cx + tw / 2 + wobble(), bulbY - bulbR * 0.7);
    for (let i = 1; i <= steps; i++) p.lineTo(cx + tw / 2 + wobble(), bulbY - bulbR * 0.7 - ((bulbY - bulbR * 0.7 - top) * i) / steps);
    p.arc(cx, top, tw / 2, 0, Math.PI, true);
    for (let i = steps; i >= 1; i--) p.lineTo(cx - tw / 2 + wobble(), bulbY - bulbR * 0.7 - ((bulbY - bulbR * 0.7 - top) * (i - 1)) / steps);
    p.arc(cx, bulbY, bulbR, Math.PI * 1.25 + 0.05, Math.PI * 1.75 - 0.05, true);
    p.closePath();
    outline = p;
    // Paper-and-crayon texture inside the glass, drawn once.
    texture = document.createElement('canvas');
    texture.width = w * 2; texture.height = h * 2;
    const t = texture.getContext('2d');
    t.scale(2, 2);
    t.save(); t.clip(p);
    t.fillStyle = 'rgba(255,250,240,0.55)'; t.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      t.strokeStyle = `rgba(${200 + r() * 40},${205 + r() * 40},${220 + r() * 30},${0.25 + r() * 0.3})`;
      t.lineWidth = 1 + r() * 1.5;
      const x = r() * w, y = r() * h, a = -0.5 + (r() - 0.5) * 0.5, l = 4 + r() * 8;
      t.beginPath(); t.moveTo(x, y); t.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); t.stroke();
    }
    t.restore();
  }

  const fireColor = f => {
    // f: 0 at the bottom of the fire, 1 at its surface.
    const stops = [[0, [150, 24, 30]], [0.35, [222, 64, 44]], [0.7, [255, 138, 58]], [1, [255, 216, 74]]];
    let i = 0; while (i < stops.length - 2 && f > stops[i + 1][0]) i++;
    const [f0, c0] = stops[i], [f1, c1] = stops[i + 1], k = Math.max(0, Math.min(1, (f - f0) / (f1 - f0)));
    return c0.map((v, j) => v + (c1[j] - v) * k);
  };
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

  function draw(time) {
    const t = time / 1000;
    const {cx, tw, top, bulbR, bulbY} = geo();
    const lv = shown / MAX;
    ctx.clearRect(-5, -5, w + 10, h + 10);
    const shake = time < shakeUntil ? Math.sin(time / 18) * 3 * ((shakeUntil - time) / 400) : 0;
    ctx.save();
    ctx.translate(shake, 0);

    const surface = bulbY - (bulbY - top) * lv;
    // Glow behind everything, stronger as it fills.
    if (lv > 0) {
      const gy = Math.max(top, surface), gr = 18 + 46 * lv;
      const g = ctx.createRadialGradient(cx, gy, 2, cx, gy, gr);
      g.addColorStop(0, `rgba(255,150,60,${0.15 + 0.4 * lv})`); g.addColorStop(1, 'rgba(255,150,60,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }

    ctx.drawImage(texture, 0, 0, w, h);

    // The fire inside the tube.
    ctx.save();
    ctx.clip(outline);
    const fireTop = Math.min(bulbY + bulbR * 0.3, surface);
    const grad = ctx.createLinearGradient(0, bulbY + bulbR, 0, fireTop);
    for (const f of [0, 0.35, 0.7, 1]) grad.addColorStop(f, rgba(fireColor(f), 0.95));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx - tw, bulbY + bulbR + 2);
    for (let x = cx - tw; x <= cx + tw; x += 1.5) {
      const lick = Math.sin(x * 0.7 + t * 7) * 2 + Math.sin(x * 1.6 - t * 11) * 1.3 + Math.max(0, Math.sin(x * 0.45 + t * 5)) * 3 * (0.4 + lv);
      ctx.lineTo(x, fireTop - lick);
    }
    ctx.lineTo(cx + tw, bulbY + bulbR + 2);
    ctx.closePath(); ctx.fill();
    // Crayon strokes moving through the fire.
    const height = bulbY + bulbR - fireTop;
    for (let i = 0; i < 26 + 30 * lv; i++) {
      const fy = Math.random();
      const y = bulbY + bulbR - fy * height, x = cx + (Math.random() - 0.5) * tw * 1.4;
      ctx.strokeStyle = rgba(fireColor(Math.min(1, fy + (Math.random() - 0.3) * 0.3)), 0.35 + Math.random() * 0.3);
      ctx.lineWidth = 1 + Math.random() * 1.6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (Math.random() - 0.5) * 3, y - 3 - Math.random() * 6); ctx.stroke();
    }
    ctx.restore();

    // Hand-drawn outline, twice, slightly off, like ink.
    ctx.strokeStyle = 'rgba(42,47,69,0.85)'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.stroke(outline);
    ctx.save(); ctx.translate(0.7, -0.5); ctx.strokeStyle = 'rgba(42,47,69,0.35)'; ctx.lineWidth = 1.2; ctx.stroke(outline); ctx.restore();
    // A highlight on the glass.
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - tw * 0.22, top + 6); ctx.lineTo(cx - tw * 0.22, bulbY - bulbR * 1.4); ctx.stroke();
    // Notches for each step of heat.
    ctx.strokeStyle = 'rgba(42,47,69,0.45)'; ctx.lineWidth = 1.2;
    for (let i = 1; i < MAX; i++) { const y = bulbY - ((bulbY - top) * i) / MAX; ctx.beginPath(); ctx.moveTo(cx + tw / 2 + 2, y); ctx.lineTo(cx + tw / 2 + (i % 5 ? 5 : 8), y); ctx.stroke(); }

    // The flame growing out of the top from 5 up.
    const flameLv = Math.max(0, (shown - 4.5) / 5.5);
    if (flameLv > 0) {
      const base = top + 2, fh = (horizontal ? 10 : 18) + (horizontal ? 16 : 46) * flameLv;
      const sway = Math.sin(t * 3.1) * 3 * flameLv + Math.sin(t * 7.3) * 1.2;
      for (const [scale, color, alpha] of [[1, [222, 64, 44], 0.9], [0.75, [255, 138, 58], 0.95], [0.45, [255, 224, 110], 1]]) {
        const fw = (tw * 0.75 + 6 * flameLv) * scale, fhh = fh * scale * (1 + Math.sin(t * 9 + scale * 5) * 0.06);
        ctx.fillStyle = rgba(color, alpha);
        ctx.beginPath();
        ctx.moveTo(cx - fw, base);
        ctx.bezierCurveTo(cx - fw * 1.1, base - fhh * 0.45, cx - fw * 0.2 + sway * 0.4, base - fhh * 0.7, cx + sway, base - fhh);
        ctx.bezierCurveTo(cx + fw * 0.3 + sway * 0.4, base - fhh * 0.6, cx + fw * 1.1, base - fhh * 0.4, cx + fw, base);
        ctx.closePath(); ctx.fill();
      }
      // Embers drift off a full flame.
      if (shown > 9.5 && Math.random() < 0.25) embers.push({x: cx + (Math.random() - 0.5) * 10, y: base - fh * 0.6, vx: (Math.random() - 0.5) * 12, vy: -20 - Math.random() * 25, life: 1});
    }
    for (const e of embers) {
      ctx.fillStyle = `rgba(255,${180 + 60 * e.life | 0},90,${e.life})`;
      ctx.fillRect(e.x, e.y, 2, 2);
    }
    ctx.restore();
  }

  function tick(time) {
    raf = 0;
    if (!el.isConnected) return;
    const dt = Math.min(0.1, (time - (last || time)) / 1000);
    last = time;
    shown += (target - shown) * Math.min(1, dt * 3.5);
    if (Math.abs(target - shown) < 0.01) shown = target;
    for (const e of embers) { e.x += e.vx * dt; e.y += e.vy * dt; e.life -= dt * 0.9; }
    while (embers.length && embers[0].life <= 0) embers.shift();
    el.style.setProperty('--grow', String(0.82 + 0.38 * (shown / MAX)));
    draw(time);
    if (!reduceMotion() && document.visibilityState === 'visible') raf = requestAnimationFrame(tick);
  }

  function start() {
    if (horizontal !== narrow() || !outline) layout();
    if (!raf) { last = 0; raf = requestAnimationFrame(tick); }
  }

  addEventListener('resize', () => { if (horizontal !== narrow()) { layout(); start(); } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && el.isConnected) start(); });

  return {
    el,
    // Put the meter into the page. It keeps its displayed level between
    // questions, so a new level animates from wherever it was.
    mount(slot, level, hasShield = false) {
      slot.replaceWith(el);
      if (shown === null) shown = level;
      target = level;
      shield.hidden = !hasShield;
      el.setAttribute('aria-label', `Heat ${level} of ${MAX}`);
      start();
    },
    set(level, {miss = false, hasShield = false} = {}) {
      target = level;
      shield.hidden = !hasShield;
      el.setAttribute('aria-label', `Heat ${level} of ${MAX}`);
      if (miss && !reduceMotion()) shakeUntil = performance.now() + 400;
      start();
    },
  };
}
