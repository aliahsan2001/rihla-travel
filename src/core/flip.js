/* Departure dates that flip like an airport board on hover. Each [data-flip] element is split
   into flaps; hovering its row ([data-flip-row], or the element itself) riffles every flap
   through a few characters before it settles back on the real one, left to right. */

import { REDUCED } from './env.js';

const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function setFlaps(el, text) {
  el.setAttribute('aria-label', text);
  el.dataset.text = text;
  el.innerHTML = [...text].map((c) => `<span class="flap${c === ' ' ? ' is-space' : ''}" aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
}

export function riffle(el) {
  if (REDUCED || el._riffling) return;
  el._riffling = true;
  const flaps = [...el.querySelectorAll('.flap')], text = [...el.dataset.text];
  let done = 0;
  flaps.forEach((f, i) => {
    if (text[i] === ' ') { done++; return; }
    let n = 3 + (i % 3);
    const tick = () => {
      f.classList.remove('is-turn'); void f.offsetWidth; f.classList.add('is-turn');
      f.textContent = n > 0 ? POOL[(Math.random() * POOL.length) | 0] : text[i];
      if (n-- > 0) setTimeout(tick, 55);
      else if (++done === flaps.length) el._riffling = false;
    };
    setTimeout(tick, i * 28);
  });
  if (done === flaps.length) el._riffling = false;
}

export function flipBoards(root) {
  root.querySelectorAll('[data-flip]').forEach((el) => {
    if (!el.dataset.text) setFlaps(el, el.textContent.trim());
    const row = el.closest('[data-flip-row]') || el;
    if (row._flipWired) return;
    row._flipWired = true;
    row.addEventListener('pointerenter', () => row.querySelectorAll('[data-flip]').forEach(riffle));
    row.addEventListener('focusin', () => row.querySelectorAll('[data-flip]').forEach(riffle));
  });
}
