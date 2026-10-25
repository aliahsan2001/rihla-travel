/* The globe's lighter stand-in on phones: an illustrated map from Turkey to Pakistan where the same
   dotted routes draw out from Karachi as you scroll, and a paper plane flies each one. */

import { drawBase, arcPath, PK, ROUTE_COUNTRIES } from './map.js';
import { HUB, STOPS, LEG0, LEGW } from '../data.js';

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export async function mountRouteMap(svg) {
  // phones get a squarer frame, so the whole route fits a narrow screen at a readable size
  const narrow = innerWidth < 760;
  const p = await drawBase(svg, narrow ? [26, 6, 80, 49] : [25, 11, 82, 47], 1000, { highlight: [PK, ...ROUTE_COUNTRIES] });
  svg.classList.toggle('is-narrow', narrow);
  const hub = p([HUB.lon, HUB.lat]);
  const bows = [-0.2, 0.26, -0.18, 0.2];
  let html = '<defs>';
  const routes = STOPS.map((s, i) => {
    const d = arcPath(hub, p([s.lon, s.lat]), bows[i]);
    html += `<mask id="rm-m${i}" maskUnits="userSpaceOnUse"><path d="${d}" pathLength="1" class="rm-reveal" data-rv="${i}"/></mask>`;
    return d;
  });
  html += '</defs>';
  routes.forEach((d, i) => (html += `<path class="rm-route" d="${d}" mask="url(#rm-m${i})"/><path class="rm-guide" d="${d}" data-guide="${i}"/>`));
  const city = (lon, lat, name, cls = '') => { const [x, y] = p([lon, lat]); const end = x > 760; return `<g class="rm-city ${cls}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="9" class="rm-pulse"/><circle r="4.5"/><text x="${end ? -12 : 12}" y="-10" text-anchor="${end ? 'end' : 'start'}">${name}</text></g>`; };
  html += city(HUB.lon, HUB.lat, 'Karachi', 'is-hub is-on');
  STOPS.forEach((s, i) => (html += city(s.lon, s.lat, s.name, `c${i}`)));
  html += '<g class="rm-plane"><path d="M14 0L-9 -9l3.5 9-3.5 9z"/><path d="M14 0L-6 0" class="rm-crease"/></g>';
  svg.insertAdjacentHTML('beforeend', html);
  const reveals = [...svg.querySelectorAll('.rm-reveal')];
  const guides = [...svg.querySelectorAll('[data-guide]')];
  const cities = STOPS.map((_, i) => svg.querySelector(`.rm-city.c${i}`));
  const plane = svg.querySelector('.rm-plane');
  const lens = guides.map((g) => g.getTotalLength());

  return {
    setProgress(pr) {
      const li = Math.floor((pr - LEG0) / LEGW), lt = (pr - LEG0 - li * LEGW) / LEGW;
      reveals.forEach((r, i) => {
        const v = i < li ? 1 : i > li ? 0 : smooth(0.08, 0.86, lt);
        r.style.strokeDashoffset = String(1 - v);
        cities[i].classList.toggle('is-on', v > 0.98);
      });
      if (li >= 0 && li < STOPS.length) {
        const t = smooth(0.08, 0.86, lt), L = lens[li];
        const a = guides[li].getPointAtLength(t * L), b = guides[li].getPointAtLength(Math.min(L, t * L + 2));
        const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
        const env = smooth(0, 0.08, lt) * (1 - smooth(0.9, 1, lt));
        plane.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${((0.2 + 0.8 * env) * (svg.classList.contains('is-narrow') ? 1.9 : 1)).toFixed(2)})`);
        plane.style.opacity = String(env);
      } else plane.style.opacity = '0';
    },
  };
}
