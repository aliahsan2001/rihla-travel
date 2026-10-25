/* Page transition: soft clouds drift in from the edges, the screen goes white as if flying
   through them, then they part to reveal the next page. The clouds are painted once on a canvas
   from layered puffs. CSS does the motion; timers resolve the promises, so a stalled frame never
   hangs navigation. */

import { REDUCED } from './env.js';

function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

// a cumulus: a heap of soft puffs, shaded a little blue-grey underneath
function paintCloud(seed) {
  const W = 640, H = 400, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d'), r = rng(seed);
  const puffs = Array.from({ length: 46 }, () => {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    return { x: W / 2 + Math.cos(a) * d * W * 0.34, y: H * 0.56 + Math.sin(a) * d * H * 0.22 - (1 - d) * H * 0.12, s: (0.3 + 0.7 * (1 - d)) * W * 0.16 + r() * 30 };
  });
  const blob = (x, y, s, col) => {
    const grd = g.createRadialGradient(x, y, 0, x, y, s);
    grd.addColorStop(0, col); grd.addColorStop(0.55, col.replace(/[\d.]+\)$/, (m) => `${parseFloat(m) * 0.6})`)); grd.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, s, 0, Math.PI * 2); g.fill();
  };
  puffs.forEach((p) => blob(p.x, p.y + p.s * 0.28, p.s, 'rgba(150,200,210,0.5)'));
  puffs.forEach((p) => blob(p.x, p.y, p.s * 0.92, 'rgba(255,255,255,0.9)'));
  return c.toDataURL('image/webp', 0.8);
}

let el;
function build() {
  el = document.createElement('div');
  el.className = 'clouds';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = [1, 2, 3, 4].map((i) => `<span class="cloud c${i}"></span>`).join('');
  el.querySelectorAll('.cloud').forEach((c, i) => (c.style.backgroundImage = `url(${paintCloud(7 + i * 13)})`));
  document.body.appendChild(el);
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function cover() {
  if (!el) build();
  el.classList.remove('is-parting');
  el.classList.add('is-active');
  void el.offsetWidth;
  el.classList.add('is-shut');
  await wait(REDUCED ? 260 : 1000);
}

export async function reveal() {
  if (!el) return;
  await wait(REDUCED ? 0 : 140); // a beat inside the cloud
  el.classList.remove('is-shut');
  el.classList.add('is-parting');
  await wait(REDUCED ? 260 : 1050);
  el.classList.remove('is-active', 'is-parting');
}

// paint the clouds while the browser is idle, so the first transition starts at once
export function prepare() { if (!el) build(); }
