/* Visas: a document checklist per country. Ticking an item stamps it, like a passport stamp
   coming down hard, and the same stamp lands on the passport page beside the list. Complete the
   list and the page gets its final stamp. Ticks are remembered in this browser. */

import { REDUCED } from '../core/env.js';
import { esc, store } from '../core/ui.js';
import { VISAS, visa } from '../data.js';

const KEY = 'rh-visa';
const CODES = { saudi: 'SA', uae: 'AE', turkey: 'TR', uk: 'UK', schengen: 'EU' };
const INKS = ['#0e6170', '#e5532f', '#2f8a5f', '#12263a', '#c77a12'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const today = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`; };
const rnd = (seed) => { const s = Math.sin(seed * 91.7) * 43758.5; return s - Math.floor(s); };

// worn ink: a speckled mask painted once and shared by every stamp
function inkMask() {
  if (document.documentElement.style.getPropertyValue('--ink')) return;
  const c = document.createElement('canvas');
  c.width = c.height = 160;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 160, 160);
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.7})`; g.beginPath(); g.arc(Math.random() * 160, Math.random() * 160, Math.random() * 1.6, 0, 7); g.fill(); }
  document.documentElement.style.setProperty('--ink', `url(${c.toDataURL()})`);
}

const stampHTML = (label, ink, rot, big = false) => `<span class="stamp${big ? ' stamp-big' : ''}" style="--ink-c:${ink};--rot:${rot}deg" aria-hidden="true"><span class="mono">${esc(label)}</span><small class="mono">${today()} · KHI</small></span>`;

export function mount(root) {
  const q = (s) => root.querySelector(s);
  inkMask();
  const saved = store.get(KEY, {}) || {};
  let current = VISAS.find((v) => location.hash.slice(1) === v.id)?.id || VISAS[0].id;

  q('[data-v-tabs]').innerHTML = VISAS.map((v) => `<button type="button" role="tab" class="chip" data-tab="${v.id}" aria-selected="false"><span class="mono">${CODES[v.id]}</span>${esc(v.name)}</button>`).join('');

  const list = q('[data-v-list]'), stamps = q('[data-pp-stamps]');
  function ticks() { return new Set(saved[current] || []); }
  function save(set) { saved[current] = [...set]; store.set(KEY, saved); }

  function progress() {
    const v = visa(current), set = ticks(), n = set.size, all = v.docs.length;
    q('[data-v-count]').textContent = `${n} of ${all} ready`;
    q('[data-v-bar]').style.transform = `scaleX(${(n / all).toFixed(3)})`;
    const done = n === all;
    q('[data-v-cta]').classList.toggle('is-done', done);
    q('[data-v-cta-text]').textContent = done ? 'Your file is complete. Send it over and we check every page within a working day.' : n ? `${all - n} to go. We can help with the bookings, the cover letter and the insurance.` : 'Tick the documents you have. The rest we\'ll help you get.';
    const finalStamp = stamps.querySelector('.stamp-big');
    if (done && !finalStamp) { stamps.insertAdjacentHTML('beforeend', stampHTML('File complete', '#a8503a', -8, true)); land(stamps.lastElementChild); }
    else if (!done && finalStamp) finalStamp.remove();
  }

  // a stamp comes down: big and blurred, then hard onto the paper with a small jolt
  function land(el, row) {
    if (REDUCED) return;
    el.classList.add('is-landing');
    row?.classList.add('is-jolt');
    setTimeout(() => { el.classList.remove('is-landing'); row?.classList.remove('is-jolt'); }, 700);
  }

  function pageStamp(i, animate) {
    const v = visa(current);
    const ink = INKS[i % INKS.length], rot = Math.round((rnd(i + 3) - 0.5) * 24);
    const col = i % 2, rowN = Math.floor(i / 2);
    const el = document.createElement('div');
    el.className = 'pp-stamp';
    el.dataset.i = i;
    el.style.left = `${6 + col * 47 + rnd(i) * 8}%`;
    el.style.top = `${4 + rowN * 22 + rnd(i + 9) * 6}%`;
    el.innerHTML = stampHTML(`${CODES[v.id]} · Doc ${String(i + 1).padStart(2, '0')}`, ink, rot);
    stamps.appendChild(el);
    if (animate) land(el.firstElementChild);
  }

  function render() {
    const v = visa(current), set = ticks();
    root.querySelectorAll('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === current)));
    q('[data-v-meta]').innerHTML = `<h2 class="display">${esc(v.name)}</h2><p class="v-kind">${esc(v.kind)}</p><dl><div><dt class="label">Processing</dt><dd>${esc(v.days)}</dd></div><div><dt class="label">Fee</dt><dd>${esc(v.fee)}</dd></div><div><dt class="label">Valid for</dt><dd>${esc(v.validity)}</dd></div></dl>`;
    list.innerHTML = v.docs.map((d, i) => `<li class="v-item${set.has(i) ? ' is-checked' : ''}" data-i="${i}">
        <label><input type="checkbox" ${set.has(i) ? 'checked' : ''}><span class="v-box" aria-hidden="true"><svg><use href="#i-check"/></svg></span><span class="v-doc">${esc(d)}</span></label>
        <span class="v-stamp-slot">${set.has(i) ? stampHTML('Ready', INKS[i % INKS.length], Math.round((rnd(i) - 0.5) * 20)) : ''}</span>
      </li>`).join('');
    stamps.innerHTML = '';
    [...set].sort((a, b) => a - b).forEach((i) => pageStamp(i, false));
    q('[data-pp-page]').textContent = String(7 + VISAS.findIndex((x) => x.id === current) * 2).padStart(2, '0');
    q('[data-v-enquire]').href = `/enquire?pkg=visa-${current}`;
    progress();
  }

  q('[data-v-tabs]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b || b.dataset.tab === current) return;
    current = b.dataset.tab;
    history.replaceState(history.state, '', `#${current}`);
    render();
  });
  list.addEventListener('change', (e) => {
    const li = e.target.closest('[data-i]');
    if (!li) return;
    const i = Number(li.dataset.i), set = ticks(), slot = li.querySelector('.v-stamp-slot');
    if (e.target.checked) {
      set.add(i);
      li.classList.add('is-checked');
      slot.innerHTML = stampHTML('Ready', INKS[i % INKS.length], Math.round((rnd(i) - 0.5) * 20));
      land(slot.firstElementChild, li);
      pageStamp(i, true);
    } else {
      set.delete(i);
      li.classList.remove('is-checked');
      slot.innerHTML = '';
      stamps.querySelector(`.pp-stamp[data-i="${i}"]`)?.remove();
    }
    save(set);
    progress();
  });
  render();
}
