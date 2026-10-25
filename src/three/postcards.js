/* Tours: a stack of 3D postcards. setIndex(s) (a float, from the scroll) lifts the top card,
   turns it over to show its written back, and sends it off the stack, revealing the next.
   Fronts are the tour's photograph with a printed caption; backs carry a note, a stamp and a
   postmark, all painted on canvases. Click the top card to open its itinerary. */

import * as THREE from 'three';
import { img } from '../data.js';

const W = 1.5, H = 1.0, CW = 1200, CH = 800;
const ease = (t) => 1 - Math.pow(1 - t, 3);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

function canvas(w = CW, h = CH) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

function paper(g, w, h, base = '#fff8ec') {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  let s = 5; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(18,38,58,${0.015 + r() * 0.025})`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1); }
}

function front(t, image) {
  const c = canvas(), g = c.getContext('2d'), m = 34;
  paper(g, CW, CH);
  if (image) {
    const iw = CW - m * 2, ih = CH - m * 2, k = Math.max(iw / image.width, ih / image.height);
    const sw = iw / k, sh = ih / k;
    g.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, m, m, iw, ih);
    const grd = g.createLinearGradient(0, CH * 0.45, 0, CH - m);
    grd.addColorStop(0, 'rgba(20,30,25,0)'); grd.addColorStop(1, 'rgba(20,30,25,.55)');
    g.fillStyle = grd; g.fillRect(m, m, iw, ih);
  } else { g.fillStyle = '#dfe6e1'; g.fillRect(m, m, CW - m * 2, CH - m * 2); }
  g.fillStyle = '#fff8ec';
  g.font = '500 26px "DM Mono", monospace';
  g.fillText('GREETINGS FROM', m + 46, CH - m - 150);
  g.font = '800 150px "Bricolage Grotesque", Arial Black, sans-serif';
  g.fillText(t.name, m + 36, CH - m - 44);
  g.font = '500 22px "DM Mono", monospace';
  g.textAlign = 'right';
  g.fillText(`${t.days} DAYS · RIHLA`, CW - m - 40, m + 54);
  return c;
}

function wrapText(g, text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); line = w; y += lh; } else line = test;
  }
  g.fillText(line, x, y);
}

function back(t, image) {
  const c = canvas(), g = c.getContext('2d');
  paper(g, CW, CH, '#fff3dd');
  // the divider and the address lines
  g.strokeStyle = 'rgba(18,38,58,.3)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(CW * 0.55, 90); g.lineTo(CW * 0.55, CH - 90); g.stroke();
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(CW * 0.6, 430 + i * 74); g.lineTo(CW - 80, 430 + i * 74); g.stroke(); }
  g.fillStyle = '#0e6170';
  g.font = '600 42px "Instrument Sans", sans-serif';
  ['To whoever', 'comes next,', 'with love'].forEach((l, i) => g.fillText(l, CW * 0.62, 418 + i * 74));
  // the note
  g.font = '700 54px "Bricolage Grotesque", Arial Black, sans-serif';
  wrapText(g, t.line, 80, 170, CW * 0.55 - 140, 64);
  g.font = '500 24px "DM Mono", monospace';
  g.fillStyle = '#e5532f';
  g.fillText(`${t.region.toUpperCase()}`, 80, CH - 150);
  g.fillText(`${t.days} DAYS · ${t.season.toUpperCase()}`, 80, CH - 110);
  // the stamp: a perforated edge round a crop of the photograph
  const sx = CW - 250, sy = 70, sw = 170, sh = 210;
  g.fillStyle = '#fffdf8';
  g.beginPath(); g.rect(sx - 10, sy - 10, sw + 20, sh + 20); g.fill();
  // perforations: bites of the card's own colour round the edge
  g.fillStyle = '#fff3dd';
  for (let x = sx - 10; x <= sx + sw + 10; x += 17) { g.beginPath(); g.arc(x, sy - 10, 6, 0, 7); g.fill(); g.beginPath(); g.arc(x, sy + sh + 10, 6, 0, 7); g.fill(); }
  for (let y = sy - 10; y <= sy + sh + 10; y += 17) { g.beginPath(); g.arc(sx - 10, y, 6, 0, 7); g.fill(); g.beginPath(); g.arc(sx + sw + 10, y, 6, 0, 7); g.fill(); }
  if (image) { const k = Math.max(sw / image.width, sh / image.height); g.drawImage(image, (image.width - sw / k) / 2, (image.height - sh / k) / 2, sw / k, sh / k, sx, sy, sw, sh - 40); }
  g.fillStyle = t.ink; g.fillRect(sx, sy + sh - 40, sw, 40);
  g.fillStyle = '#fff'; g.font = '500 20px "DM Mono", monospace'; g.textAlign = 'center';
  g.fillText(t.region.split(',').pop().trim().toUpperCase().slice(0, 14), sx + sw / 2, sy + sh - 13);
  // the postmark, half over the stamp
  g.save(); g.translate(sx - 30, sy + 150); g.rotate(-0.25);
  g.strokeStyle = 'rgba(229,83,47,.6)'; g.lineWidth = 4;
  g.beginPath(); g.arc(0, 0, 78, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, 62, 0, 7); g.stroke();
  g.fillStyle = 'rgba(229,83,47,.7)'; g.font = '600 20px "DM Mono", monospace';
  g.fillText('KARACHI', 0, -16); g.fillText('2026', 0, 22);
  for (let i = 0; i < 4; i++) { g.beginPath(); for (let x = 90; x < 300; x += 6) g.lineTo(x, -30 + i * 20 + Math.sin(x / 14) * 6); g.stroke(); }
  g.restore();
  return c;
}

function shadowTex() {
  const c = canvas(256, 192), g = c.getContext('2d');
  g.filter = 'blur(18px)'; g.fillStyle = 'rgba(18,38,58,.5)'; g.fillRect(40, 40, 176, 112);
  return new THREE.CanvasTexture(c);
}

export function mountPostcards(canvasEl, tours, { onChange, onOpen } = {}) {
  const wrap = canvasEl.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 4.4);
  scene.add(new THREE.HemisphereLight('#ffffff', '#f3dcc0', 1.7));
  const key = new THREE.DirectionalLight('#fff7ea', 1.2);
  key.position.set(-2, 3, 4);
  scene.add(key);

  const edge = new THREE.MeshLambertMaterial({ color: '#f4e7cf' });
  const shadow = shadowTex();
  const tilts = [-0.05, 0.04, -0.025, 0.06, -0.04];
  const cards = tours.map((t, i) => {
    const fc = front(t), bc = back(t);
    const ft = tex(fc), bt = tex(bc);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.012), [edge, edge, edge, edge, new THREE.MeshLambertMaterial({ map: ft }), new THREE.MeshLambertMaterial({ map: bt })]);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.45, H * 1.45), new THREE.MeshBasicMaterial({ map: shadow, transparent: true, opacity: 0.5, depthWrite: false }));
    sh.position.set(0.05, -0.07, -0.03);
    const g = new THREE.Group();
    g.add(sh, mesh);
    scene.add(g);
    // the photograph arrives after the fonts and the image have loaded; repaint both faces then
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => document.fonts.ready.then(() => {
      ft.image = front(t, im); ft.needsUpdate = true;
      bt.image = back(t, im); bt.needsUpdate = true;
      kick();
    });
    im.src = img(t.photo, 1280);
    return { t, g, mesh, sh, tilt: tilts[i % tilts.length] };
  });

  let s = 0, goal = 0, current = -1;
  const base = new THREE.Vector3();
  const mouse = new THREE.Vector2(), sm = new THREE.Vector2();
  function layout() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the card a comfortable size, right of centre on wide screens
    const fit = Math.max(1.9, 2.3 / Math.min(1.6, camera.aspect));
    camera.position.z = fit / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / 2 + 0.6;
    base.set(camera.aspect > 1.2 ? 0.42 : 0, camera.aspect > 1.2 ? 0.08 : 0.12, 0);
    camera.updateProjectionMatrix();
    kick();
  }

  function place() {
    cards.forEach((c, i) => {
      const d = i - s;
      const g = c.g;
      g.visible = d > -1.05;
      if (d >= 0) {
        const k = Math.min(d, 3);
        g.position.set(base.x + k * 0.05, base.y - k * 0.04, -k * 0.09);
        g.rotation.set(0, 0, c.tilt * Math.min(1, d));
        if (d < 0.5) { g.rotation.x = -sm.y * 0.08; g.rotation.y = sm.x * 0.12; }
        c.sh.material.opacity = 0.5;
      } else {
        const u = clamp(-d), e = ease(u);
        g.position.set(base.x - 3.4 * Math.pow(e, 1.3), base.y + 0.45 * Math.sin(Math.PI * u) + 0.7 * e, 0.55 * Math.sin(Math.PI * u));
        g.rotation.set(-0.25 * Math.sin(Math.PI * u), -Math.PI * 0.92 * e, c.tilt + 0.35 * e);
        c.sh.material.opacity = 0.5 * (1 - u);
      }
      g.renderOrder = cards.length - i;
    });
    const idx = Math.round(clamp(s, 0, cards.length - 1));
    if (idx !== current) { current = idx; onChange?.(idx); }
  }

  /* ---------- pointer ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const onMove = (e) => {
    const r = canvasEl.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    mouse.copy(ndc);
    ray.setFromCamera(ndc, camera);
    const top = cards[current]?.mesh;
    canvasEl.style.cursor = top && ray.intersectObject(top).length ? 'pointer' : '';
    kick();
  };
  const onClick = () => { const top = cards[current]?.mesh; ray.setFromCamera(ndc, camera); if (top && ray.intersectObject(top).length) onOpen?.(current); };
  canvasEl.addEventListener('pointermove', onMove);
  canvasEl.addEventListener('click', onClick);
  canvasEl.addEventListener('pointerleave', () => { mouse.set(0, 0); kick(); });

  let raf = 0, last = performance.now(), visible = true, dead = false;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
  io.observe(wrap);
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); // rAF time can predate last
    last = now;
    s += (goal - s) * (1 - Math.pow(0.004, dt));
    sm.lerp(mouse, 1 - Math.pow(0.02, dt));
    if (Math.abs(goal - s) < 0.0005) s = goal;
    place();
    if (dead || renderer.getContext().isContextLost()) { raf = 0; return; } // context gone after a page change
    renderer.render(scene, camera);
    const settling = s !== goal || sm.distanceTo(mouse) > 0.002;
    raf = settling && visible && !document.hidden && !dead ? requestAnimationFrame(frame) : 0;
  }
  function kick() { if (!raf && !dead) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  const ro = new ResizeObserver(layout);
  ro.observe(wrap);
  layout();
  place();
  frame(performance.now());
  canvasEl.classList.add('is-ready');

  return {
    setIndex(v, snap = false) { goal = v; if (snap) s = v; kick(); },
    dispose() {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => { m.map?.dispose(); m.dispose?.(); }); });
      shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
