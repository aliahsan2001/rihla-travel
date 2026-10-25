/* Enquire: the form is a boarding pass. The destination code flips like a departures board when
   you pick a trip; on submit the pass feeds up into the printer and comes back out printed, with
   a reference, and a WhatsApp message ready to send. Nothing is sent anywhere. */

import { REDUCED } from '../core/env.js';
import { esc, waLink, wait } from '../core/ui.js';
import { setFlaps, riffle } from '../core/flip.js';
import { PACKAGES, TOURS, VISAS, pkg, tour, CONFIG } from '../data.js';

const TOUR_CODES = { hunza: ['GIL', 'Gilgit'], skardu: ['KDU', 'Skardu'], dubai: ['DXB', 'Dubai'], turkey: ['IST', 'Istanbul'] };
const VISA_CODES = { saudi: ['JED', 'Saudi Arabia'], uae: ['DXB', 'UAE'], turkey: ['IST', 'Turkey'], uk: ['LHR', 'London'], schengen: ['CDG', 'Schengen'] };
const FROM = { KHI: 'Karachi', LHE: 'Lahore', ISB: 'Islamabad' };

function trips() {
  return [
    { group: 'Umrah packages', items: PACKAGES.map((p) => ({ v: p.id, label: `Umrah · ${p.name}, ${p.nights} nights`, code: ['JED', 'Jeddah'], cls: 'Umrah' })) },
    { group: 'Tours', items: TOURS.map((t) => ({ v: t.id, label: `${t.name} · ${t.days} days`, code: TOUR_CODES[t.id], cls: 'Tour' })) },
    { group: 'Visa services', items: VISAS.map((v) => ({ v: `visa-${v.id}`, label: `Visa · ${v.name}`, code: VISA_CODES[v.id], cls: 'Visa' })) },
    { group: 'Something else', items: [{ v: 'custom', label: 'A custom plan', code: ['ANY', 'Anywhere'], cls: 'Custom' }] },
  ];
}

export function mount(root) {
  const q = (s) => root.querySelector(s);
  const form = q('[data-form]'), sel = q('[data-trip]');
  const all = trips();
  sel.innerHTML = all.map((g) => `<optgroup label="${g.group}">${g.items.map((i) => `<option value="${i.v}">${esc(i.label)}</option>`).join('')}</optgroup>`).join('');
  const find = (v) => all.flatMap((g) => g.items).find((i) => i.v === v);
  const want = new URLSearchParams(location.search).get('pkg');
  if (want && find(want)) sel.value = want;
  else sel.value = PACKAGES.find((p) => p.popular).id;
  // default month: two months from now
  const d = new Date(); d.setMonth(d.getMonth() + 2);
  form.month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const toCode = q('[data-to-code]'), fromCode = q('[data-from-code]');
  let pax = 2;
  function sync(flip) {
    const t = find(sel.value);
    if (toCode.dataset.text !== t.code[0]) { setFlaps(toCode, t.code[0]); if (flip) riffle(toCode); }
    if (fromCode.dataset.text !== form.from.value) { setFlaps(fromCode, form.from.value); if (flip) riffle(fromCode); }
    q('[data-to-name]').textContent = t.code[1];
    q('[data-from-name]').textContent = FROM[form.from.value];
    q('[data-class]').textContent = t.cls;
    q('[data-mirror="name"]').textContent = form.passenger.value.trim() || '—';
    q('[data-mirror="route"]').textContent = `${form.from.value} → ${t.code[0]}`;
    q('[data-mirror="pax"]').textContent = pax;
    q('[data-pax-out]').textContent = pax;
  }
  sync(false);
  form.addEventListener('input', () => sync(true));
  form.addEventListener('change', () => sync(true));
  form.addEventListener('click', (e) => { const b = e.target.closest('[data-pax]'); if (!b) return; pax = Math.max(1, Math.min(30, pax + Number(b.dataset.pax))); sync(false); });

  function check() {
    const errs = {};
    if (form.passenger.value.trim().length < 2) errs.passenger = 'Please write the passenger name.';
    if (form.phone.value.replace(/\D/g, '').length < 10) errs.phone = 'A number we can call or WhatsApp, please.';
    ['passenger', 'phone'].forEach((k) => { form[k].setAttribute('aria-invalid', String(!!errs[k])); q(`[data-err="${k}"]`).textContent = errs[k] || ''; });
    const first = Object.keys(errs)[0];
    if (first) form[first].focus();
    return !first;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!check()) return;
    const t = find(sel.value);
    const ref = `RH-${String(Date.now()).slice(-5)}`;
    const month = form.month.value ? new Date(form.month.value + '-01T00:00').toLocaleString('en-GB', { month: 'long', year: 'numeric' }) : 'Flexible';
    const p = pkg(sel.value), tr = tour(sel.value);
    const price = p ? `Rs ${p.price.quad.toLocaleString('en-PK')} per person (quad)` : tr ? `From Rs ${tr.price.toLocaleString('en-PK')} per person` : '';
    const msg = [`Assalam o alaikum ${CONFIG.name},`, `I'd like to enquire about: ${t.label}.`, `Ref ${ref}. From ${FROM[form.from.value]}, ${pax} traveller${pax > 1 ? 's' : ''}, ${month}.`, price && `Listed price: ${price}.`, form.notes.value.trim() && `Notes: ${form.notes.value.trim()}`, `Name: ${form.passenger.value.trim()}, ${form.phone.value.trim()}`].filter(Boolean).join('\n');
    const out = q('[data-printed]');
    out.innerHTML = `<div class="bp bp-print">
        <div class="bp-main">
          <div class="bp-top"><p class="bp-brand mono">Rihla · Boarding pass</p><p class="bp-class mono">${esc(t.cls)} · Confirmed enquiry</p></div>
          <div class="bp-route"><div><span class="mono bp-code">${form.from.value}</span><small>${FROM[form.from.value]}</small></div><span class="bp-path"><i></i><svg aria-hidden="true"><use href="#i-plane"/></svg><i></i></span><div class="bp-to"><span class="mono bp-code">${t.code[0]}</span><small>${esc(t.code[1])}</small></div></div>
          <dl class="bp-out">
            <div class="bp-wide"><dt class="label">Passenger</dt><dd>${esc(form.passenger.value.trim())}</dd></div>
            <div><dt class="label">Reference</dt><dd class="mono">${ref}</dd></div>
            <div class="bp-wide"><dt class="label">Trip</dt><dd>${esc(t.label)}</dd></div>
            <div><dt class="label">Travelling</dt><dd>${esc(month)}</dd></div>
            <div><dt class="label">Travellers</dt><dd>${pax}</dd></div>
            <div class="bp-wide"><dt class="label">Boarding</dt><dd>We call you within 2 working hours</dd></div>
          </dl>
        </div>
        <div class="bp-stub">
          <p class="bp-brand mono">${ref}</p>
          <span class="barcode" aria-hidden="true"></span>
          <a class="btn btn-coral btn-block" href="${waLink(msg)}" target="_blank" rel="noopener"><span>Send on WhatsApp</span></a>
          <button type="button" class="btn btn-line btn-block no-arrow" data-again>New enquiry</button>
        </div>
      </div>
      <p class="printed-note">Nothing has been sent yet: this is a concept site. A real one would deliver the pass straight to the team's enquiry inbox.</p>`;
    // into the printer…
    const printer = q('[data-printer]');
    printer.classList.add('is-printing');
    await wait(REDUCED ? 0 : 900);
    form.hidden = true;
    out.hidden = false;
    printer.classList.add('is-printed');
    // …and out again, line by line
    await wait(REDUCED ? 0 : 1900);
    printer.classList.remove('is-printing');
    out.querySelector('[data-again]').addEventListener('click', () => {
      printer.classList.remove('is-printed');
      out.hidden = true;
      form.hidden = false;
      form.reset(); pax = 2;
      form.month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      sel.value = PACKAGES.find((x) => x.popular).id;
      sync(false);
      form.passenger.focus();
    });
    out.querySelector('a').focus({ preventScroll: true });
  });
}
