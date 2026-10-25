/* Tours: the postcard stack (3D on capable screens, a sideways swipe on phones). Open a card and
   its itinerary unfolds: the days appear one by one as a dotted route draws across a small map. */

import { gsap, ScrollTrigger, lockScroll, lenis } from '../core/motion.js';
import { LITE, REDUCED, isSmall } from '../core/env.js';
import { idle, esc, fmt } from '../core/ui.js';
import { drawBase, arcPath, frameFor, scaleBar, loadWorld, PK, ROUTE_COUNTRIES } from '../core/map.js';
import { TOURS, tour, img } from '../data.js';

const N = TOURS.length;

function info(t, i) {
  return `<p class="mono card-count">${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}</p>
    <h2 class="display">${esc(t.name)}</h2>
    <p class="card-region">${esc(t.region)}</p>
    <p class="card-line">${esc(t.line)}</p>
    <dl class="card-facts"><div><dt class="label">Days</dt><dd>${t.days}</dd></div><div><dt class="label">Season</dt><dd>${esc(t.season)}</dd></div><div><dt class="label">Per person</dt><dd>${fmt(t.price)}</dd></div></dl>
    <button type="button" class="btn btn-coral" data-open="${t.id}"><span>Open the itinerary</span></button>`;
}

function swipeCard(t) {
  return `<article class="pc" data-pc="${t.id}">
    <button type="button" class="pc-face" data-open="${t.id}" aria-label="Open the ${esc(t.name)} itinerary">
      <img src="${img(t.photo, 640)}" alt="" loading="lazy" onload="this.classList.add('is-loaded')">
      <span class="pc-cap"><small class="mono">Greetings from</small><b>${esc(t.name)}</b></span>
      <span class="pc-days mono">${t.days} days · Rihla</span>
    </button>
    <div class="pc-info"><p>${esc(t.line)}</p><p class="mono">${fmt(t.price)} · ${t.days} days</p></div>
  </article>`;
}

/* ---------- the itinerary: a small map and the days, unfolding together ---------- */
async function drawItinerary(svg, t) {
  svg.innerHTML = '';
  // frame the stops to the shape of the map panel
  const r = svg.parentElement.getBoundingClientRect();
  const aspect = r.width && r.height ? Math.min(1.8, Math.max(0.6, r.width / r.height)) : 0.8;
  const p = await drawBase(svg, frameFor(t.itinerary.map((d) => d.at), aspect), 800, { highlight: [PK, ...ROUTE_COUNTRIES], terrain: t.terrain });
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  // one pin per place; days that stay put share a pin
  const places = [];
  t.itinerary.forEach((d) => {
    const last = places[places.length - 1];
    const same = places.find((pl) => Math.abs(pl.at[0] - d.at[0]) < 0.02 && Math.abs(pl.at[1] - d.at[1]) < 0.02);
    if (last && last === same) last.days.push(d.day);
    else if (same) same.days.push(d.day);
    else places.push({ at: d.at, days: [d.day], name: d.place });
  });
  const steps = [];
  t.itinerary.forEach((d, i) => { if (i) { const a = p(t.itinerary[i - 1].at), b = p(d.at); if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 2) steps.push({ day: d.day, d: arcPath(a, b, i % 2 ? 0.18 : -0.18) }); } });
  let html = '<defs>' + steps.map((s, i) => `<mask id="it-m${i}" maskUnits="userSpaceOnUse"><path d="${s.d}" pathLength="1" class="it-reveal" data-step="${s.day}"/></mask>`).join('') + '</defs>';
  html += steps.map((s, i) => `<path class="it-route" d="${s.d}" mask="url(#it-m${i})"/>`).join('');
  html += places.map((pl) => { const [x, y] = p(pl.at); const lab = pl.days.length > 1 ? `${pl.days[0]}–${pl.days[pl.days.length - 1]}` : pl.days[0]; const left = x > 560; return `<g class="it-pin" data-pin="${pl.days.join(' ')}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="15"/><text dy="5">${lab}</text><text class="it-name" x="${left ? -24 : 24}" dy="5" text-anchor="${left ? 'end' : 'start'}">${esc(pl.name)}</text></g>`; }).join('');
  html += scaleBar(p, 40, p.height - 40);
  svg.insertAdjacentHTML('beforeend', html);
}

export function mount(root, ctx) {
  const q = (s) => root.querySelector(s);
  const cleanups = [];
  idle().then(loadWorld); // the itinerary maps open instantly
  const sec = q('[data-cards]');
  const infoBox = q('[data-card-info]');
  const dots = q('[data-card-dots]');
  dots.innerHTML = TOURS.map((t, i) => `<li><button type="button" data-go="${i}" aria-label="${esc(t.name)}"></button></li>`).join('');
  let index = 0;
  function show(i) {
    index = i;
    infoBox.innerHTML = info(TOURS[i], i);
    if (!REDUCED) gsap.fromTo(infoBox.children, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.05, ease: 'expo.out' });
    dots.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
  }
  show(0);

  /* ---------- the stack, or the swipe ---------- */
  const useSwipe = LITE || isSmall();
  sec.classList.toggle('use-swipe', useSwipe);
  let stack = null, st = null;
  const scrollToCard = (i) => {
    if (!st) return;
    const y = st.start + (st.end - st.start) * (i / (N - 1));
    if (lenis) lenis.scrollTo(y + 2, { duration: 1.2 }); else window.scrollTo({ top: y + 2, behavior: REDUCED ? 'auto' : 'smooth' });
  };
  if (useSwipe) {
    const sw = q('[data-swipe]');
    sw.innerHTML = TOURS.map(swipeCard).join('');
    const io = new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) show(TOURS.findIndex((t) => t.id === en.target.dataset.pc)); }), { root: sw, threshold: 0.6 });
    sw.querySelectorAll('[data-pc]').forEach((c) => io.observe(c));
    cleanups.push(() => io.disconnect());
    dots.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) sw.children[Number(b.dataset.go)].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); });
    q('[data-card-hint] span').textContent = 'Swipe sideways · tap a card to open it';
  } else {
    idle().then(async () => {
      if (!root.isConnected) return;
      const { mountPostcards } = await import('../three/postcards.js');
      if (!root.isConnected) return;
      stack = mountPostcards(q('[data-postcards]'), TOURS, { onChange: (i) => i !== index && show(i), onOpen: (i) => open(TOURS[i].id) });
      cleanups.push(() => stack.dispose());
      stack.setIndex((st?.progress || 0) * (N - 1), true);
    });
    ctx.add(() => {
      st = ScrollTrigger.create({
        trigger: sec, start: 'top top', end: 'bottom bottom',
        snap: { snapTo: 1 / (N - 1), duration: { min: 0.3, max: 0.8 }, delay: 0.12, ease: 'power2.inOut' },
        onUpdate: (s) => stack?.setIndex(s.progress * (N - 1)),
      });
    });
    dots.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) scrollToCard(Number(b.dataset.go)); });
  }
  root.addEventListener('click', (e) => { const b = e.target.closest('[data-open]'); if (b) open(b.dataset.open); });

  /* ---------- itinerary ---------- */
  const dlg = q('[data-itin]'), daysBox = q('[data-itin-days]'), svg = q('[data-itin-map]');
  let tl = null, lastFocus = null;
  async function open(id) {
    const t = tour(id);
    if (!t) return;
    lastFocus = document.activeElement;
    q('[data-itin-kicker]').textContent = `${t.region} · ${t.season}`;
    q('[data-itin-title]').innerHTML = `${esc(t.name)}, <em>day by day</em>`;
    q('[data-itin-meta]').textContent = `${t.days} days · ${fmt(t.price)} per person · from Karachi`;
    q('[data-itin-enquire]').href = `/enquire?pkg=${t.id}`;
    daysBox.innerHTML = t.itinerary.map((d) => `<li data-day="${d.day}"><span class="itin-n mono">Day ${d.day}</span><div><b>${esc(d.title)}</b><p>${esc(d.text)}</p></div></li>`).join('');
    dlg.hidden = false;
    lockScroll(true);
    requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add('is-open')));
    q('[data-itin-close]').focus({ preventScroll: true });
    await drawItinerary(svg, t);
    if (dlg.hidden) return;
    history.replaceState(history.state, '', `#${t.id}`);
    // unfold: each day folds open in turn while its leg of the route draws and its pin lands
    tl?.kill();
    const items = [...daysBox.children];
    if (REDUCED) { items.forEach((el) => el.classList.add('is-on')); svg.querySelectorAll('.it-reveal').forEach((r) => (r.style.strokeDashoffset = 0)); svg.querySelectorAll('.it-pin').forEach((pn) => pn.classList.add('is-on')); return; }
    tl = gsap.timeline({ delay: 0.5 });
    items.forEach((el, i) => {
      const day = Number(el.dataset.day);
      const at = i * 0.42;
      tl.fromTo(el, { rotationX: -80, opacity: 0, transformOrigin: '50% 0%' }, { rotationX: 0, opacity: 1, duration: 0.8, ease: 'expo.out', onStart: () => el.classList.add('is-on') }, at);
      svg.querySelectorAll(`.it-reveal[data-step="${day}"]`).forEach((r) => tl.fromTo(r, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power1.inOut' }, at));
      const pin = [...svg.querySelectorAll('.it-pin')].find((pn) => pn.dataset.pin.split(' ')[0] === String(day));
      if (pin) tl.add(() => pin.classList.add('is-on'), at + 0.42);
    });
    setTimeout(() => { if (tl && tl.progress() === 0) tl.progress(1); }, 3500); // stalled frames never hide the days
  }
  function close() {
    dlg.classList.remove('is-open');
    lockScroll(false);
    setTimeout(() => { dlg.hidden = true; }, REDUCED ? 0 : 700);
    history.replaceState(history.state, '', location.pathname);
    lastFocus?.focus?.({ preventScroll: true });
  }
  q('[data-itin-close]').addEventListener('click', close);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  // hovering a day lifts its pin
  daysBox.addEventListener('pointerover', (e) => {
    const li = e.target.closest('[data-day]');
    svg.querySelectorAll('.it-pin').forEach((pn) => pn.classList.toggle('is-hot', !!li && pn.dataset.pin.split(' ').includes(li.dataset.day)));
  });
  const onKey = (e) => { if (e.key === 'Escape' && !dlg.hidden) close(); };
  document.addEventListener('keydown', onKey);
  cleanups.push(() => { document.removeEventListener('keydown', onKey); tl?.kill(); if (!dlg.hidden) lockScroll(false); });

  // /tours#hunza opens that card's itinerary
  const fromHash = location.hash.slice(1);
  if (tour(fromHash)) setTimeout(() => { const i = TOURS.findIndex((t) => t.id === fromHash); show(i); open(fromHash); }, 500);

  return () => cleanups.forEach((fn) => fn());
}
