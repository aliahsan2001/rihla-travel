/* Umrah: calm by design (soft fades, nothing playful). Package cards with full inclusions, prices
   that count up as they appear, and the signature compare: choose up to three and they slide in
   side by side as boarding passes, rows lined up, the best value in each row gently marked. */

import { gsap, lockScroll } from '../core/motion.js';
import { REDUCED } from '../core/env.js';
import { esc, fmt, toast, store } from '../core/ui.js';
import { setFlaps } from '../core/flip.js';
import { PACKAGES, SHARING, TRANSPORT, pkg, img } from '../data.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (iso) => { const d = new Date(iso + 'T00:00'); return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()].toUpperCase()}`; };
const stars = (n) => '★'.repeat(n);
const walk = (m) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`);
const KEY = 'rh-compare';

function countTo(el, to, from = Number(el.dataset.v || 0)) {
  el.dataset.v = to;
  if (REDUCED || from === to) { el.textContent = fmt(to); return; }
  const o = { v: from };
  gsap.to(o, { v: to, duration: from ? 0.8 : 1.6, ease: 'power2.out', onUpdate: () => (el.textContent = fmt(Math.round(o.v / 100) * 100)), onComplete: () => (el.textContent = fmt(to)) });
}

function card(p, sharing) {
  return `<article class="pk${p.popular ? ' is-popular' : ''}" id="${p.id}" data-pk="${p.id}">
    <figure class="pk-photo hover-img"><img src="${img(p.photo, 640)}" srcset="${img(p.photo, 640)} 640w, ${img(p.photo, 1280)} 1280w" sizes="(max-width: 760px) 100vw, 30vw" alt="" loading="lazy" onload="this.classList.add('is-loaded')">${p.popular ? '<span class="pk-badge mono">Most booked</span>' : ''}${p.season === 'ramadan' ? '<span class="pk-badge mono">Ramadan 2027</span>' : ''}</figure>
    <div class="pk-body">
      <div class="pk-top">
        <p class="pk-nights mono">${p.nights} nights · ${p.split[0]} Makkah · ${p.split[1]} Madinah</p>
        <h3 class="display">${esc(p.name)}</h3>
        <p class="pk-note">${esc(p.note)}</p>
      </div>
      <dl class="pk-facts">
        <div><dt><svg aria-hidden="true"><use href="#i-hotel"/></svg>Makkah hotel</dt><dd><span class="stars" aria-label="${p.stars} star">${stars(p.stars)}</span> ${esc(p.hotel)}</dd></div>
        <div><dt><svg aria-hidden="true"><use href="#i-walk"/></svg>To the Haram</dt><dd><b>${walk(p.distance)}</b> on foot</dd></div>
        <div><dt><svg aria-hidden="true"><use href="#i-moon"/></svg>Madinah</dt><dd>${esc(p.madinahHotel)}, ${walk(p.madinahDistance)}</dd></div>
        <div><dt><svg aria-hidden="true"><use href="#i-car"/></svg>Transport</dt><dd>${TRANSPORT[p.transport].label}</dd></div>
      </dl>
      <div class="pk-deps">
        <span class="label">Departures</span>
        <ul>${p.departures.map((d) => `<li data-flip-row><span data-flip>${short(d)}</span></li>`).join('')}</ul>
      </div>
      <details class="pk-more"><summary>Everything included</summary><ul>${p.includes.map((i) => `<li><svg aria-hidden="true"><use href="#i-check"/></svg>${esc(i)}</li>`).join('')}<li><svg aria-hidden="true"><use href="#i-check"/></svg>${esc(p.meals)}</li></ul></details>
    </div>
    <div class="pk-side">
      <p class="pk-price"><span data-price data-v="0">${fmt(0)}</span><small>per person, <span data-sharing-label>${sharing}</span> sharing</small></p>
      <p class="pk-seats mono">${p.seats} seats on the next departure</p>
      <label class="pk-compare"><input type="checkbox" data-choose value="${p.id}"><span class="pk-tick" aria-hidden="true"><svg><use href="#i-plus"/></svg></span><span>Compare</span></label>
      <a class="btn btn-coral btn-sm" href="/enquire?pkg=${p.id}"><span>Enquire</span></a>
    </div>
  </article>`;
}

/* ---------- the comparison: boarding passes, rows lined up ---------- */
const ROWS = [
  { key: 'hotel', label: 'Hotel', val: (p) => p.stars, best: 'max', show: (p) => `<span class="stars">${stars(p.stars)}</span><span>${esc(p.hotel)}</span>` },
  { key: 'distance', label: 'To the Haram', val: (p) => p.distance, best: 'min', show: (p) => `<b class="pass-big">${walk(p.distance)}</b><span>on foot</span>` },
  { key: 'nights', label: 'Nights', val: (p) => p.nights, best: 'max', show: (p) => `<b class="pass-big">${p.nights}</b><span>${p.split[0]} Makkah · ${p.split[1]} Madinah</span>` },
  { key: 'transport', label: 'Transport', val: (p) => TRANSPORT[p.transport].rank, best: 'max', show: (p) => `<span>${TRANSPORT[p.transport].label}</span>` },
  { key: 'price', label: 'Price', val: (p, s) => p.price[s], best: 'min', show: (p, s) => `<b class="pass-big">${fmt(p.price[s])}</b><span>per person, ${s}</span>` },
  { key: 'night', label: 'Per night', val: (p, s) => Math.round(p.price[s] / p.nights), best: 'min', show: (p, s) => `<span>${fmt(Math.round(p.price[s] / p.nights))} a night</span>` },
];
function passes(list, sharing) {
  const best = ROWS.map((r) => {
    const vals = list.map((p) => r.val(p, sharing));
    const b = r.best === 'max' ? Math.max(...vals) : Math.min(...vals);
    return list.length > 1 && new Set(vals).size > 1 ? vals.map((v) => v === b) : vals.map(() => false);
  });
  const labels = `<div class="pass pass-labels" aria-hidden="true"><div class="pass-top"></div>${ROWS.map((r) => `<div class="pass-row"><span class="label">${r.label}</span></div>`).join('')}<div class="pass-stub"></div></div>`;
  return labels + list.map((p, i) => `<article class="pass" style="--i:${i}" aria-label="${esc(p.name)} package">
      <div class="pass-top">
        <p class="pass-brand mono">Rihla · Umrah <span>${p.id.toUpperCase()}</span></p>
        <p class="pass-route mono"><b>KHI</b><i></i><svg aria-hidden="true"><use href="#i-plane"/></svg><i></i><b>JED</b></p>
        <h3 class="display">${esc(p.name)}</h3>
        <p class="mono pass-dep">Next · ${short(p.departures[0])}</p>
      </div>
      ${ROWS.map((r, k) => `<div class="pass-row${best[k][i] ? ' is-best' : ''}"><span class="label pass-label">${r.label}</span><div class="pass-val">${r.show(p, sharing)}</div>${best[k][i] ? '<span class="pass-flag mono">Best</span>' : ''}</div>`).join('')}
      <div class="pass-stub">
        <span class="barcode" aria-hidden="true"></span>
        <a class="btn btn-coral btn-sm" href="/enquire?pkg=${p.id}"><span>Enquire about this one</span></a>
      </div>
    </article>`).join('');
}

export function mount(root) {
  const q = (s) => root.querySelector(s);
  const state = { nights: 'all', stars: 'all', sharing: 'quad', chosen: (store.get(KEY, []) || []).filter((id) => pkg(id)).slice(0, 3) };
  const list = q('[data-packages]');
  list.innerHTML = PACKAGES.map((p) => card(p, state.sharing)).join('');
  root.querySelectorAll('[data-flip]').forEach((el) => setFlaps(el, el.textContent));
  const cards = [...list.querySelectorAll('[data-pk]')];

  // sharing toggle
  const sh = q('[data-sharing]');
  sh.innerHTML = SHARING.map((s) => `<button type="button" role="radio" aria-checked="${s.id === state.sharing}" data-s="${s.id}"><b>${s.label}</b><small>${s.note}</small></button>`).join('') + '<span class="sharing-pill" aria-hidden="true"></span>';
  const movePill = () => { const on = sh.querySelector('[aria-checked="true"]'); const pill = sh.querySelector('.sharing-pill'); pill.style.width = on.offsetWidth + 'px'; pill.style.transform = `translateX(${on.offsetLeft - 4}px)`; };
  requestAnimationFrame(movePill);
  addEventListener('resize', movePill);

  // prices count up the first time each card appears
  const seen = new WeakSet();
  const io = new IntersectionObserver((ens) => ens.forEach((en) => {
    if (!en.isIntersecting || seen.has(en.target)) return;
    seen.add(en.target);
    en.target.classList.add('is-in');
    countTo(en.target.querySelector('[data-price]'), pkg(en.target.dataset.pk).price[state.sharing]);
  }), { rootMargin: '0px 0px -12% 0px' });
  cards.forEach((c) => io.observe(c));

  function filter() {
    let n = 0;
    cards.forEach((c) => {
      const p = pkg(c.dataset.pk);
      const okN = state.nights === 'all' || (state.nights === 'short' ? p.nights <= 10 : state.nights === 'mid' ? p.nights > 10 && p.nights <= 15 : p.nights > 15);
      const okS = state.stars === 'all' || String(p.stars) === state.stars;
      const show = okN && okS;
      if (show) n++;
      if (show && c.hidden) { c.hidden = false; c.style.opacity = 0; requestAnimationFrame(() => (c.style.opacity = '')); }
      else if (!show) c.hidden = true;
    });
    q('[data-count-line]').textContent = `${n} of ${PACKAGES.length} packages`;
    q('[data-empty]').hidden = n > 0;
  }
  root.querySelectorAll('[data-filter]').forEach((g) => g.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]');
    if (!b) return;
    g.querySelectorAll('[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    state[g.dataset.filter] = b.dataset.v;
    filter();
  }));
  sh.addEventListener('click', (e) => {
    const b = e.target.closest('[data-s]');
    if (!b || b.dataset.s === state.sharing) return;
    state.sharing = b.dataset.s;
    sh.querySelectorAll('[data-s]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    movePill();
    cards.forEach((c) => {
      c.querySelector('[data-sharing-label]').textContent = state.sharing;
      if (seen.has(c)) countTo(c.querySelector('[data-price]'), pkg(c.dataset.pk).price[state.sharing]);
    });
    if (!cmp.hidden) renderPasses();
  });
  filter();

  /* ---------- choosing and comparing ---------- */
  const tray = q('[data-tray]'), cmp = q('[data-compare]');
  function syncChosen() {
    store.set(KEY, state.chosen);
    root.querySelectorAll('[data-choose]').forEach((cb) => { cb.checked = state.chosen.includes(cb.value); cb.closest('.pk').classList.toggle('is-chosen', cb.checked); });
    q('[data-tray-count]').textContent = state.chosen.length;
    q('[data-tray-names]').textContent = state.chosen.length ? ' · ' + state.chosen.map((id) => pkg(id).name).join(', ') : '';
    q('[data-tray-open]').disabled = state.chosen.length < 2;
    tray.classList.toggle('is-up', state.chosen.length > 0);
  }
  list.addEventListener('change', (e) => {
    const cb = e.target.closest('[data-choose]');
    if (!cb) return;
    if (cb.checked) {
      if (state.chosen.length >= 3) { cb.checked = false; toast('Three at a time. Untick one to swap it.'); return; }
      state.chosen.push(cb.value);
    } else state.chosen = state.chosen.filter((id) => id !== cb.value);
    syncChosen();
  });
  q('[data-tray-clear]').addEventListener('click', () => { state.chosen = []; syncChosen(); });

  function renderPasses() {
    const chosen = state.chosen.map(pkg);
    const box = q('[data-passes]');
    box.style.setProperty('--n', chosen.length);
    box.innerHTML = passes(chosen, state.sharing);
  }
  let lastFocus = null;
  function open() {
    if (state.chosen.length < 2) return;
    lastFocus = document.activeElement;
    renderPasses();
    cmp.hidden = false;
    lockScroll(true);
    requestAnimationFrame(() => requestAnimationFrame(() => cmp.classList.add('is-open')));
    q('[data-compare-close]').focus({ preventScroll: true });
  }
  function close() {
    cmp.classList.remove('is-open');
    lockScroll(false);
    setTimeout(() => { cmp.hidden = true; }, REDUCED ? 0 : 600);
    lastFocus?.focus?.({ preventScroll: true });
  }
  q('[data-tray-open]').addEventListener('click', open);
  q('[data-compare-close]').addEventListener('click', close);
  cmp.addEventListener('click', (e) => { if (e.target === cmp) close(); });
  const onKey = (e) => { if (e.key === 'Escape' && !cmp.hidden) close(); };
  document.addEventListener('keydown', onKey);
  syncChosen();

  return () => {
    io.disconnect();
    removeEventListener('resize', movePill);
    document.removeEventListener('keydown', onKey);
    if (!cmp.hidden) lockScroll(false);
  };
}
