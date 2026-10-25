/* Home: the route. A 3D globe on capable screens (an illustrated map on phones and lighter
   devices) draws a dotted route from Karachi to each destination as you scroll, while the copy
   steps through the stops. Below: three ways to travel, the departures board, and why us. */

import { ScrollTrigger } from '../core/motion.js';
import { LITE, REDUCED, isSmall } from '../core/env.js';
import { idle, esc, fmt } from '../core/ui.js';
import { PACKAGES, TOURS, TESTIMONIALS, LEG0, LEGW, STOPS } from '../data.js';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const flipDate = (iso) => { const d = new Date(iso + 'T00:00'); return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`; };

// tour departures are fixed group dates
const TOUR_DATES = { hunza: ['2027-04-10', '2027-05-08'], skardu: ['2027-05-15'], dubai: ['2026-11-20', '2026-12-18', '2027-01-15'], turkey: ['2026-11-26', '2027-03-18'] };
const CODES = { hunza: 'GIL', skardu: 'KDU', dubai: 'DXB', turkey: 'IST' };

export function board() {
  const rows = [
    ...PACKAGES.flatMap((p) => p.departures.map((d) => ({ d, code: 'JED', trip: `Umrah · ${p.name}, ${p.nights} nights`, seats: p.seats, price: p.price.quad, href: `/umrah#${p.id}` }))),
    ...TOURS.flatMap((t) => (TOUR_DATES[t.id] || []).map((d) => ({ d, code: CODES[t.id], trip: `${t.name} · ${t.days} days`, seats: 12, price: t.price, href: `/tours#${t.id}` }))),
  ].filter((r) => r.d >= '2026-10-23').sort((a, b) => a.d.localeCompare(b.d)).slice(0, 8);
  return rows.map((r, i) => `<a class="board-row" role="row" href="${r.href}" data-flip-row>
      <span role="cell" class="board-date mono" data-flip>${flipDate(r.d)}</span>
      <span role="cell" class="board-code mono"><span data-flip>KHI</span><i></i><span data-flip>${r.code}</span></span>
      <span role="cell" class="board-trip">${esc(r.trip)}</span>
      <span role="cell" class="board-seats mono${r.seats < 8 ? ' is-low' : ''}">${String(r.seats - (i % 3)).padStart(2, '0')} left</span>
      <span role="cell" class="board-price">${fmt(r.price)}</span>
    </a>`).join('');
}

export async function mount(root, ctx) {
  const q = (s) => root.querySelector(s);
  const cleanups = [];
  q('[data-board]').innerHTML = board();
  q('[data-says]').innerHTML = TESTIMONIALS.map((t) => `<figure data-reveal><blockquote class="display">“${esc(t.q)}”</blockquote><figcaption><b>${esc(t.who)}</b><span class="label">${esc(t.where)}</span></figcaption></figure>`).join('');

  /* ---------- the journey ---------- */
  const sec = q('[data-journey]');
  const panes = [...root.querySelectorAll('[data-jc]')];
  const ticks = [...root.querySelectorAll('[data-tk]')];
  let scene = null, ch = -1;
  function apply(p) {
    scene?.setProgress(p);
    const li = Math.floor((p - LEG0) / LEGW);
    const c = p < LEG0 ? 0 : li >= STOPS.length ? STOPS.length + 1 : li + 1;
    if (c !== ch) {
      ch = c;
      panes.forEach((el, i) => el.classList.toggle('is-on', i === c));
      ticks.forEach((el, i) => { el.classList.toggle('is-on', i === Math.min(c, STOPS.length)); el.classList.toggle('is-past', i < c); });
    }
    sec.classList.toggle('is-moving', p > 0.02);
  }

  const useMap = LITE || isSmall();
  sec.classList.toggle('use-map', useMap);
  idle().then(async () => {
    if (!root.isConnected) return;
    try {
      if (useMap) {
        const { mountRouteMap } = await import('../core/routemap.js');
        if (!root.isConnected) return;
        scene = await mountRouteMap(q('[data-route-map]'));
      } else {
        const { mountGlobe } = await import('../three/globe.js');
        if (!root.isConnected) return;
        scene = mountGlobe(q('[data-globe]'), { labels: q('[data-globe-labels]') });
        cleanups.push(() => scene.dispose());
      }
      apply(REDUCED ? 1 : ScrollTrigger.getById?.('journey')?.progress || 0);
    } catch (err) {
      console.warn('Globe unavailable, using the map', err);
      sec.classList.add('use-map');
      const { mountRouteMap } = await import('../core/routemap.js');
      scene = await mountRouteMap(q('[data-route-map]'));
    }
  });

  const devP = import.meta.env.DEV && new URLSearchParams(location.search).get('jp');
  if (devP) { const p = Number(devP); const t = setInterval(() => { if (scene) { scene.setProgress(p, true); apply(p); } }, 300); cleanups.push(() => clearInterval(t)); }
  else if (REDUCED) apply(1);
  else ctx.add(() => ScrollTrigger.create({ id: 'journey', trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 1, onUpdate: (s) => apply(s.progress) }));
  apply(0);

  return () => cleanups.forEach((fn) => fn());
}
