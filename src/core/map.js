/* The world, drawn from Natural Earth outlines (world-atlas, 1:50m). Used three ways: painted onto
   the globe's texture, drawn as the small itinerary maps on Tours, and as the illustrated map that
   stands in for the globe on phones. Loaded on demand, once. */

import { feature, mesh } from 'topojson-client';
import worldUrl from 'world-atlas/countries-50m.json?url';

export const PK = '586';
export const ROUTE_COUNTRIES = ['682', '784', '792']; // Saudi Arabia, UAE, Turkey

let world;
export function loadWorld() {
  world ??= fetch(worldUrl).then((r) => r.json()).then((topo) => ({
    countries: feature(topo, topo.objects.countries).features,
    land: feature(topo, topo.objects.land),
    borders: mesh(topo, topo.objects.countries, (a, b) => a !== b),
  }));
  return world;
}

const rings = (g) => (g.type === 'FeatureCollection' ? g.features.flatMap((f) => rings(f.geometry)) : g.type === 'GeometryCollection' ? g.geometries.flatMap(rings) : g.type === 'Polygon' ? g.coordinates : g.type === 'MultiPolygon' ? g.coordinates.flat() : g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []);
const geomOf = (f) => (f.type === 'Feature' ? f.geometry : f);

/* ---------- flat maps (SVG) ---------- */
// equirectangular, corrected for latitude so the region keeps its shape
export function projector([x0, y0, x1, y1], width) {
  const k = Math.cos(((y0 + y1) / 2) * Math.PI / 180);
  const sx = width / ((x1 - x0) * k);
  const height = (y1 - y0) * sx;
  const p = ([lon, lat]) => [(lon - x0) * k * sx, (y1 - lat) * sx];
  p.width = width; p.height = height; p.bbox = [x0, y0, x1, y1];
  return p;
}

// an SVG path for any geometry, skipping rings that fall wholly outside the map
export function svgPath(f, p, close = true) {
  const [x0, y0, x1, y1] = p.bbox, pad = 4;
  let d = '';
  for (const ring of rings(geomOf(f))) {
    let a = 180, b = 90, c = -180, e = -90;
    for (const [lon, lat] of ring) { if (lon < a) a = lon; if (lon > c) c = lon; if (lat < b) b = lat; if (lat > e) e = lat; }
    if (c < x0 - pad || a > x1 + pad || e < y0 - pad || b > y1 + pad) continue;
    ring.forEach((pt, i) => { const [x, y] = p(pt); d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`; });
    if (close) d += 'Z';
  }
  return d;
}

// small repeating marks that hint at the ground: peaks, dunes or rolling hills
const TERRAIN = {
  mountains: '<path d="M6 30l8-12 5 7 4-5 9 10" fill="none" stroke="rgba(18,38,58,.26)" stroke-width="1.4" stroke-linejoin="round"/><path d="M30 12l5-7 6 8" fill="none" stroke="rgba(120,100,70,.24)" stroke-width="1.2"/>',
  dunes: '<path d="M4 26q8-9 16 0M24 14q7-8 14 0" fill="none" stroke="rgba(150,120,70,.3)" stroke-width="1.3"/>',
  hills: '<path d="M6 28q7-8 14 0M24 16q5-6 10 0" fill="none" stroke="rgba(110,120,90,.26)" stroke-width="1.2"/>',
};
let uid = 0;

// the base of every flat map: land, a soft shore, a hint of terrain and dotted borders
export async function drawBase(svg, bbox, width = 1000, { highlight = [], terrain } = {}) {
  const w = await loadWorld();
  const p = projector(bbox, width);
  svg.setAttribute('viewBox', `0 0 ${width} ${p.height.toFixed(0)}`);
  const land = svgPath(w.land, p);
  const hl = w.countries.filter((c) => highlight.includes(c.id)).map((c) => `<path class="map-hl${c.id === PK ? ' is-pk' : ''}" d="${svgPath(c, p)}"/>`).join('');
  const id = `terrain-${++uid}`;
  const tx = terrain && TERRAIN[terrain] ? `<defs><pattern id="${id}" width="46" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-4)">${TERRAIN[terrain]}</pattern></defs><path d="${land}" fill="url(#${id})"/>` : '';
  svg.insertAdjacentHTML('afterbegin', `<g class="map-base"><rect class="map-sea" width="${width}" height="${p.height.toFixed(0)}"/><path class="map-shore" d="${land}"/><path class="map-land" d="${land}"/>${hl}${tx}<path class="map-borders" d="${svgPath(w.borders, p, false)}"/></g>`);
  return p;
}

// a frame round some points, padded and stretched to the panel's shape
export function frameFor(points, aspect, pad = 1.7, min = 0.35) {
  const lons = points.map((q) => q[0]), lats = points.map((q) => q[1]);
  const cx = (Math.min(...lons) + Math.max(...lons)) / 2, cy = (Math.min(...lats) + Math.max(...lats)) / 2;
  const k = Math.cos(cy * Math.PI / 180);
  let w = Math.max(min, Math.max(...lons) - Math.min(...lons)) * k * pad, h = Math.max(min, Math.max(...lats) - Math.min(...lats)) * pad;
  if (w / h < aspect) w = h * aspect; else h = w / aspect;
  return [cx - w / k / 2, cy - h / 2, cx + w / k / 2, cy + h / 2];
}

// a scale bar of a round number of kilometres
export function scaleBar(p, x, y) {
  const [x0, y0] = p.bbox, a = p([x0, y0]), b = p([x0, y0 + 1]), perKm = Math.abs(a[1] - b[1]) / 111;
  const km = [5, 10, 20, 50, 100, 200, 500].find((v) => v * perKm >= 70) || 500;
  const len = km * perKm;
  return `<g class="map-scale" transform="translate(${x} ${y})"><path d="M0 0h${len.toFixed(1)}M0 -5v5M${len.toFixed(1)} -5v5"/><text y="-10">${km} km</text></g>`;
}

// a gentle arc between two projected points, bowed to one side
export function arcPath([ax, ay], [bx, by], bow = 0.22) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay;
  return `M${ax.toFixed(1)} ${ay.toFixed(1)}Q${(mx - dy * bow).toFixed(1)} ${(my + dx * bow).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
}

/* ---------- the globe's texture (canvas, equirectangular) ---------- */
export async function paintGlobe(W = 4096) {
  const w = await loadWorld();
  const H = W / 2, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const X = (lon) => ((lon + 180) / 360) * W, Y = (lat) => ((90 - lat) / 180) * H;
  const trace = (f) => { g.beginPath(); for (const ring of rings(geomOf(f))) ring.forEach(([lon, lat], i) => (i ? g.lineTo(X(lon), Y(lat)) : g.moveTo(X(lon), Y(lat)))); };
  // the sea: pale, a touch greener toward the poles
  const sea = g.createLinearGradient(0, 0, 0, H);
  sea.addColorStop(0, '#7fc6cf'); sea.addColorStop(0.5, '#a9dde1'); sea.addColorStop(1, '#7fc6cf');
  g.fillStyle = sea; g.fillRect(0, 0, W, H);
  // shallow water: a soft halo round every coast
  trace(w.land);
  g.save(); g.strokeStyle = 'rgba(214,241,242,.95)'; g.lineWidth = W / 420; g.lineJoin = 'round'; g.stroke(); g.restore();
  g.fillStyle = '#f7dfab'; g.fill();
  w.countries.forEach((f) => {
    if (f.id === PK) { trace(f); g.fillStyle = '#5fae86'; g.fill(); }
    else if (ROUTE_COUNTRIES.includes(f.id)) { trace(f); g.fillStyle = '#f6c4b4'; g.fill(); }
  });
  // graticule
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = W / 4096;
  for (let lon = -180; lon <= 180; lon += 15) { g.beginPath(); g.moveTo(X(lon), 0); g.lineTo(X(lon), H); g.stroke(); }
  for (let lat = -75; lat <= 75; lat += 15) { g.beginPath(); g.moveTo(0, Y(lat)); g.lineTo(W, Y(lat)); g.stroke(); }
  // borders and coast
  trace(w.borders);
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = W / 2600; g.stroke();
  trace(w.land);
  g.strokeStyle = 'rgba(18,38,58,.35)'; g.lineWidth = W / 3600; g.stroke();
  return c;
}
