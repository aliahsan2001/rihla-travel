/* Everything the site says about Rihla: packages, tours, visas and contact details. All
   placeholders for a concept project; a real agency would edit this file (or an admin panel). */

export const CONFIG = {
  name: 'Rihla Travel & Tours',
  phone: '+92 21 3456 7000',
  phoneHref: 'tel:+922134567000',
  whatsappNumber: '', // e.g. '923001234567'
  email: 'hello@rihla.example',
  address: 'Suite 402, Business Avenue, Shahrah-e-Faisal, Karachi',
  licence: 'Licence no. 0000 (placeholder)',
};

export const img = (id, w = 1280) => `/img/p/${id}-${w}.webp`;

/* ---------- the route on the home globe ---------- */
// the scroll: an overview until LEG0, then one leg of LEGW per stop, then the pull-back
export const LEG0 = 0.1, LEGW = 0.2;
export const HUB = { name: 'Karachi', code: 'KHI', lat: 24.86, lon: 67.01 };
export const STOPS = [
  { id: 'umrah', name: 'Makkah & Madinah', code: 'JED', lat: 21.42, lon: 39.83, also: { name: 'Madinah', lat: 24.47, lon: 39.61 }, line: 'Umrah, with the hotel distance written on every package.', href: '/umrah', photo: '1713239060784-e6ed820a0715' },
  { id: 'north', name: 'Hunza & Skardu', code: 'GIL', lat: 36.32, lon: 74.66, also: { name: 'Skardu', lat: 35.3, lon: 75.63 }, line: 'The north, by road and by air: lakes, forts and the Karakoram.', href: '/tours#hunza', photo: '1514558427911-8e293bebf18c' },
  { id: 'dubai', name: 'Dubai', code: 'DXB', lat: 25.2, lon: 55.27, line: 'Two hours away: the desert, the creek and the tallest view in the world.', href: '/tours#dubai', photo: '1512453979798-5ea266f8880c' },
  { id: 'turkey', name: 'Istanbul & Cappadocia', code: 'IST', lat: 41.01, lon: 28.98, line: 'The Bosphorus by ferry, and balloons over Cappadocia at sunrise.', href: '/tours#turkey', photo: '1604156789095-3348604c0f43' },
];

/* ---------- Umrah ---------- */
export const SHARING = [
  { id: 'quad', label: 'Quad', note: '4 to a room' },
  { id: 'triple', label: 'Triple', note: '3 to a room' },
  { id: 'double', label: 'Double', note: '2 to a room' },
];
export const TRANSPORT = { bus: { label: 'Shared AC coach', rank: 1 }, van: { label: 'Private family van', rank: 2 }, car: { label: 'Private GMC', rank: 3 } };

export const PACKAGES = [
  {
    id: 'economy-21', name: 'Economy', nights: 21, split: [14, 7], stars: 3, hotel: 'Al Kiswah Towers', madinahHotel: 'Dar Al Eiman Grand', distance: 850, madinahDistance: 400,
    transport: 'bus', meals: 'Breakfast', season: 'standard', price: { quad: 289000, triple: 309000, double: 349000 },
    departures: ['2026-11-14', '2026-12-05', '2027-01-09', '2027-01-30'], seats: 9, photo: '1693590614566-1d3ea9ef32f7',
    note: 'The longest stay for the price. A shuttle runs to the Haram every 20 minutes, day and night.',
    includes: ['Return flights Karachi to Jeddah, Saudia, 30 kg baggage', 'Umrah visa and insurance', '14 nights Makkah, 7 nights Madinah', 'Shuttle to the Haram around the clock', 'Ziyarat tours in Makkah and Madinah', 'Airport transfers and Makkah–Madinah coach', 'Group leader and a scholar for guidance'],
  },
  {
    id: 'standard-15', name: 'Standard', nights: 15, split: [10, 5], stars: 4, hotel: 'Elaf Ajyad', madinahHotel: 'Taiba Front', distance: 450, madinahDistance: 250,
    transport: 'bus', meals: 'Breakfast', season: 'standard', price: { quad: 365000, triple: 389000, double: 435000 },
    departures: ['2026-11-07', '2026-11-28', '2026-12-19', '2027-01-16'], seats: 14, popular: true, photo: '1720549973451-018d3623b55a',
    note: 'Our most booked package: a short walk to the Haram, and five nights close to Masjid an-Nabawi.',
    includes: ['Return flights Karachi to Jeddah, PIA, 30 kg baggage', 'Umrah visa and insurance', '10 nights Makkah, 5 nights Madinah', 'Walking distance to both mosques', 'Ziyarat tours in Makkah and Madinah', 'Airport transfers and Makkah–Madinah coach', 'Group leader and a scholar for guidance'],
  },
  {
    id: 'family-14', name: 'Family', nights: 14, split: [9, 5], stars: 4, hotel: 'Swissôtel Al Maqam', madinahHotel: 'Pullman Zamzam', distance: 300, madinahDistance: 200,
    transport: 'van', meals: 'Breakfast and dinner', season: 'standard', price: { quad: 412000, triple: 439000, double: 495000 },
    departures: ['2026-12-12', '2026-12-26', '2027-01-23'], seats: 6, photo: '1627728734379-a5f8c099763e',
    note: 'Connecting rooms, a private van for your family, and children under 2 travel free.',
    includes: ['Return flights Karachi to Jeddah, Saudia, 30 kg baggage', 'Umrah visa and insurance', '9 nights Makkah, 5 nights Madinah', 'Connecting rooms on request', 'Private family van for every transfer and ziyarat', 'Breakfast and dinner daily', 'Children under 2 travel free'],
  },
  {
    id: 'premium-10', name: 'Premium', nights: 10, split: [6, 4], stars: 5, hotel: 'Hilton Suites Makkah', madinahHotel: 'Anwar Al Madinah Mövenpick', distance: 150, madinahDistance: 100,
    transport: 'car', meals: 'Full board', season: 'standard', price: { quad: 548000, triple: 585000, double: 660000 },
    departures: ['2026-11-21', '2026-12-17', '2027-01-21'], seats: 8, photo: '1591604129939-f1efa4d9f7fa',
    note: 'Five-star hotels a couple of minutes from each mosque, and a private car for the whole trip.',
    includes: ['Return flights Karachi to Jeddah, Saudia, 40 kg baggage', 'Umrah visa and insurance', '6 nights Makkah, 4 nights Madinah', 'Private GMC for every transfer and ziyarat', 'Full board', 'Fast-track at Jeddah airport', 'A personal guide for your first Umrah'],
  },
  {
    id: 'executive-7', name: 'Executive', nights: 7, split: [4, 3], stars: 5, hotel: 'Fairmont Makkah Clock Tower', madinahHotel: 'The Oberoi Madinah', distance: 30, madinahDistance: 50,
    transport: 'car', meals: 'Full board', season: 'standard', price: { quad: 695000, triple: 745000, double: 850000 },
    departures: ['2026-11-12', '2026-12-10', '2027-01-14'], seats: 4, photo: '1758636697693-cca76eb772d7',
    note: 'For a short visit: the hotel stands over the Haram, and the Haram-view rooms see the Kaaba.',
    includes: ['Return flights Karachi to Jeddah, business class available', 'Umrah visa and insurance', '4 nights Makkah, 3 nights Madinah', 'Haram-view rooms on request', 'Private GMC throughout', 'Full board', 'A personal guide for your first Umrah'],
  },
  {
    id: 'ramadan-12', name: 'Last ten of Ramadan', nights: 12, split: [9, 3], stars: 4, hotel: 'Le Méridien Towers', madinahHotel: 'Saja Al Madinah', distance: 600, madinahDistance: 350,
    transport: 'bus', meals: 'Suhoor and iftar', season: 'ramadan', price: { quad: 495000, triple: 525000, double: 585000 },
    departures: ['2027-02-25'], seats: 22, photo: '1646424857576-2a66db82a65c',
    note: 'Arrive for the last ten nights in Makkah and stay for Eid. One departure only, and it fills by December.',
    includes: ['Return flights Karachi to Jeddah, PIA, 30 kg baggage', 'Umrah visa and insurance', '9 nights Makkah, 3 nights Madinah', 'Shuttle to the Haram around the clock', 'Suhoor and iftar daily', 'Eid in Madinah', 'Group leader and a scholar for guidance'],
  },
];
export const pkg = (id) => PACKAGES.find((p) => p.id === id);

/* ---------- tours: each day is a stop on a small map ---------- */
export const TOURS = [
  {
    id: 'hunza', terrain: 'mountains', name: 'Hunza', region: 'Gilgit-Baltistan, Pakistan', days: 7, price: 89000, season: 'April to October', photo: '1514558427911-8e293bebf18c', back: '1689388259449-9dd3a333d09d', ink: '#0e6170',
    line: 'Forts above the valley, a turquoise lake and the highest paved border crossing in the world.',
    bbox: [73.6, 35.6, 75.8, 37.1],
    itinerary: [
      { day: 1, place: 'Gilgit', title: 'Karachi to Gilgit, then up to Karimabad', at: [74.31, 35.92], text: 'Fly via Islamabad to Gilgit, then a two-hour drive up the Karakoram Highway to the valley.' },
      { day: 2, place: 'Karimabad', title: 'Baltit and Altit forts', at: [74.66, 36.32], text: 'Seven-hundred-year-old forts above Karimabad, and sunset from Eagle\'s Nest.' },
      { day: 3, place: 'Attabad Lake', title: 'Attabad Lake and the Passu Cones', at: [74.86, 36.33], text: 'A boat across the turquoise lake, then the Hussaini suspension bridge.' },
      { day: 4, place: 'Khunjerab Pass', title: 'Khunjerab Pass', at: [75.43, 36.85], text: 'The China border at 4,693 m, with yaks and marmots on the way.' },
      { day: 5, place: 'Passu', title: 'Passu village', at: [74.89, 36.46], text: 'A slow morning among the apricot orchards, and the Batura glacier viewpoint.' },
      { day: 6, place: 'Nagar', title: 'Nagar and the Hopper glacier', at: [74.73, 36.25], text: 'Across the river to Nagar, then the Rakaposhi viewpoint on the way down.' },
      { day: 7, place: 'Gilgit', title: 'Home', at: [74.31, 35.92], text: 'Back to Gilgit airport for the flight home.' },
    ],
  },
  {
    id: 'skardu', terrain: 'mountains', name: 'Skardu', region: 'Baltistan, Pakistan', days: 6, price: 96000, season: 'May to September', photo: '1679951124125-50cc4029d727', back: '1701763572611-b4cc5a72b2f7', ink: '#2f8a5f',
    line: 'Mountain lakes, a cold desert and Deosai, the plain on the roof of the world.',
    bbox: [74.9, 34.75, 76.5, 35.75],
    itinerary: [
      { day: 1, place: 'Skardu', title: 'Karachi to Skardu', at: [75.63, 35.3], text: 'Fly via Islamabad over Nanga Parbat, and settle in by the Indus.' },
      { day: 2, place: 'Kachura', title: 'Shangrila and Upper Kachura', at: [75.45, 35.42], text: 'Two lakes in the pines: a red-roofed resort, then the clear water above it.' },
      { day: 3, place: 'Shigar', title: 'Shigar Fort', at: [75.74, 35.42], text: 'A restored seventeenth-century palace, and lunch in its orchard.' },
      { day: 4, place: 'Deosai', title: 'Deosai and Sheosar Lake', at: [75.25, 35.02], text: 'A full day on the plateau at 4,000 m, among wildflowers and brown bears.' },
      { day: 5, place: 'Satpara', title: 'Katpana desert and Satpara Lake', at: [75.56, 35.32], text: 'White sand dunes under snow peaks, then the lake that feeds the town.' },
      { day: 6, place: 'Skardu', title: 'Home', at: [75.63, 35.3], text: 'An early flight home, weather permitting. We hold a backup seat by road.' },
    ],
  },
  {
    id: 'dubai', terrain: 'dunes', name: 'Dubai', region: 'United Arab Emirates', days: 5, price: 165000, season: 'October to April', photo: '1512453979798-5ea266f8880c', back: '1763535274035-48581728effd', ink: '#c77a12',
    line: 'Two hours from Karachi: the desert, the old creek and the tallest view in the world.',
    bbox: [54.95, 24.8, 55.75, 25.4],
    itinerary: [
      { day: 1, place: 'Dubai Marina', title: 'Arrive, and a dhow dinner', at: [55.14, 25.08], text: 'Check in near the Marina, then dinner on a dhow along the water.' },
      { day: 2, place: 'Downtown', title: 'Downtown and the Burj Khalifa', at: [55.274, 25.197], text: 'The observation deck at sunset, and the fountains after dark.' },
      { day: 3, place: 'Desert camp', title: 'Desert safari', at: [55.6, 24.95], text: 'Dune drive, camels and a barbecue at a desert camp.' },
      { day: 4, place: 'Al Fahidi', title: 'Old Dubai and the souks', at: [55.3, 25.263], text: 'Al Fahidi, an abra across the creek, and the gold and spice souks.' },
      { day: 5, place: 'DXB', title: 'Home', at: [55.36, 25.25], text: 'A free morning, then the short flight home.' },
    ],
  },
  {
    id: 'turkey', terrain: 'hills', name: 'Turkey', region: 'Istanbul, Cappadocia & Konya', days: 9, price: 275000, season: 'March to November', photo: '1604156789095-3348604c0f43', back: '1589561454226-796a8aa89b05', ink: '#e5532f',
    line: 'The old city of Istanbul, balloons over Cappadocia at sunrise, and Rumi\'s Konya.',
    bbox: [27.6, 36.6, 36.4, 42.0],
    itinerary: [
      { day: 1, place: 'Istanbul', title: 'Arrive in Istanbul', at: [28.98, 41.01], text: 'Check in near Sultanahmet, and an evening walk to the Blue Mosque.' },
      { day: 2, place: 'Istanbul', title: 'The old city', at: [28.98, 41.01], text: 'Hagia Sophia, Topkapı Palace and the Grand Bazaar, with a guide.' },
      { day: 3, place: 'Bosphorus', title: 'The Bosphorus', at: [29.01, 41.03], text: 'A ferry between two continents, then Galata at sunset.' },
      { day: 4, place: 'Kayseri', title: 'Fly to Cappadocia', at: [35.48, 38.72], text: 'An hour\'s flight to Kayseri, then on to a cave hotel in Göreme.' },
      { day: 5, place: 'Göreme', title: 'Balloons at sunrise', at: [34.83, 38.64], text: 'A balloon flight over the fairy chimneys, then the open-air museum.' },
      { day: 6, place: 'Derinkuyu', title: 'The underground city', at: [34.73, 38.37], text: 'Derinkuyu, eight levels deep, and the Ihlara valley walk.' },
      { day: 7, place: 'Konya', title: 'Konya', at: [32.48, 37.87], text: 'The Mevlana museum, Rumi\'s resting place, and an evening sema.' },
      { day: 8, place: 'Istanbul', title: 'Back to Istanbul', at: [28.98, 41.01], text: 'Fly back for a last free day on the Asian side.' },
      { day: 9, place: 'IST airport', title: 'Home', at: [28.82, 40.98], text: 'The flight home from Istanbul.' },
    ],
  },
];
export const tour = (id) => TOURS.find((t) => t.id === id);

/* ---------- visas: a checklist per country ---------- */
export const VISAS = [
  {
    id: 'saudi', name: 'Saudi Arabia', kind: 'Umrah visa', days: '3–5 working days', fee: 'Included with our packages', validity: '90 days',
    docs: ['Passport valid for 6 months, with 2 blank pages', 'Copy of your CNIC', 'Two photos, white background', 'Polio vaccination certificate', 'Meningitis (ACYW) vaccination certificate', 'Family registration certificate, if travelling as a family', 'Return flight booking (we arrange it)'],
  },
  {
    id: 'uae', name: 'United Arab Emirates', kind: 'Tourist visa, 30 days', days: '3–4 working days', fee: 'Rs 32,000', validity: '60 days to enter',
    docs: ['Passport valid for 6 months', 'Photo, white background', 'Copy of your CNIC', 'Bank statement, last 3 months', 'Return flight booking', 'Hotel booking or host\'s Emirates ID'],
  },
  {
    id: 'turkey', name: 'Turkey', kind: 'Tourist visa', days: '10–15 working days', fee: 'Rs 28,000 + service', validity: 'Up to 90 days',
    docs: ['Passport valid for 6 months, and old passports', 'Two photos, white background', 'Bank statement, last 6 months', 'Salary slips or business registration', 'Employer leave letter (NOC)', 'Travel insurance', 'Hotel and flight bookings', 'A short cover letter'],
  },
  {
    id: 'uk', name: 'United Kingdom', kind: 'Standard visitor visa', days: 'About 15 working days', fee: 'Rs 45,000 + service', validity: '6 months',
    docs: ['Passport, and all old passports', 'Bank statements, last 6 months', 'Employment letter and salary slips', 'Tax returns, last 2 years', 'Property or family ties at home', 'Travel plan and bookings', 'Invitation letter, if visiting family'],
  },
  {
    id: 'schengen', name: 'Schengen (Europe)', kind: 'Short-stay visa', days: 'About 15 working days', fee: 'Rs 30,000 + service', validity: 'Up to 90 days',
    docs: ['Passport valid for 3 months after return', 'Two photos to Schengen size', 'Bank statements, last 6 months', 'Travel insurance, €30,000 cover', 'Flight reservation', 'Hotel bookings for every night', 'Employment letter and tax returns', 'A cover letter with your plan'],
  },
];
export const visa = (id) => VISAS.find((v) => v.id === id);

export const TESTIMONIALS = [
  { q: 'They sent the hotel name and its distance from the Haram before we paid a rupee. Nobody else did that.', who: 'Farah & Imran Siddiqui', where: 'Standard Umrah, January' },
  { q: 'My parents\' first Umrah. The guide walked with them for the first tawaf. That is what I paid for.', who: 'Usman Khalid', where: 'Premium Umrah, December' },
];
