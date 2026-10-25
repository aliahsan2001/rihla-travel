/* The home globe. A softly lit earth turns toward Pakistan; then setProgress(p) flies the route:
   for each destination a dotted arc draws out from Karachi while a paper plane flies it, and the
   camera follows the plane. At the end it pulls back to show every route at once.
   Light by design: one textured sphere, a few hundred dots, no shadows, and it only renders while something moves. */

import * as THREE from 'three';
import { paintGlobe } from '../core/map.js';
import { HUB, STOPS, LEG0, LEGW } from '../data.js';

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const D2R = Math.PI / 180;
// a point on the unit sphere, matching how three's sphere lays out an equirectangular texture
const toVec = (lat, lon, r = 1) => new THREE.Vector3(Math.cos(lat * D2R) * Math.cos(lon * D2R), Math.sin(lat * D2R), -Math.cos(lat * D2R) * Math.sin(lon * D2R)).multiplyScalar(r);

const legAt = (p) => Math.floor((p - LEG0) / LEGW);

function dotTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.beginPath(); g.arc(32, 32, 26, 0, Math.PI * 2); g.fill();
  return new THREE.CanvasTexture(c);
}

function softTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d'), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// a folded paper plane, nose along +z, wings in the xz plane
function paperPlane() {
  const v = {
    N: [0, 0.02, 1], L: [-0.62, 0.08, -0.55], R: [0.62, 0.08, -0.55], B: [0, 0, -0.45], K: [0, -0.22, -0.5],
  };
  const tri = (a, b, c) => [...v[a], ...v[b], ...v[c]];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...tri('N', 'B', 'L'), ...tri('N', 'R', 'B'), ...tri('N', 'K', 'B'), ...tri('N', 'B', 'K')], 3));
  g.computeVertexNormals();
  const plane = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: '#ffffff', side: THREE.DoubleSide, flatShading: true }));
  const crease = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...v.N), new THREE.Vector3(...v.B)]), new THREE.LineBasicMaterial({ color: '#b9b2a2' }));
  // a fine outline so the white paper reads against the pale earth
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(g, 1), new THREE.LineBasicMaterial({ color: '#12263a', transparent: true, opacity: 0.8 }));
  const o = new THREE.Group();
  o.add(plane, crease, edges);
  return o;
}

export function mountGlobe(canvas, { labels: labelLayer, small = false } = {}) {
  const wrap = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 50);
  const px = renderer.getPixelRatio();

  const world = new THREE.Group(); // everything that turns with the earth
  scene.add(world);
  const sun = toVec(38, 30).normalize();

  /* ---------- the earth ---------- */
  const earthU = { uMap: { value: null }, uSun: { value: sun }, uReady: { value: 0 } };
  const earthGeo = new THREE.SphereGeometry(1, 96, 48);
  const earth = new THREE.Mesh(earthGeo, new THREE.ShaderMaterial({
    uniforms: earthU,
    vertexShader: /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position, 1.0); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: /* glsl */ `uniform sampler2D uMap; uniform vec3 uSun; uniform float uReady; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){
        vec3 base = mix(vec3(0.62, 0.82, 0.84), texture2D(uMap, vUv).rgb, uReady);
        float d = dot(normalize(vN), uSun);
        float light = 0.8 + 0.26 * smoothstep(-0.2, 0.9, d);
        float fres = pow(1.0 - max(dot(normalize(vN), vV), 0.0), 2.6);
        vec3 col = base * light;
        col = mix(col, vec3(1.0, 0.97, 0.9), fres * 0.55);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  }));
  world.add(earth);
  paintGlobe(small ? 2048 : 3072).then((c) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    earthU.uMap.value = t;
    ready = 0.0001;
    kick();
  });
  let ready = 0;

  scene.add(new THREE.HemisphereLight('#ffffff', '#f3dcc0', 1.6));
  const dl = new THREE.DirectionalLight('#fff6e8', 1.4);
  dl.position.copy(sun).multiplyScalar(5);
  scene.add(dl);

  // a soft halo of air round the earth
  const halo = new THREE.Mesh(new THREE.SphereGeometry(1.16, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false,
    vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vP = mv.xyz; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vP; void main(){ float f = dot(normalize(vN), normalize(vP)); float a = smoothstep(0.0, 0.45, f) * (1.0 - smoothstep(0.45, 1.0, f) * 0.2); gl_FragColor = vec4(1.0, 0.95, 0.84, pow(a, 2.2) * 0.6); }',
  }));
  scene.add(halo);

  /* ---------- routes: Karachi to each stop ---------- */
  const dot = dotTex();
  const hub = toVec(HUB.lat, HUB.lon);
  const legs = STOPS.map((s) => {
    const a = hub.clone(), b = toVec(s.lat, s.lon);
    const ang = a.angleTo(b), n = Math.max(30, Math.round(ang * 170));
    const lift = 0.03 + ang * 0.16;
    const pts = [], q = new THREE.Vector3();
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      // along the great circle, lifted into a gentle arc
      q.copy(a).multiplyScalar(Math.sin((1 - t) * ang) / Math.sin(ang)).addScaledVector(b, Math.sin(t * ang) / Math.sin(ang));
      pts.push(q.clone().multiplyScalar(1.004 + lift * Math.sin(Math.PI * t)));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    geo.setAttribute('aT', new THREE.Float32BufferAttribute(pts.map((_, i) => i / n), 1));
    const u = { uProg: { value: 0 }, uMap: { value: dot }, uPixel: { value: px }, uColor: { value: new THREE.Color('#e5532f') } };
    const points = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: u, transparent: true, depthWrite: false,
      vertexShader: 'attribute float aT; uniform float uProg, uPixel; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; float on = step(aT, uProg); vA = on * (0.55 + 0.45 * smoothstep(uProg - 0.25, uProg, aT)); gl_PointSize = on * 3.2 * uPixel * (2.2 / -mv.z) + on * 1.2 * uPixel; }',
      fragmentShader: 'uniform sampler2D uMap; uniform vec3 uColor; varying float vA; void main(){ float a = texture2D(uMap, gl_PointCoord).a; if (vA * a < 0.02) discard; gl_FragColor = vec4(uColor, a * vA); }',
    }));
    world.add(points);
    return { stop: s, pts, u, curve: new THREE.CatmullRomCurve3(pts) };
  });

  // city markers: a dot and a slow pulse ring on the surface
  const ringGeo = new THREE.RingGeometry(0.008, 0.0105, 40);
  const markers = [{ ...HUB, hub: true }, ...STOPS, ...STOPS.filter((s) => s.also).map((s) => ({ ...s.also, id: s.id, minor: true }))].map((m) => {
    const n = toVec(m.lat, m.lon);
    const g = new THREE.Group();
    g.position.copy(n.clone().multiplyScalar(1.003));
    g.lookAt(n.clone().multiplyScalar(2));
    const mat = new THREE.MeshBasicMaterial({ color: m.hub ? '#e5532f' : '#0e6170', transparent: true, side: THREE.DoubleSide, depthWrite: false });
    const dotM = new THREE.Mesh(new THREE.CircleGeometry(m.minor ? 0.0045 : 0.0065, 20), mat);
    const ring = new THREE.Mesh(ringGeo, mat.clone());
    g.add(dotM, ring);
    world.add(g);
    let el = null;
    if (labelLayer && !m.minor) {
      el = document.createElement('div');
      el.className = `globe-label${m.hub ? ' is-hub' : ''}`;
      el.dataset.id = m.id || 'hub';
      el.innerHTML = `<span class="mono">${m.code}</span>${m.name}`;
      labelLayer.appendChild(el);
    }
    return { m, g, ring, mat, n, el, leg: m.hub ? -1 : STOPS.findIndex((s) => s.id === m.id) };
  });

  const plane = paperPlane();
  plane.scale.setScalar(0.046);
  // a soft shadow on the ground below the plane
  const shade = new THREE.Mesh(new THREE.CircleGeometry(0.03, 24), new THREE.MeshBasicMaterial({ map: softTex(), color: '#12263a', transparent: true, opacity: 0.24, depthWrite: false }));
  world.add(shade);
  world.add(plane);

  /* ---------- state ---------- */
  let progress = 0, intro = 0; // intro: the turn toward Pakistan on arrival
  const cam = { pos: new THREE.Vector3(0, 0, 6), look: new THREE.Vector3() };
  const goal = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
  const over = toVec(29, 52).normalize(); // the overview sits over Arabia and Pakistan
  const tmp = new THREE.Vector3(), tan = new THREE.Vector3(), up = new THREE.Vector3(), side = new THREE.Vector3(), m4 = new THREE.Matrix4();

  function place(now) {
    const p = progress;
    const li = legAt(p), lt = (p - LEG0 - li * LEGW) / LEGW;
    legs.forEach((l, i) => (l.u.uProg.value = i < li ? 1.001 : i > li ? 0 : smooth(0.08, 0.86, lt) * 1.001));
    // the plane flies the current leg
    const active = li >= 0 && li < legs.length;
    if (active) {
      const l = legs[li], t = Math.min(0.999, smooth(0.08, 0.86, lt));
      const pos = l.curve.getPointAt(t), ahead = l.curve.getPointAt(Math.min(1, t + 0.01));
      tan.subVectors(ahead, pos).normalize();
      up.copy(pos).normalize();
      side.crossVectors(up, tan).normalize();
      up.crossVectors(tan, side).normalize();
      m4.makeBasis(side, up, tan);
      plane.quaternion.setFromRotationMatrix(m4);
      plane.rotateZ(Math.sin(now * 0.0016) * 0.12);
      plane.position.copy(pos).addScaledVector(up, Math.sin(now * 0.0022) * 0.002);
      const env = smooth(0, 0.08, lt) * (1 - smooth(0.9, 1, lt));
      plane.scale.setScalar(0.046 * Math.max(0.001, env));
      shade.position.copy(pos).normalize().multiplyScalar(1.002);
      shade.lookAt(tmp.copy(shade.position).multiplyScalar(2));
      shade.scale.setScalar(Math.max(0.001, env) * (0.7 + (pos.length() - 1) * 8));
      // follow from behind and above, closest in mid-flight
      const alt = 1.35 - 0.55 * Math.sin(Math.PI * smooth(0.04, 0.96, lt));
      tmp.copy(pos).normalize().addScaledVector(tan, -0.32).addScaledVector(side, 0.12).normalize().multiplyScalar(1 + alt);
      goal.pos.copy(tmp);
      goal.look.copy(pos).multiplyScalar(0.82).addScaledVector(tan, 0.08);
    } else {
      plane.scale.setScalar(0.001);
      shade.scale.setScalar(0.001);
      const end = p >= LEG0 + legs.length * LEGW;
      goal.pos.copy(over).multiplyScalar(end ? 3.35 : 3.05);
      goal.look.set(0, 0, 0).addScaledVector(over, 0.12);
    }
    return active ? li : -1;
  }

  /* ---------- size ---------- */
  function layout() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 48 : 34;
    // wide screens: the earth sits right of centre, leaving room for the copy
    if (w / h > 1.2) camera.setViewOffset(w, h, -w * 0.17, 0, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    kick();
  }

  let raf = 0, last = performance.now(), visible = true, dead = false, t0 = performance.now(), first = true, calmUntil = 0;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); });
  io.observe(wrap);
  const proj = new THREE.Vector3(), camDir = new THREE.Vector3();
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); // rAF time can predate last
    last = now;
    if (ready > 0 && ready < 1) { ready = Math.min(1, ready + dt * 1.4); earthU.uReady.value = ready; }
    // arrival: the earth turns from the Atlantic to face Pakistan
    intro = Math.min(1, (now - t0) / 2600);
    world.rotation.y = -1.9 * Math.pow(1 - intro, 3);
    const li = place(now);
    world.updateMatrixWorld();
    // the first frame starts in place; after that the camera glides
    const k = first ? 1 : 1 - Math.pow(0.045, dt);
    first = false;
    cam.pos.lerp(goal.pos, k); cam.look.lerp(goal.look, k);
    // the camera stays put while the earth turns beneath it on arrival
    camera.position.copy(cam.pos);
    camera.lookAt(cam.look);
    // pulses, and labels that follow their city and hide round the back of the earth
    const pulse = (now / 1000) % 2.2 / 2.2;
    camDir.copy(camera.position).normalize();
    const w = canvas.clientWidth, h = canvas.clientHeight;
    markers.forEach((mk) => {
      const reached = mk.leg < 0 || legs[mk.leg].u.uProg.value > 0.98;
      const s = reached ? 1 + pulse * 1.4 : 0.001;
      mk.ring.scale.setScalar(s);
      mk.ring.material.opacity = reached ? 0.7 * (1 - pulse) : 0;
      mk.mat.opacity = reached || mk.leg === li ? 1 : 0.35;
      if (!mk.el) return;
      proj.copy(mk.g.position).applyMatrix4(world.matrixWorld);
      const facing = proj.clone().normalize().dot(camDir);
      proj.project(camera);
      const show = facing > 0.25 && reached && intro > 0.9;
      mk.el.style.transform = `translate3d(${((proj.x + 1) / 2 * w).toFixed(1)}px, ${((1 - proj.y) / 2 * h).toFixed(1)}px, 0)`;
      mk.el.classList.toggle('is-on', show);
    });
    if (dead || renderer.getContext().isContextLost()) { raf = 0; return; } // context gone after a page change
    renderer.render(scene, camera);
    // render on demand: keep going while the camera glides, the earth turns in or the map fades up,
    // then a couple of seconds more for the pulses, then rest until the next scroll
    const busy = intro < 1 || (ready > 0 && ready < 1) || cam.pos.distanceToSquared(goal.pos) > 1e-7 || cam.look.distanceToSquared(goal.look) > 1e-7;
    if (busy) calmUntil = now + 2200;
    if (visible && !document.hidden && !dead && now < calmUntil) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
  function kick() { if (!raf && !dead) { last = performance.now(); calmUntil = Math.max(calmUntil, last + 600); raf = requestAnimationFrame(frame); } }
  const onVis = () => !document.hidden && kick();
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(layout);
  ro.observe(wrap);
  layout();
  place(performance.now());
  frame(performance.now());
  canvas.classList.add('is-ready');

  return {
    setProgress(p, snap = false) { progress = p; if (snap) { place(performance.now()); cam.pos.copy(goal.pos); cam.look.copy(goal.look); t0 = -1e5; } kick(); },
    dispose() {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      markers.forEach((mk) => mk.el?.remove());
      scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => { m.map?.dispose(); m.dispose?.(); }); });
      earthU.uMap.value?.dispose(); dot.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
