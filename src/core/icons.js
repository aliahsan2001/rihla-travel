/* Fine-line icon sprite, injected once outside the page container. */

const P = {
  arrow: ['M4 12h16M14 6l6 6-6 6'],
  back: ['M20 12H4M10 6l-6 6 6 6'],
  close: ['M6 6l12 12M18 6L6 18'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  plus: ['M12 5v14M5 12h14'],
  wa: ['M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.8 21.2l4.6-1.2A9.2 9.2 0 1 0 12 2.8z', 'M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1a5 5 0 0 1-2.9-2.9l1-1-1-2-1.6 1z'],
  plane: ['M21 4L3 11l6 2.5L11.5 20 14 14l7-10z', 'M9 13.5L21 4'],
  pin: ['M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z', 'M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z'],
  hotel: ['M4 20V6l8-3 8 3v14', 'M9 20v-5h6v5M8 9h1M15 9h1M8 12h1M15 12h1'],
  walk: ['M13 4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z', 'M10 22l2-7 3 3v4M9 12l1-5 4 2 2 3M10 7l-3 2-1 3'],
  moon: ['M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z'],
  car: ['M4 16V12l2-5h12l2 5v4M4 16h16M4 16v2M20 16v2', 'M7.5 13.5h.01M16.5 13.5h.01'],
  calendar: ['M4 6h16v14H4z', 'M4 10h16M8 3v4M16 3v4'],
  swipe: ['M8 12h8M5 9l-3 3 3 3M19 9l3 3-3 3'],
  doc: ['M7 3h7l4 4v14H7z', 'M14 3v4h4M10 12h5M10 16h5'],
};

export function injectIcons() {
  if (document.getElementById('i-arrow')) return;
  const symbols = Object.entries(P).map(([n, ds]) =>
    `<symbol id="i-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ds.map((d) => `<path d="${d}"/>`).join('')}</symbol>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols}</svg>`);
}
