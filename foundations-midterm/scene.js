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

// ---------- the five scenes ----------
const BUILD = {
  harbor(r, w, h, pal, back, front) {
    const hz = h * 0.58, sea = h * 0.76;
    paint(back, r, poly([[0, hz], [w, hz], [w, sea], [0, sea]]), [0, hz, w, sea - hz],
      (x, y) => pal.shade(mix(hex('#5fb3a6'), hex('#1f6f78'), (y - hz) / (sea - hz))), {angle: 0, len: [10, 30], density: 0.02, width: [1.5, 3]});
    back.strokeStyle = css(pal.shade('#2c4a6a')); back.lineWidth = 3;
    back.beginPath(); back.moveTo(w * 0.42, hz + (sea - hz) * 0.55); back.lineTo(w * 0.95, hz + (sea - hz) * 0.5); back.stroke();
    // Rooftops, getting bigger toward the bottom.
    const roofs = ['#7f9cc9', '#5b77b0', '#3f5a96', '#6a86bd', '#4b64a0'];
    front.save();
    for (let y = sea - 6; y < h + 40;) {
      const s = 10 + ((y - sea) / (h - sea)) * 70;
      for (let x = -40; x < w + 40;) {
        const rw = s * between(r, 1.2, 2.6), rh = s * between(r, 0.5, 0.8);
        const roof = r() < 0.06 ? '#c96a4a' : roofs[Math.floor(r() * roofs.length)];
        front.fillStyle = css(pal.shade(roof));
        front.fill(poly([[x, y], [x + rw, y], [x + rw - s * 0.3, y - rh], [x + s * 0.3, y - rh]]));
        front.fillStyle = css(pal.shade(mix(hex(roof), [20, 30, 60], 0.45)));
        front.fillRect(x, y, rw, s * 0.7);
        windows(front, r, x, y, rw, s * 0.7, pal, 0.35, Math.max(2, s / 12));
        x += rw + between(r, -s * 0.2, s * 0.3);
      }
      y += s * 0.55;
    }
    front.restore();
    paint(front, r, poly([[0, sea - 30], [w, sea - 30], [w, h], [0, h]]), [0, sea - 30, w, h - sea + 30], pal.shade('#4a64a0'), {fill: false, density: 0.006, alpha: [0.15, 0.35]});
    // Power lines
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
        x += bw + between(r, 2, 14);
      }
    }
    paint(back, r, poly([[0, hz], [w, hz], [w, river], [0, river]]), [0, hz, w, river - hz],
      (x, y) => pal.shade(mix(hex('#6a8ab8'), hex('#2f4c78'), (y - hz) / (river - hz))), {angle: 0, len: [12, 34], density: 0.02});
    // Bridge with arches
    const deck = hz + (river - hz) * 0.45;
    front.fillStyle = css(pal.shade('#3a4a7a'));
    front.fillRect(0, deck, w, 8);
    for (let x = 0; x < w; x += 120) {
      const arch = new Path2D(); arch.rect(x, deck + 8, 120, river - deck - 8); arch.moveTo(x + 105, river); arch.ellipse(x + 60, river, 45, (river - deck) * 0.65, 0, 0, Math.PI, true);
      front.fill(arch, 'evenodd');
    }
    paint(front, r, poly([[0, river], [w, river], [w, h], [0, h]]), [0, river, w, h - river], pal.shade('#2c3864'), {density: 0.012});
    for (let x = -30; x < w + 30;) {
      const bw = between(r, 60, 140), bh = between(r, 30, 120);
      const p = poly([[x, h], [x, h - bh], [x + bw, h - bh], [x + bw, h]]);
      paint(front, r, p, [x, h - bh, bw, bh], pal.shade(['#3d4a80', '#4a3f70', '#2f3e6c'][Math.floor(r() * 3)]), {density: 0.015});
      windows(front, r, x, h - bh, bw, bh, pal, 0.25, 4);
      x += bw + between(r, 10, 60);
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
    const greens = ['#2f5a4a', '#24493e', '#1b3a33', '#3a6a52'];
    for (const [y0, sMin, sMax, step] of [[h * 0.74, 30, 60, 16], [h * 0.86, 50, 100, 24], [h * 1.02, 90, 170, 40]]) {
      const ground = poly([[0, y0 - 10], [w, y0 - 10], [w, h], [0, h]]);
      paint(front, r, ground, [0, y0 - 10, w, h - y0 + 10], pal.shade('#24433a'), {density: 0.01});
      for (let x = -20; x < w + 20; x += step * between(r, 0.6, 1.4)) {
        const s = between(r, sMin, sMax), g = greens[Math.floor(r() * greens.length)];
        const tree = poly([[x, y0 - s * 1.6], [x + s * 0.32, y0 - s * 0.8], [x + s * 0.2, y0 - s * 0.8], [x + s * 0.42, y0], [x - s * 0.42, y0], [x - s * 0.2, y0 - s * 0.8], [x - s * 0.32, y0 - s * 0.8]]);
        paint(front, r, tree, [x - s * 0.45, y0 - s * 1.6, s * 0.9, s * 1.6], pal.shade(g), {density: 0.03, angle: -2.2, len: [4, 9]});
      }
    }
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
        const p = poly([[x, base], [x + mw * 0.12, base - mh], [x + mw * 0.85, base - mh], [x + mw, base]]);
        paint(back, r, p, [x, base - mh, mw, mh], (px, py) => pal.shade(mix(hex(color), hex('#7a3a3a'), (py - (base - mh)) / mh * 0.5)), {density: 0.02, angle: -1.4, len: [5, 12]});
      }
    }
    const floor = poly([[0, h * 0.72], [w * 0.3, h * 0.7], [w * 0.7, h * 0.74], [w, h * 0.71], [w, h], [0, h]]);
    paint(front, r, floor, [0, h * 0.69, w, h * 0.31], (x, y) => pal.shade(mix(hex('#e6b884'), hex('#c98a5a'), (y - h * 0.7) / (h * 0.3))), {density: 0.014, angle: -0.15, len: [10, 24]});
    for (let i = 0; i < 6; i++) {
      const x = between(r, 0, w), y = between(r, h * 0.78, h * 0.98), s = between(r, 30, 80);
      const c = new Path2D();
      c.roundRect(x - s * 0.08, y - s, s * 0.16, s, s * 0.08);
      c.roundRect(x - s * 0.36, y - s * 0.62, s * 0.12, s * 0.34, s * 0.06); c.roundRect(x - s * 0.36, y - s * 0.34, s * 0.3, s * 0.1, s * 0.05);
      c.roundRect(x + s * 0.24, y - s * 0.8, s * 0.12, s * 0.4, s * 0.06); c.roundRect(x + s * 0.06, y - s * 0.46, s * 0.3, s * 0.1, s * 0.05);
      paint(front, r, c, [x - s * 0.4, y - s, s * 0.8, s], pal.shade('#4f7a5a'), {density: 0.06, angle: -1.57, len: [3, 7], width: [1, 2]});
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
    const chimneys = [];
    for (let x = between(r, 0, 60); x < w; x += between(r, 110, 220)) {
      const y = between(r, h * 0.82, h * 0.95), s = between(r, 34, 60);
      if (r() < 0.35) {
        const tree = poly([[x, y - s * 1.7], [x + s * 0.45, y], [x - s * 0.45, y]]);
        paint(front, r, tree, [x - s * 0.5, y - s * 1.7, s, s * 1.7], (px, py) => pal.shade(r() < 0.3 ? '#eef3fa' : '#2f5a4a'), {density: 0.04, angle: -2, len: [3, 8]});
        continue;
      }
      const wall = ['#b0644e', '#7a8fb0', '#c4a070', '#8a6a9a'][Math.floor(r() * 4)];
      paint(front, r, poly([[x, y], [x, y - s * 0.7], [x + s * 1.3, y - s * 0.7], [x + s * 1.3, y]]), [x, y - s * 0.7, s * 1.3, s * 0.7], pal.shade(wall), {density: 0.03, angle: -1.5, len: [3, 8]});
      paint(front, r, poly([[x - s * 0.12, y - s * 0.68], [x + s * 0.65, y - s * 1.2], [x + s * 1.42, y - s * 0.68]]), [x - s * 0.12, y - s * 1.2, s * 1.55, s * 0.55], pal.shade('#f4f7fc'), {density: 0.04, angle: -0.3, len: [3, 8]});
      front.fillStyle = css(pal.shade('#5a4a4a')); front.fillRect(x + s * 0.95, y - s * 1.12, s * 0.14, s * 0.3);
      chimneys.push([x + s * 1.02, y - s * 1.14]);
      front.fillStyle = pal.dark ? 'rgba(255,206,110,0.95)' : css(pal.shade('#4a5a7a'));
      front.fillRect(x + s * 0.2, y - s * 0.5, s * 0.22, s * 0.2); front.fillRect(x + s * 0.8, y - s * 0.5, s * 0.22, s * 0.2);
    }
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
