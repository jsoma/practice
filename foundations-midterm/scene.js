// Painted background scenes that follow the local time of day.
// Static parts (sky, land) are painted with short hatched strokes into offscreen
// layers and repainted every few minutes; small things move on top.

export const SCENES = [
  {id: 'harbor', name: 'Harbor'},
  {id: 'city', name: 'City'},
  {id: 'forest', name: 'Forest'},
  {id: 'desert', name: 'Desert'},
  {id: 'snow', name: 'Snow'},
];

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- small helpers ----------
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const between = (r, a, b) => a + r() * (b - a);

// ---------- time of day ----------
// [hour, top, middle, horizon, daylight]
const SKY = [
  [0, '#0b1026', '#18204a', '#2a3262', 0],
  [4.5, '#0f1638', '#2a2c5c', '#4a3e6e', 0.04],
  [5.75, '#2b3a78', '#8a5a8a', '#e98f78', 0.3],
  [7, '#5b8fd0', '#f3b08a', '#ffe2b0', 0.75],
  [9, '#4a8edb', '#8fc4ee', '#dff0fa', 1],
  [16, '#4386d6', '#90c2ec', '#e6f1f7', 1],
  [17.75, '#5d78c0', '#f2a27a', '#ffd59a', 0.8],
  [19, '#3b3f86', '#c96a7c', '#f6a26c', 0.45],
  [20.25, '#1c2050', '#4a3a72', '#8a5578', 0.14],
  [21.5, '#0d1230', '#1d2450', '#2e3462', 0.02],
  [24, '#0b1026', '#18204a', '#2a3262', 0],
];
const NIGHT = hex('#141a35');
const WARM = hex('#ff9a6a');

export function palette(hour) {
  let i = 0;
  while (SKY[i + 1][0] <= hour) i++;
  const [h0, t0, m0, b0, l0] = SKY[i], [h1, t1, m1, b1, l1] = SKY[i + 1];
  const t = (hour - h0) / (h1 - h0);
  const warm = Math.max(0, 1 - Math.abs(hour - 6.3) / 1.3, 1 - Math.abs(hour - 18.6) / 1.4);
  const light = l0 + (l1 - l0) * t;
  return {
    hour, light, warm,
    top: mix(hex(t0), hex(t1), t), mid: mix(hex(m0), hex(m1), t), bot: mix(hex(b0), hex(b1), t),
    // Land colors are chosen for daytime; this shifts them for sunsets and night.
    shade: c => mix(mix(typeof c === 'string' ? hex(c) : c, WARM, warm * 0.22), NIGHT, (1 - light) * 0.72),
    dark: light < 0.45,
  };
}
// ?hour=19.5 in the URL previews another time of day.
const forcedHour = Number(new URLSearchParams(location.search).get('hour'));
const localHour = () => {
  if (forcedHour >= 0 && forcedHour < 24 && new URLSearchParams(location.search).has('hour')) return forcedHour;
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
};

// ---------- painting ----------
function poly(points) {
  const p = new Path2D();
  points.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
  p.closePath();
  return p;
}

// Fill a region, then cover it with short crayon strokes.
function paint(ctx, r, path, box, color, o = {}) {
  const {density = 0.01, len = [6, 18], width = [1.5, 3.5], angle = -0.45, jitter = 22, alpha = [0.35, 0.75], fill = true} = o;
  ctx.save();
  ctx.clip(path);
  if (fill) {
    ctx.fillStyle = css(typeof color === 'function' ? color(box[0] + box[2] / 2, box[1] + box[3] / 2) : color);
    ctx.fill(path);
  }
  const n = Math.min(26000, box[2] * box[3] * density);
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = box[0] + r() * box[2], y = box[1] + r() * box[3];
    const base = typeof color === 'function' ? color(x, y) : color;
    const j = (r() - 0.5) * jitter;
    ctx.strokeStyle = css([base[0] + j + (r() - 0.5) * 10, base[1] + j + (r() - 0.5) * 10, base[2] + j + (r() - 0.5) * 10], between(r, ...alpha));
    ctx.lineWidth = between(r, ...width);
    const a = angle + (r() - 0.5) * 0.5, l = between(r, ...len);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  ctx.restore();
}

// A jagged ridge from x=0 to x=w, closed down to the bottom.
function ridge(r, w, h, base, height, rough, steps = 24) {
  const pts = [[0, h]];
  let y = base - height * r();
  for (let i = 0; i <= steps; i++) {
    y = clamp(y + (r() - 0.5) * rough, base - height, base);
    pts.push([(i / steps) * w, y]);
  }
  pts.push([w, h]);
  return poly(pts);
}

function paintSky(ctx, r, w, h, hz, pal) {
  const color = (x, y) => {
    const t = y / hz;
    return t < 0.55 ? mix(pal.top, pal.mid, t / 0.55) : mix(pal.mid, pal.bot, clamp((t - 0.55) / 0.45));
  };
  const g = ctx.createLinearGradient(0, 0, 0, hz);
  g.addColorStop(0, css(pal.top)); g.addColorStop(0.55, css(pal.mid)); g.addColorStop(1, css(pal.bot));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  paint(ctx, r, poly([[0, 0], [w, 0], [w, h], [0, h]]), [-20, -20, w + 40, h + 40], color, {fill: false, density: 0.006, len: [10, 30], width: [2, 4], alpha: [0.3, 0.6], jitter: 16});
}

function cloudCanvas(r, size, pal) {
  const w = size * 3.2, h = size * 1.9;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const path = new Path2D();
  const puffs = 7 + Math.floor(r() * 6);
  for (let i = 0; i < puffs; i++) {
    const px = w * (0.18 + 0.64 * (i / (puffs - 1))) + (r() - 0.5) * size * 0.3;
    const rad = size * between(r, 0.32, 0.6) * (1 - Math.abs(i / (puffs - 1) - 0.5));
    const py = h * 0.62 - rad * between(r, 0.3, 0.9);
    path.moveTo(px + rad + size * 0.25, py);
    path.arc(px, py, rad + size * 0.25, 0, Math.PI * 2);
  }
  path.rect(w * 0.12, h * 0.55, w * 0.76, h * 0.2);
  const lit = mix(mix([255, 246, 236], hex('#ffcfa3'), pal.warm * 0.8), pal.top, (1 - pal.light) * 0.75);
  const shadow = mix(mix(pal.mid, [150, 160, 200], 0.4), pal.top, 0.35);
  paint(ctx, r, path, [0, 0, w, h], (x, y) => mix(lit, shadow, clamp((y / h - 0.35) * 1.6)), {density: 0.035, len: [5, 12], width: [1.5, 3], alpha: [0.5, 0.9]});
  return c;
}

// ---------- moving things ----------
const sprite = (z, draw, update = () => {}) => ({z, draw, update});

function birds(r, w, hz, count) {
  const list = Array.from({length: count}, () => ({x: r() * w, y: between(r, hz * 0.15, hz * 0.7), v: between(r, 18, 34), ph: r() * 6, s: between(r, 4, 7)}));
  return sprite('front', (ctx, t, env) => {
    if (env.pal.light < 0.3) return;
    ctx.strokeStyle = css(env.pal.shade('#2a2f45'), 0.75);
    ctx.lineWidth = 1.4;
    for (const b of list) {
      const f = Math.sin(t * 7 + b.ph) * b.s * 0.6;
      ctx.beginPath();
      ctx.moveTo(b.x - b.s, b.y - f);
      ctx.quadraticCurveTo(b.x - b.s / 2, b.y - b.s * 0.2, b.x, b.y);
      ctx.quadraticCurveTo(b.x + b.s / 2, b.y - b.s * 0.2, b.x + b.s, b.y - f);
      ctx.stroke();
    }
  }, (dt, t, env) => {
    for (const b of list) { b.x += b.v * dt; b.y += Math.sin(t + b.ph) * 0.15; if (b.x > env.w + 20) b.x = -20; }
  });
}

function stars(r, w, hz) {
  const list = Array.from({length: 140}, () => ({x: r() * w, y: r() * hz * 0.85, s: between(r, 0.6, 1.8), ph: r() * 6, f: between(r, 0.6, 2)}));
  return sprite('sky', (ctx, t, env) => {
    const a = clamp((0.4 - env.pal.light) / 0.4);
    if (!a) return;
    for (const s of list) {
      ctx.fillStyle = `rgba(255,250,235,${a * (0.55 + 0.45 * Math.sin(t * s.f + s.ph))})`;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
  });
}

function sunAndMoon(w, hz) {
  return sprite('sky', (ctx, t, env) => {
    const h = env.pal.hour;
    if (h > 5.7 && h < 19.6) {
      const p = (h - 5.7) / 13.9, x = w * (0.08 + 0.84 * p), y = hz - Math.sin(Math.PI * p) * hz * 0.82;
      const color = mix([255, 244, 214], [255, 170, 110], env.pal.warm);
      const g = ctx.createRadialGradient(x, y, 4, x, y, 90);
      g.addColorStop(0, css(color, 0.55)); g.addColorStop(1, css(color, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 90, 0, 7); ctx.fill();
      ctx.fillStyle = css(color); ctx.beginPath(); ctx.arc(x, y, 22, 0, 7); ctx.fill();
    } else {
      const nh = h >= 19.6 ? h - 19.6 : h + 4.4, p = nh / 10.1;
      const x = w * (0.1 + 0.8 * p), y = hz - Math.sin(Math.PI * p) * hz * 0.75;
      const g = ctx.createRadialGradient(x, y, 4, x, y, 70);
      g.addColorStop(0, 'rgba(230,235,255,0.35)'); g.addColorStop(1, 'rgba(230,235,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 70, 0, 7); ctx.fill();
      ctx.fillStyle = '#eef0fa'; ctx.beginPath(); ctx.arc(x, y, 16, 0, 7); ctx.fill();
      ctx.fillStyle = css(env.pal.top, 0.9); ctx.beginPath(); ctx.arc(x + 7, y - 4, 14, 0, 7); ctx.fill();
    }
  });
}

function clouds(r, w, hz, count, pal, band = [0.1, 0.6]) {
  const list = Array.from({length: count}, () => {
    const size = between(r, 40, 110);
    return {img: cloudCanvas(r, size, pal), x: r() * (w + 400) - 200, y: between(r, hz * band[0], hz * band[1]), v: between(r, 2, 6)};
  });
  return sprite('clouds', ctx => { for (const c of list) ctx.drawImage(c.img, c.x, c.y - c.img.height / 2); },
    (dt, t, env) => { for (const c of list) { c.x += c.v * dt; if (c.x > env.w + 50) c.x = -c.img.width - 50; } });
}

function windows(ctx, r, x, y, w, h, pal, chance = 0.5, size = 3) {
  if (!pal.dark) return;
  ctx.fillStyle = css([255, 214, 120], 0.9);
  for (let wy = y + size; wy < y + h - size; wy += size * 3) {
    for (let wx = x + size; wx < x + w - size; wx += size * 2.6) if (r() < chance) ctx.fillRect(wx, wy, size * 1.2, size * 1.4);
  }
}

// ---------- foreground pieces ----------
const pick = (r, list) => list[Math.floor(r() * list.length)];
const solid = {density: 0.035, angle: -1.5, len: [3, 8], width: [1, 2.5]};

function block(ctx, r, x, y, w, h, color, pal) {
  paint(ctx, r, poly([[x, y], [x, y - h], [x + w, y - h], [x + w, y]]), [x, y - h, w, h], pal.shade(color), solid);
}

// One window: lit at night some of the time, a dark pane otherwise.
function pane(ctx, r, x, y, w, h, pal, chance = 0.6) {
  ctx.fillStyle = pal.dark && r() < chance ? 'rgba(255,212,120,0.95)' : css(pal.shade('#3d4a6a'), 0.85);
  ctx.fillRect(x, y, w, h);
}

function gableHouse(ctx, r, x, y, s, pal, o = {}) {
  const w = s * between(r, 1, 1.6), wallH = s * between(r, 0.55, 0.8), roofH = s * between(r, 0.35, 0.6) * (o.steep ?? 1);
  const wall = o.wall ?? pick(r, ['#e8dcc4', '#d9a07a', '#b0644e', '#9fb3c8', '#c9b48a', '#a88fb5']);
  const roof = o.roof ?? pick(r, ['#5b77b0', '#3f5a96', '#c96a4a', '#7a4a4a', '#4a5a7a']);
  block(ctx, r, x, y, w, wallH, wall, pal);
  let chimney = null;
  if (r() < 0.7) {
    const cx = x + w * between(r, 0.6, 0.8);
    ctx.fillStyle = css(pal.shade('#6a4a44'));
    ctx.fillRect(cx, y - wallH - roofH * 0.9, s * 0.1, roofH * 0.6);
    chimney = [cx + s * 0.05, y - wallH - roofH * 0.9];
  }
  const over = s * 0.08;
  paint(ctx, r, poly([[x - over, y - wallH], [x + w / 2, y - wallH - roofH], [x + w + over, y - wallH]]), [x - over, y - wallH - roofH, w + 2 * over, roofH], pal.shade(roof), {density: 0.05, angle: -0.5, len: [3, 8]});
  const ww = s * 0.14;
  for (let wx = x + s * 0.15; wx < x + w - ww - s * 0.1; wx += ww * 2.2) pane(ctx, r, wx, y - wallH * 0.7, ww, ww * 1.2, pal);
  ctx.fillStyle = css(pal.shade('#4a3a3a'));
  if (wallH > s * 0.5) ctx.fillRect(x + w * 0.45, y - wallH * 0.38, s * 0.13, wallH * 0.38);
  return chimney;
}

function roundTree(ctx, r, x, y, s, pal, color) {
  ctx.fillStyle = css(pal.shade('#5a4030'));
  ctx.fillRect(x - s * 0.05, y - s * 0.6, s * 0.1, s * 0.6);
  const crown = new Path2D();
  for (let i = 0; i < 6; i++) {
    const cx = x + (r() - 0.5) * s * 0.6, cy = y - s * 0.75 - r() * s * 0.45, rad = s * between(r, 0.22, 0.36);
    crown.moveTo(cx + rad, cy); crown.arc(cx, cy, rad, 0, 7);
  }
  paint(ctx, r, crown, [x - s * 0.7, y - s * 1.6, s * 1.4, s * 1.1], (px, py) => pal.shade(mix(hex(color), [255, 255, 220], clamp((y - s - py) / s) * 0.25)), {density: 0.06, angle: -0.8, len: [3, 7], width: [1, 2.2]});
}

function pine(ctx, r, x, y, s, pal, color, o = {}) {
  const width = o.narrow ? 0.26 : 0.46, tiers = o.tiers ?? (3 + Math.floor(r() * 3));
  ctx.fillStyle = css(pal.shade('#4a3428'));
  ctx.fillRect(x - s * 0.04, y - s * 0.25, s * 0.08, s * 0.25);
  const path = new Path2D();
  for (let i = 0; i < tiers; i++) {
    const top = y - s * 1.7 + (i * s * 1.4) / tiers, bottom = top + (s * 1.7) / tiers + s * 0.25;
    const half = s * width * ((i + 1) / tiers) * between(r, 0.9, 1.1);
    path.moveTo(x, top); path.lineTo(x + half, bottom); path.lineTo(x - half, bottom); path.closePath();
  }
  const snow = o.snow ? hex('#eef3fa') : null;
  paint(ctx, r, path, [x - s * width, y - s * 1.75, s * width * 2, s * 1.6], () => pal.shade(snow && r() < 0.35 ? snow : color), {density: 0.05, angle: -2.2, len: [3, 8], width: [1, 2.2]});
}

function bush(ctx, r, x, y, s, pal, color) {
  const path = new Path2D();
  for (let i = 0; i < 4; i++) { const cx = x + (i - 1.5) * s * 0.3, rad = s * between(r, 0.22, 0.34); path.moveTo(cx + rad, y); path.arc(cx, y - rad * 0.6, rad, 0, 7); }
  paint(ctx, r, path, [x - s, y - s, s * 2, s], pal.shade(color), {density: 0.07, angle: -0.6, len: [2, 6], width: [1, 2]});
}

function rock(ctx, r, x, y, s, pal, color) {
  const pts = [];
  for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI; pts.push([x + Math.cos(a) * s * between(r, 0.8, 1.1), y + Math.sin(a) * s * between(r, 0.45, 0.7)]); }
  paint(ctx, r, poly(pts), [x - s * 1.1, y - s * 0.7, s * 2.2, s * 0.7], (px, py) => pal.shade(mix(hex(color), [255, 255, 255], clamp((y - py) / s - 0.3) * 0.3)), {density: 0.07, angle: -0.4, len: [3, 7], width: [1, 2]});
}

function grass(ctx, r, x, y, s, pal, color) {
  ctx.strokeStyle = css(pal.shade(color), 0.8);
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) {
    const bx = x + (r() - 0.5) * s;
    ctx.beginPath(); ctx.moveTo(bx, y); ctx.quadraticCurveTo(bx + (r() - 0.5) * s * 0.4, y - s * 0.5, bx + (r() - 0.5) * s * 0.6, y - s * between(r, 0.5, 1)); ctx.stroke();
  }
}

function lamp(ctx, x, y, s, pal) {
  ctx.fillStyle = css(pal.shade('#2a2f45'));
  ctx.fillRect(x - 1.5, y - s, 3, s);
  ctx.fillRect(x - 5, y - s - 4, 10, 5);
  if (!pal.dark) return;
  const g = ctx.createRadialGradient(x, y - s, 2, x, y - s, s * 0.6);
  g.addColorStop(0, 'rgba(255,214,130,0.55)'); g.addColorStop(1, 'rgba(255,214,130,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - s, s * 0.6, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,230,160,1)'; ctx.fillRect(x - 3, y - s + 1, 6, 3);
}

function fence(ctx, x0, x1, y, s, pal, color) {
  ctx.strokeStyle = css(pal.shade(color), 0.9);
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, y - s * 0.7); ctx.lineTo(x1, y - s * 0.7); ctx.moveTo(x0, y - s * 0.35); ctx.lineTo(x1, y - s * 0.35); ctx.stroke();
  ctx.lineWidth = 3;
  for (let x = x0; x <= x1; x += s * 0.9) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - s); ctx.stroke(); }
}

function cactus(ctx, r, x, y, s, pal) {
  const kind = r();
  const green = pick(r, ['#4f7a5a', '#5f8a5a', '#45705a']);
  if (kind < 0.35) {
    const c = new Path2D();
    c.roundRect(x - s * 0.08, y - s, s * 0.16, s, s * 0.08);
    if (r() < 0.8) { c.roundRect(x - s * 0.36, y - s * 0.62, s * 0.12, s * 0.34, s * 0.06); c.roundRect(x - s * 0.36, y - s * 0.34, s * 0.3, s * 0.1, s * 0.05); }
    if (r() < 0.8) { c.roundRect(x + s * 0.24, y - s * 0.8, s * 0.12, s * 0.4, s * 0.06); c.roundRect(x + s * 0.06, y - s * 0.46, s * 0.3, s * 0.1, s * 0.05); }
    paint(ctx, r, c, [x - s * 0.4, y - s, s * 0.8, s], pal.shade(green), {density: 0.06, angle: -1.57, len: [3, 7], width: [1, 2]});
  } else if (kind < 0.6) {
    const c = new Path2D();
    const pads = [[0, -0.18, 0.2], [-0.16, -0.42, 0.16], [0.17, -0.4, 0.15], [0.02, -0.62, 0.14], [-0.3, -0.2, 0.13]];
    for (const [dx, dy, rad] of pads.slice(0, 3 + Math.floor(r() * 3))) { c.moveTo(x + dx * s + rad * s * 0.7, y + dy * s); c.ellipse(x + dx * s, y + dy * s, rad * s * 0.7, rad * s, (r() - 0.5) * 0.6, 0, 7); }
    paint(ctx, r, c, [x - s * 0.5, y - s * 0.8, s, s * 0.8], pal.shade('#6a9a5a'), {density: 0.07, angle: -0.9, len: [2, 5], width: [1, 2]});
    ctx.fillStyle = css(pal.shade('#e8507a'));
    if (r() < 0.6) { ctx.beginPath(); ctx.arc(x + s * 0.02, y - s * 0.77, s * 0.04, 0, 7); ctx.fill(); }
  } else if (kind < 0.8) {
    const c = new Path2D(); c.ellipse(x, y - s * 0.22, s * 0.2, s * 0.24, 0, 0, 7);
    paint(ctx, r, c, [x - s * 0.2, y - s * 0.46, s * 0.4, s * 0.46], pal.shade('#5a8a62'), {density: 0.08, angle: -1.57, len: [3, 8], width: [1, 1.6]});
    ctx.fillStyle = css(pal.shade('#f2c84a')); ctx.beginPath(); ctx.arc(x, y - s * 0.46, s * 0.05, 0, 7); ctx.fill();
  } else {
    ctx.strokeStyle = css(pal.shade('#5a6a4a')); ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (i - 3.5) * 0.12, len = s * between(r, 0.8, 1.2);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 8, y + Math.sin(a) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len); ctx.stroke();
      if (r() < 0.5) { ctx.fillStyle = css(pal.shade('#e8603a')); ctx.fillRect(x + Math.cos(a) * len - 2, y + Math.sin(a) * len - 5, 4, 6); }
    }
  }
}

function windmill(ctx, r, x, y, s, pal) {
  ctx.strokeStyle = css(pal.shade('#5a4a44')); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - s * 0.25, y); ctx.lineTo(x, y - s); ctx.lineTo(x + s * 0.25, y);
  for (let k = 1; k < 4; k++) { const yy = y - (s * k) / 4, half = s * 0.25 * (1 - k / 4); ctx.moveTo(x - half, yy); ctx.lineTo(x + half, yy); }
  ctx.stroke();
  return [x, y - s];
}

// ---------- the five scenes ----------
const BUILD = {
  harbor(r, w, h, pal, back, front) {
    const hz = h * 0.58, sea = h * 0.76;
    paint(back, r, poly([[0, hz], [w, hz], [w, sea], [0, sea]]), [0, hz, w, sea - hz],
      (x, y) => pal.shade(mix(hex('#5fb3a6'), hex('#1f6f78'), (y - hz) / (sea - hz))), {angle: 0, len: [10, 30], density: 0.02, width: [1.5, 3]});
    back.strokeStyle = css(pal.shade('#2c4a6a')); back.lineWidth = 3;
    back.beginPath(); back.moveTo(w * 0.42, hz + (sea - hz) * 0.55); back.lineTo(w * 0.95, hz + (sea - hz) * 0.5); back.stroke();
    // Rooftops of all kinds, getting bigger toward the bottom.
    const roofs = ['#7f9cc9', '#5b77b0', '#3f5a96', '#6a86bd', '#4b64a0'];
    const towerAt = between(r, 0.2, 0.8) * w;
    let towerDone = false;
    for (let y = sea - 6; y < h + 40;) {
      const s = 10 + ((y - sea) / (h - sea)) * 70;
      for (let x = -40; x < w + 40;) {
        const kind = r();
        let used = s * between(r, 1.2, 2.6);
        if (!towerDone && y > sea + (h - sea) * 0.3 && x > towerAt) {
          towerDone = true;
          const tw = s * 0.9, th = s * 2.6;
          block(front, r, x, y, tw, th, '#d9c8a8', pal);
          paint(front, r, poly([[x - s * 0.1, y - th], [x + tw / 2, y - th - s * 0.9], [x + tw + s * 0.1, y - th]]), [x - s * 0.1, y - th - s * 0.9, tw + s * 0.2, s * 0.9], pal.shade('#3f5a96'), solid);
          front.fillStyle = css(pal.shade('#f4efe4')); front.beginPath(); front.arc(x + tw / 2, y - th * 0.78, tw * 0.28, 0, 7); front.fill();
          front.strokeStyle = css(pal.shade('#2a2f45')); front.lineWidth = 1.5; front.beginPath();
          front.moveTo(x + tw / 2, y - th * 0.78); front.lineTo(x + tw / 2, y - th * 0.78 - tw * 0.2); front.moveTo(x + tw / 2, y - th * 0.78); front.lineTo(x + tw / 2 + tw * 0.15, y - th * 0.78); front.stroke();
          used = tw + s * 0.3;
        } else if (kind < 0.5) {
          const rh = s * between(r, 0.5, 0.8), roof = r() < 0.08 ? '#c96a4a' : pick(r, roofs);
          front.fillStyle = css(pal.shade(roof));
          front.fill(poly([[x, y], [x + used, y], [x + used - s * 0.3, y - rh], [x + s * 0.3, y - rh]]));
          front.fillStyle = css(pal.shade(mix(hex(roof), [20, 30, 60], 0.45)));
          front.fillRect(x, y, used, s * 0.7);
          windows(front, r, x, y, used, s * 0.7, pal, 0.35, Math.max(2, s / 12));
          if (r() < 0.15) { front.fillStyle = css(pal.shade('#f2e6a0'), 0.9); front.fillRect(x + used * 0.4, y - rh * 0.6, s * 0.25, s * 0.12); }
        } else if (kind < 0.72) {
          gableHouse(front, r, x, y + s * 0.6, s, pal);
          used = s * 1.7;
        } else if (kind < 0.85) {
          const bh = s * between(r, 0.8, 1.3);
          block(front, r, x, y + s * 0.6, used * 0.8, bh, pick(r, ['#c9b48a', '#9fb3c8', '#d9a07a', '#a8b8a0']), pal);
          for (let wx = x + s * 0.2; wx < x + used * 0.8 - s * 0.3; wx += s * 0.4) pane(front, r, wx, y + s * 0.6 - bh * 0.7, s * 0.18, s * 0.22, pal, 0.5);
          front.fillStyle = css(pal.shade('#5a4a44'));
          if (r() < 0.5) { const tx = x + used * 0.5; front.fillRect(tx - s * 0.18, y + s * 0.6 - bh - s * 0.45, s * 0.36, s * 0.32); front.fillRect(tx - s * 0.16, y + s * 0.6 - bh - s * 0.14, 2, s * 0.14); front.fillRect(tx + s * 0.14, y + s * 0.6 - bh - s * 0.14, 2, s * 0.14); }
          else { front.fillRect(x + used * 0.3, y + s * 0.6 - bh - s * 0.6, 2, s * 0.6); front.fillRect(x + used * 0.3 - s * 0.12, y + s * 0.6 - bh - s * 0.45, s * 0.24, 2); }
          used *= 0.8;
        } else {
          roundTree(front, r, x + s * 0.5, y + s * 0.5, s * 0.9, pal, pick(r, ['#3f6a5a', '#4a7a5a', '#355a4a']));
          used = s;
        }
        x += used + between(r, -s * 0.2, s * 0.3);
      }
      y += s * 0.55;
    }
    paint(front, r, poly([[0, sea - 30], [w, sea - 30], [w, h], [0, h]]), [0, sea - 30, w, h - sea + 30], pal.shade('#4a64a0'), {fill: false, density: 0.004, alpha: [0.1, 0.25]});
    front.strokeStyle = css(pal.shade('#1d2a4a'), 0.6); front.lineWidth = 1.2;
    for (const k of [0.86, 0.9]) { front.beginPath(); front.moveTo(0, h * k); front.quadraticCurveTo(w / 2, h * (k + 0.04), w, h * (k - 0.02)); front.stroke(); }
    const kitesList = Array.from({length: 26}, () => ({x: between(r, w * 0.35, w), y: between(r, hz * 0.55, hz * 1.05), s: between(r, 5, 12), ph: r() * 6, c: ['#e8a0b4', '#7fc8d8', '#f4c86a', '#e86a5a', '#9a8ae0', '#7ad0a0'][Math.floor(r() * 6)]}));
    const boats = Array.from({length: 3}, () => ({x: r() * w, y: between(r, hz + 6, sea - 12), v: between(r, 3, 7), s: between(r, 6, 10)}));
    return {hz, sprites: [
      clouds(r, w, hz, 6, pal, [0.15, 0.75]),
      sprite('mid', (ctx, t, env) => {
        for (const b of boats) {
          ctx.fillStyle = css(env.pal.shade('#2c3e64')); ctx.fillRect(b.x - b.s, b.y, b.s * 2, b.s * 0.4);
          ctx.fillStyle = css(env.pal.shade('#f2ece0')); ctx.fill(poly([[b.x, b.y - b.s * 1.6], [b.x, b.y - 1], [b.x + b.s, b.y - 1]]));
        }
      }, (dt, t, env) => { for (const b of boats) { b.x += b.v * dt; if (b.x > env.w + 20) b.x = -20; } }),
      sprite('front', (ctx, t, env) => {
        if (env.pal.light < 0.25) return;
        for (const k of kitesList) {
          const x = k.x + Math.sin(t * 0.6 + k.ph) * 8, y = k.y + Math.sin(t * 0.9 + k.ph) * 5;
          ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(x, y + k.s); ctx.quadraticCurveTo(x - 20, y + 60, x - 40 - k.s * 4, env.h * 0.8); ctx.stroke();
          ctx.fillStyle = css(env.pal.shade(k.c));
          ctx.fill(poly([[x, y - k.s], [x + k.s * 0.7, y], [x, y + k.s], [x - k.s * 0.7, y]]));
          ctx.strokeStyle = css(env.pal.shade(k.c), 0.8); ctx.beginPath(); ctx.moveTo(x, y + k.s);
          for (let i = 1; i < 5; i++) ctx.lineTo(x + Math.sin(t * 3 + i + k.ph) * 3, y + k.s + i * 5);
          ctx.stroke();
        }
      }),
      birds(r, w, hz, 5),
    ]};
  },

  city(r, w, h, pal, back, front) {
    const hz = h * 0.62, river = h * 0.8;
    for (const [color, top, density, wmin, wmax] of [['#8a9ccc', 0.32, 0.3, 30, 70], ['#5a6aa0', 0.2, 0.4, 40, 90]]) {
      for (let x = -20; x < w;) {
        const bw = between(r, wmin, wmax), bh = h * between(r, top * 0.3, top) * (r() < 0.15 ? 1.4 : 1);
        const p = poly([[x, hz], [x, hz - bh], [x + bw, hz - bh], [x + bw, hz]]);
        paint(back, r, p, [x, hz - bh, bw, bh], pal.shade(color), {density: 0.02, angle: -1.5, len: [4, 10]});
        windows(back, r, x, hz - bh, bw, bh, pal, density * 0.6, 2.5);
        if (r() < 0.15) { back.fillStyle = css(pal.shade(color)); back.fillRect(x + bw / 2 - 1, hz - bh - 18, 2, 18); }
        x += bw + between(r, 2, 14);
      }
    }
    paint(back, r, poly([[0, hz], [w, hz], [w, river], [0, river]]), [0, hz, w, river - hz],
      (x, y) => pal.shade(mix(hex('#6a8ab8'), hex('#2f4c78'), (y - hz) / (river - hz))), {angle: 0, len: [12, 34], density: 0.02});
    const deck = hz + (river - hz) * 0.45;
    front.fillStyle = css(pal.shade('#3a4a7a'));
    front.fillRect(0, deck, w, 8);
    for (let x = 0; x < w; x += 120) {
      const arch = new Path2D(); arch.rect(x, deck + 8, 120, river - deck - 8); arch.moveTo(x + 105, river); arch.ellipse(x + 60, river, 45, (river - deck) * 0.65, 0, 0, Math.PI, true);
      front.fill(arch, 'evenodd');
    }
    paint(front, r, poly([[0, river], [w, river], [w, h], [0, h]]), [0, river, w, h - river], pal.shade('#2c3864'), {density: 0.012});
    // Near buildings: stepped towers, brick walk-ups, rooftop water towers and antennas.
    for (let x = -30; x < w + 30;) {
      const bw = between(r, 50, 150), bh = between(r, 30, 150);
      const color = pick(r, ['#3d4a80', '#4a3f70', '#2f3e6c', '#8a4a40', '#a89a8a', '#5a6a8a']);
      const tiers = bh > 90 && r() < 0.6 ? 2 + Math.floor(r() * 2) : 1;
      let tx = x, tw = bw, ty = h;
      for (let k = 0; k < tiers; k++) {
        const th = (bh / tiers) * between(r, 0.8, 1.2);
        block(front, r, tx, ty, tw, th, color, pal);
        for (let wy = ty - th + 6; wy < ty - 8; wy += 12) for (let wx = tx + 5; wx < tx + tw - 8; wx += 10) pane(front, r, wx, wy, 5, 6, pal, 0.25);
        ty -= th; tx += tw * 0.15; tw *= 0.7;
      }
      front.fillStyle = css(pal.shade('#4a3a34'));
      const roofKind = r();
      if (roofKind < 0.3) {
        const cx = tx + tw * 0.5;
        front.fillRect(cx - 9, ty - 22, 18, 14); front.beginPath(); front.moveTo(cx - 10, ty - 22); front.lineTo(cx, ty - 30); front.lineTo(cx + 10, ty - 22); front.fill();
        front.fillRect(cx - 8, ty - 8, 2, 8); front.fillRect(cx + 6, ty - 8, 2, 8);
      } else if (roofKind < 0.5) {
        front.fillRect(tx + tw * 0.7, ty - 28, 2, 28); front.fillRect(tx + tw * 0.7 - 6, ty - 20, 14, 2);
      }
      x += bw + between(r, 6, 40);
    }
    // Sidewalk with street trees and lamps.
    front.fillStyle = css(pal.shade('#4a4a5a')); front.fillRect(0, h - 14, w, 14);
    for (let x = between(r, 10, 60); x < w; x += between(r, 70, 140)) {
      if (r() < 0.55) roundTree(front, r, x, h - 12, between(r, 28, 42), pal, pick(r, ['#3f6a5a', '#4a7a52', '#5a8a4a']));
      else lamp(front, x, h - 12, 34, pal);
    }
    const train = {x: -400};
    const plane = {x: -50, y: hz * 0.22};
    return {hz, sprites: [
      clouds(r, w, hz, 5, pal),
      sprite('sky', (ctx, t, env) => {
        ctx.fillStyle = css(env.pal.shade('#dfe4ef')); ctx.fillRect(plane.x, plane.y, 18, 3); ctx.fillRect(plane.x + 6, plane.y - 3, 4, 9);
        if (Math.sin(t * 6) > 0.6) { ctx.fillStyle = '#ff5a5a'; ctx.fillRect(plane.x + 17, plane.y, 2, 2); }
      }, (dt, t, env) => { plane.x += 14 * dt; plane.y -= 0.6 * dt; if (plane.x > env.w + 40) { plane.x = -60; plane.y = hz * between(Math.random, 0.12, 0.35); } }),
      sprite('front', (ctx, t, env) => {
        for (let i = 0; i < 7; i++) {
          const x = train.x + i * 46;
          ctx.fillStyle = css(env.pal.shade(i === 0 ? '#c0485a' : '#c9d2e6')); ctx.fillRect(x, deck - 14, 42, 14);
          ctx.fillStyle = env.pal.dark ? 'rgba(255,214,120,0.95)' : css(env.pal.shade('#4a5a8a'));
          for (let k = 0; k < 4; k++) ctx.fillRect(x + 5 + k * 9, deck - 11, 5, 4);
        }
      }, (dt, t, env) => { train.x += 55 * dt; if (train.x > env.w + 60) train.x = -400 - Math.random() * 900; }),
      birds(r, w, hz, 4),
    ]};
  },

  forest(r, w, h, pal, back, front) {
    const hz = h * 0.56;
    [['#a7b6d8', hz - h * 0.02, h * 0.22, 60], ['#7a92bf', hz + h * 0.03, h * 0.16, 50], ['#56739f', hz + h * 0.08, h * 0.12, 40]].forEach(([color, base, height, rough], i) => {
      paint(back, r, ridge(r, w, h, base, height, rough), [0, base - height, w, h - base + height], pal.shade(color), {density: 0.012, angle: -0.9});
      const mist = back.createLinearGradient(0, base - 40, 0, base + 30);
      const m = mix(pal.bot, [255, 255, 255], 0.3);
      mist.addColorStop(0, css(m, 0)); mist.addColorStop(0.6, css(m, 0.22 - i * 0.05)); mist.addColorStop(1, css(m, 0));
      back.fillStyle = mist;
      back.fillRect(0, base - 40, w, 70);
    });
    const greens = ['#2f5a4a', '#24493e', '#1b3a33', '#3a6a52', '#2a5240'];
    const leafy = ['#4a7a4a', '#5a8a4a', '#3f6a4a', '#c98a3a', '#b85a3a', '#d4b04a'];
    let cabin = false;
    [[h * 0.74, 30, 60, 14, 0.15], [h * 0.86, 50, 100, 26, 0.35], [h * 1.02, 90, 170, 46, 0.25]].forEach(([y0, sMin, sMax, step, leafChance], row) => {
      paint(front, r, poly([[0, y0 - 10], [w, y0 - 10], [w, h], [0, h]]), [0, y0 - 10, w, h - y0 + 10], pal.shade(['#2c4a3a', '#2a4a36', '#2e4c34'][row]), {density: 0.01});
      for (let x = -20; x < w + 20; x += step * between(r, 0.6, 1.5)) {
        const s = between(r, sMin, sMax), kind = r(), yy = y0 + between(r, -6, 6);
        if (row === 1 && !cabin && x > w * 0.55 && kind < 0.2) {
          cabin = true;
          gableHouse(front, r, x, yy, s * 0.55, pal, {wall: '#7a5238', roof: '#4a3a34', steep: 1.4});
          continue;
        }
        if (kind < leafChance) roundTree(front, r, x, yy, s * 0.75, pal, pick(r, leafy));
        else if (kind < leafChance + 0.08 && row > 0) bush(front, r, x, yy, s * 0.35, pal, pick(r, ['#3a6a4a', '#4a7a4a']));
        else pine(front, r, x, yy, s, pal, pick(r, greens), {narrow: r() < 0.4});
      }
      if (row === 2) {
        for (let i = 0; i < 5; i++) rock(front, r, between(r, 0, w), between(r, h * 0.93, h), between(r, 20, 46), pal, '#7a8290');
        for (let i = 0; i < 24; i++) grass(front, r, between(r, 0, w), between(r, h * 0.9, h), between(r, 12, 22), pal, pick(r, ['#5a8a4a', '#6a9a5a', '#4a7a42']));
      }
    });
    const flies = Array.from({length: 40}, () => ({x: r() * w, y: between(r, h * 0.65, h), ph: r() * 6}));
    return {hz, sprites: [
      clouds(r, w, hz, 5, pal, [0.1, 0.5]),
      birds(r, w, hz, 7),
      sprite('front', (ctx, t, env) => {
        const a = clamp((0.45 - env.pal.light) / 0.45);
        if (!a) return;
        for (const f of flies) {
          const x = f.x + Math.sin(t * 0.4 + f.ph) * 30, y = f.y + Math.cos(t * 0.3 + f.ph * 2) * 18;
          const glow = a * (0.5 + 0.5 * Math.sin(t * 2 + f.ph));
          ctx.fillStyle = `rgba(230,255,140,${glow * 0.25})`; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
          ctx.fillStyle = `rgba(250,255,190,${glow})`; ctx.fillRect(x - 1, y - 1, 2.4, 2.4);
        }
      }),
    ]};
  },

  desert(r, w, h, pal, back, front) {
    const hz = h * 0.64;
    paint(back, r, ridge(r, w, h, hz, h * 0.05, 10), [0, hz - h * 0.05, w, h], pal.shade('#c9a58a'), {density: 0.01});
    for (const [color, base, count, maxH] of [['#d08a6a', hz, 4, 0.16], ['#b8644a', hz + h * 0.04, 3, 0.2]]) {
      for (let i = 0; i < count; i++) {
        const x = between(r, -50, w), mw = between(r, 90, 260), mh = h * between(r, maxH * 0.5, maxH);
        const top = r() < 0.4 ? 0.3 : 0.12;
        const p = poly([[x, base], [x + mw * top, base - mh], [x + mw * (1 - top * 0.8), base - mh * between(r, 0.9, 1)], [x + mw, base]]);
        paint(back, r, p, [x, base - mh, mw, mh], (px, py) => pal.shade(mix(hex(color), hex('#7a3a3a'), (py - (base - mh)) / mh * 0.5)), {density: 0.02, angle: -1.4, len: [5, 12]});
      }
    }
    const floor = poly([[0, h * 0.72], [w * 0.3, h * 0.7], [w * 0.7, h * 0.74], [w, h * 0.71], [w, h], [0, h]]);
    paint(front, r, floor, [0, h * 0.69, w, h * 0.31], (x, y) => pal.shade(mix(hex('#e6b884'), hex('#c98a5a'), (y - h * 0.7) / (h * 0.3))), {density: 0.014, angle: -0.15, len: [10, 24]});
    // A dirt road with a fence and a windmill pump.
    front.strokeStyle = css(pal.shade('#d9a878'), 0.9); front.lineWidth = 18;
    front.beginPath(); front.moveTo(w * 0.62, h * 0.73); front.quadraticCurveTo(w * 0.5, h * 0.86, w * 0.68, h + 20); front.stroke();
    fence(front, w * 0.02, w * 0.4, h * 0.79, 16, pal, '#7a5a44');
    const mill = windmill(front, r, w * between(r, 0.75, 0.9), h * 0.76, 90, pal);
    const things = [];
    for (let i = 0; i < 16; i++) things.push([between(r, 0, w), between(r, h * 0.76, h * 1.02)]);
    things.sort((a, b) => a[1] - b[1]);
    for (const [x, y] of things) {
      const s = 30 + ((y - h * 0.76) / (h * 0.26)) * 60, kind = r();
      if (kind < 0.55) cactus(front, r, x, y, s, pal);
      else if (kind < 0.8) bush(front, r, x, y, s * 0.4, pal, pick(r, ['#8a9a6a', '#9aa07a', '#7a8a5a']));
      else rock(front, r, x, y, s * 0.4, pal, pick(r, ['#a86a4a', '#b88a6a', '#8a5a44']));
    }
    const balloons = Array.from({length: 3}, () => ({x: r() * w, y: between(r, hz * 0.2, hz * 0.6), s: between(r, 14, 24), ph: r() * 6, c: [['#e86a5a', '#f4c86a'], ['#7fc8d8', '#9a8ae0'], ['#f29ac0', '#ffffff']][Math.floor(r() * 3)]}));
    const weed = {x: -40, y: h * 0.9};
    return {hz, sprites: [
      clouds(r, w, hz, 3, pal, [0.1, 0.4]),
      sprite('mid', (ctx, t, env) => {
        if (env.pal.light < 0.2) return;
        for (const b of balloons) {
          const y = b.y + Math.sin(t * 0.3 + b.ph) * 10;
          for (let i = 0; i < 4; i++) {
            ctx.fillStyle = css(env.pal.shade(b.c[i % 2]));
            ctx.beginPath(); ctx.ellipse(b.x, y, b.s * (1 - i * 0.25), b.s * 1.15, 0, 0, 7); ctx.fill();
          }
          ctx.strokeStyle = css(env.pal.shade('#5a3a2a'), 0.7); ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(b.x - b.s * 0.5, y + b.s * 0.9); ctx.lineTo(b.x - 3, y + b.s * 1.6); ctx.moveTo(b.x + b.s * 0.5, y + b.s * 0.9); ctx.lineTo(b.x + 3, y + b.s * 1.6); ctx.stroke();
          ctx.fillStyle = css(env.pal.shade('#7a4a2a')); ctx.fillRect(b.x - 4, y + b.s * 1.6, 8, 6);
        }
      }, (dt, t, env) => { for (const b of balloons) { b.x += 4 * dt; if (b.x > env.w + 40) b.x = -40; } }),
      sprite('front', (ctx, t, env) => {
        // Windmill blades turn slowly.
        const [mx, my] = mill;
        ctx.save(); ctx.translate(mx, my); ctx.rotate(t * 0.6);
        ctx.fillStyle = css(env.pal.shade('#c9c0b0'));
        for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillRect(2, -2, 22, 4); }
        ctx.restore();
        const y = weed.y - Math.abs(Math.sin(t * 3)) * 14;
        ctx.save(); ctx.translate(weed.x, y); ctx.rotate(t * 4);
        ctx.strokeStyle = css(env.pal.shade('#8a6a3a'), 0.8); ctx.lineWidth = 1.2;
        for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(0, 0, 9 + (i % 3) * 3, i, i + 2.2); ctx.stroke(); }
        ctx.restore();
      }, (dt, t, env) => { weed.x += 45 * dt; if (weed.x > env.w + 300) weed.x = -200 - Math.random() * 1500; }),
      birds(r, w, hz, 2),
    ]};
  },

  snow(r, w, h, pal, back, front) {
    const hz = h * 0.6;
    for (const [base, height, rough] of [[hz, h * 0.24, 70], [hz + h * 0.04, h * 0.15, 50]]) {
      paint(back, r, ridge(r, w, h, base, height, rough, 18), [0, base - height, w, h - base + height],
        (x, y) => pal.shade(mix(hex('#f4f7fc'), hex('#8aa0c8'), clamp((y - (base - height)) / height))), {density: 0.014, angle: -0.9});
    }
    paint(back, r, poly([[0, hz + h * 0.06], [w, hz + h * 0.06], [w, h * 0.78], [0, h * 0.78]]), [0, hz + h * 0.06, w, h * 0.12], pal.shade('#a9c0dc'), {angle: 0, density: 0.02, len: [12, 30]});
    paint(front, r, poly([[0, h * 0.76], [w * 0.5, h * 0.74], [w, h * 0.77], [w, h], [0, h]]), [0, h * 0.73, w, h * 0.27], (x, y) => pal.shade(mix(hex('#f1f5fb'), hex('#c4d2e8'), (y - h * 0.74) / (h * 0.26))), {density: 0.012, angle: -0.2});
    // A footpath through the village.
    front.strokeStyle = css(pal.shade('#b4c4dc'), 0.8); front.lineWidth = 10;
    front.beginPath(); front.moveTo(-10, h * 0.93); front.bezierCurveTo(w * 0.3, h * 0.86, w * 0.6, h * 0.98, w + 10, h * 0.88); front.stroke();
    const chimneys = [];
    const spots = [];
    // Small pines along the far shore.
    for (let x = 0; x < w; x += between(r, 8, 30)) pine(front, r, x, h * 0.775 + between(r, -4, 4), between(r, 10, 22), pal, pick(r, ['#2f5a4a', '#3a6a52']), {snow: true, narrow: true, tiers: 3});
    for (let x = between(r, 0, 40); x < w; x += between(r, 40, 100)) spots.push([x, between(r, h * 0.8, h * 0.97)]);
    spots.sort((a, b) => a[1] - b[1]);
    const churchAt = Math.floor(spots.length * between(r, 0.3, 0.7));
    let snowman = false;
    spots.forEach(([x, y], i) => {
      const s = 30 + ((y - h * 0.8) / (h * 0.17)) * 30, kind = r();
      if (i === churchAt) {
        block(front, r, x, y, s * 1.1, s * 1.1, '#d8c8b0', pal);
        block(front, r, x + s * 0.3, y - s * 1.1, s * 0.5, s * 0.9, '#d8c8b0', pal);
        paint(front, r, poly([[x + s * 0.25, y - s * 2], [x + s * 0.55, y - s * 2.9], [x + s * 0.85, y - s * 2]]), [x + s * 0.25, y - s * 2.9, s * 0.6, s * 0.9], pal.shade('#4a5a7a'), solid);
        paint(front, r, poly([[x - s * 0.08, y - s * 1.08], [x + s * 0.55, y - s * 1.55], [x + s * 1.18, y - s * 1.08]]), [x - s * 0.08, y - s * 1.55, s * 1.3, s * 0.5], pal.shade('#f4f7fc'), solid);
        pane(front, r, x + s * 0.47, y - s * 1.7, s * 0.16, s * 0.3, pal, 0.9);
        pane(front, r, x + s * 0.2, y - s * 0.75, s * 0.18, s * 0.35, pal, 0.8); pane(front, r, x + s * 0.7, y - s * 0.75, s * 0.18, s * 0.35, pal, 0.8);
      } else if (kind < 0.4) {
        const c = gableHouse(front, r, x, y, s, pal, {roof: '#f4f7fc', steep: between(r, 0.8, 1.6), wall: pick(r, ['#b0644e', '#7a8fb0', '#c4a070', '#8a6a9a', '#a85a5a', '#6a8a7a'])});
        if (c) chimneys.push(c);
      } else if (kind < 0.46) {
        paint(front, r, poly([[x, y], [x + s * 0.6, y - s * 1.3], [x + s * 1.2, y]]), [x, y - s * 1.3, s * 1.2, s * 1.3], pal.shade('#f4f7fc'), solid);
        paint(front, r, poly([[x + s * 0.3, y], [x + s * 0.6, y - s * 0.65], [x + s * 0.9, y]]), [x + s * 0.3, y - s * 0.65, s * 0.6, s * 0.65], pal.shade('#8a5a3a'), solid);
        pane(front, r, x + s * 0.5, y - s * 0.35, s * 0.2, s * 0.2, pal, 0.9);
      } else if (kind < 0.8) {
        pine(front, r, x, y, s * between(r, 0.9, 1.6), pal, pick(r, ['#2f5a4a', '#24493e', '#3a6a52']), {snow: true, narrow: r() < 0.5});
        if (r() < 0.5) pine(front, r, x + s * 0.4, y + 4, s * 0.7, pal, '#2f5a4a', {snow: true});
      } else if (kind < 0.9) {
        lamp(front, x, y, s * 1.1, pal);
      } else if (!snowman) {
        snowman = true;
        for (const [dy, rad] of [[0.3, 0.3], [0.78, 0.22], [1.12, 0.15]]) { front.fillStyle = css(pal.shade('#f8fbff')); front.beginPath(); front.arc(x, y - s * dy, s * rad, 0, 7); front.fill(); }
        front.fillStyle = css(pal.shade('#2a2f45')); front.fillRect(x - s * 0.12, y - s * 1.38, s * 0.24, s * 0.14); front.fillRect(x - s * 0.18, y - s * 1.26, s * 0.36, s * 0.04);
        front.fillStyle = css(pal.shade('#e8803a')); front.beginPath(); front.moveTo(x, y - s * 1.12); front.lineTo(x + s * 0.18, y - s * 1.09); front.lineTo(x, y - s * 1.06); front.fill();
      } else {
        fence(front, x - s * 0.5, x + s * 1.5, y, s * 0.5, pal, '#6a5a50');
      }
    });
    const flakes = Array.from({length: 140}, () => ({x: r() * w, y: r() * h, v: between(r, 14, 40), s: between(r, 1, 2.6), ph: r() * 6}));
    const puffs = [];
    return {hz, sprites: [
      sprite('sky', (ctx, t, env) => {
        const a = clamp((0.3 - env.pal.light) / 0.3);
        if (!a) return;
        for (let band = 0; band < 3; band++) {
          for (let x = 0; x < env.w; x += 5) {
            const y = hz * (0.25 + band * 0.08) + Math.sin(x / 140 + t * 0.15 + band) * 30 + Math.sin(x / 47 + t * 0.4) * 8;
            const g = ctx.createLinearGradient(0, y, 0, y + 90);
            g.addColorStop(0, `rgba(120,255,190,${0.16 * a})`); g.addColorStop(1, 'rgba(120,255,190,0)');
            ctx.fillStyle = g; ctx.fillRect(x, y, 5, 90);
          }
        }
      }),
      clouds(r, w, hz, 4, pal, [0.08, 0.35]),
      sprite('front', (ctx) => {
        for (const p of puffs) { ctx.fillStyle = `rgba(235,238,245,${p.a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 7); ctx.fill(); }
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        for (const f of flakes) ctx.fillRect(f.x, f.y, f.s, f.s);
      }, (dt, t, env) => {
        for (const f of flakes) { f.y += f.v * dt; f.x += Math.sin(t + f.ph) * 8 * dt; if (f.y > env.h) { f.y = -5; f.x = Math.random() * env.w; } }
        if (Math.random() < dt * 1.5 && chimneys.length) { const [x, y] = chimneys[Math.floor(Math.random() * chimneys.length)]; puffs.push({x, y, s: 3, a: 0.55}); }
        for (const p of puffs) { p.y -= 12 * dt; p.x += 5 * dt; p.s += 4 * dt; p.a -= 0.12 * dt; }
        while (puffs.length && puffs[0].a <= 0) puffs.shift();
      }),
    ]};
  },
};

// ---------- the renderer ----------
let canvas, ctx, layers, sprites = [], env = {}, sceneId, lastPaint = 0, running = false, last = 0;

function build() {
  const w = innerWidth, h = innerHeight;
  const pal = palette(localHour());
  const r = seeded(SCENES.findIndex(s => s.id === sceneId) * 977 + 13);
  const make = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const sky = make(), back = make(), front = make();
  const result = BUILD[sceneId](r, w, h, pal, back.getContext('2d'), front.getContext('2d'));
  paintSky(sky.getContext('2d'), seeded(7), w, h, result.hz, pal);
  // A little paper grain over everything.
  const fctx = front.getContext('2d'), gr = seeded(99);
  for (let i = 0; i < (w * h) / 220; i++) { fctx.fillStyle = gr() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; fctx.fillRect(gr() * w, gr() * h, 1.5, 1.5); }
  layers = {sky, back, front};
  sprites = [sunAndMoon(w, result.hz), stars(r, w, result.hz), ...result.sprites];
  env = {w, h, pal};
  lastPaint = Date.now();
  document.documentElement.dataset.daylight = pal.dark ? 'dark' : 'light';
}

function draw(t) {
  const dpr = canvas.width / env.w;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.drawImage(layers.sky, 0, 0);
  for (const z of ['sky', 'clouds']) for (const s of sprites) if (s.z === z) s.draw(ctx, t, env);
  ctx.drawImage(layers.back, 0, 0);
  for (const s of sprites) if (s.z === 'mid') s.draw(ctx, t, env);
  ctx.drawImage(layers.front, 0, 0);
  for (const s of sprites) if (s.z === 'front') s.draw(ctx, t, env);
}

function frame(now) {
  if (!running) return;
  requestAnimationFrame(frame);
  if (now - last < 33) return;
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (Date.now() - lastPaint > 3 * 60 * 1000) build();
  const t = now / 1000;
  for (const s of sprites) s.update(dt, t, env);
  draw(t);
}

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
  build();
  draw(performance.now() / 1000);
}

function start() {
  if (running || reduceMotion() || document.visibilityState !== 'visible') { if (layers) draw(performance.now() / 1000); return; }
  running = true; last = performance.now();
  requestAnimationFrame(frame);
}

export function setScene(id) {
  sceneId = SCENES.some(s => s.id === id) ? id : SCENES[0].id;
  try { localStorage.setItem('foundations-scene', sceneId); } catch {}
  document.querySelectorAll('[data-scene]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.scene === sceneId)));
  if (canvas) resize();
}

export function initScene() {
  canvas = document.createElement('canvas');
  canvas.id = 'scene';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  ctx = canvas.getContext('2d');
  let saved = null;
  try { saved = localStorage.getItem('foundations-scene'); } catch {}
  setScene(saved ?? SCENES[Math.floor(Math.random() * SCENES.length)].id);
  let timer;
  addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(resize, 200); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { if (Date.now() - lastPaint > 60000) build(); start(); } else running = false; });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { running = false; start(); });
  start();
}
