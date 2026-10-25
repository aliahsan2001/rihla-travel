# Rihla Travel & Tours: "Every journey has a route"

Concept project 8 of 8 for the Aqoa Systems portfolio. A fictional Karachi travel agency for Umrah packages, northern Pakistan tours, holidays abroad and visa help.

## What's in it
| Page | Signature moment |
|---|---|
| Home | A softly lit 3D globe turns toward Pakistan. As you scroll, a dotted route draws out from Karachi to Makkah, Hunza, Dubai and Istanbul in turn while a paper plane flies each leg and the camera follows it, then pulls back to show every route. Below: three ways to travel, and a departures board whose dates flip like an airport board on hover. |
| Umrah | Calm by design, with soft light and gentle fades. Six packages as clean cards: the hotel by name, its walking distance from the Haram, nights in each city, transport, departures and the full inclusions. Prices count up as they appear and change with quad, triple or double sharing. |
| Tours | Hunza, Skardu, Dubai and Turkey as a stack of 3D postcards you scroll through. Each card turns over to show its written back as it leaves the stack. Open one and its days unfold as a dotted route across a small map. |
| Visas | A document checklist for Saudi Arabia, the UAE, Turkey, the UK and Schengen. Each ticked item gets a passport stamp, and the same stamp lands on a passport page beside the list. |
| Enquire | The form is a boarding pass. Pick a trip and the destination code flips; submit and the pass feeds into a printer and comes back out printed, with a reference and a WhatsApp message ready to send. |
| 404 | "A missed connection." |

**Signature interaction:** on Umrah, choose up to three packages and they slide in side by side as boarding passes. Rows for hotel, distance from the Haram, nights, transport, price and price per night line up, and the best value in each row is gently marked.

Also included:
- A page transition where clouds drift in from the edges and part to reveal the next page.
- A palette from an old airline poster: deep sea teal, saffron sun, coral clay and turquoise sky on warm cream, with sunset stripes on the footer. Bricolage Grotesque for the big voice, Instrument Sans for reading, DM Mono for the codes on tickets and boards.
- A floating boarding-strip header, and buttons shaped like tickets, with a notch bitten out of each end.
- Photos that fade in and lean gently toward the cursor.

The site has no sound, by design.

## Stack
Vite · Three.js · GSAP + ScrollTrigger · Lenis · Barba.js · SplitType · topojson-client

The globe, postcards and maps are procedural, with no model files. Country outlines come from Natural Earth via `world-atlas` (1:50m), painted onto the globe's texture and drawn as the small itinerary maps. The postcards' fronts and backs, the clouds and the stamps' worn ink are painted on canvases. The 3D runs at up to 1.5× pixel density with no real-time shadows, and the globe only renders while something is moving, so it costs nothing once you stop scrolling.

## Run it
From a terminal:
```bash
npm install
npm run dev
```
The site uses ES modules, so it needs a server. Opening `index.html` by double-clicking won't work. Testing flags: `?lite` forces the lighter version, `?full` forces 3D.

## Deploy on Vercel
Import the repo, leave **Root Directory** at the repository root (`./`), and keep the detected **Vite** preset. `vercel.json` turns on clean URLs. Links like `/enquire?pkg=standard-15` preselect the trip, and `/tours#skardu` opens that itinerary.

## Phones and lighter devices
- **Home:** the globe becomes an illustrated map with the same dotted routes and paper plane, as the brief asks.
- **Tours:** the postcards swipe sideways, and tapping one opens the same itinerary map.
- **Umrah:** the boarding passes scroll sideways, each row labelled.

## Before publishing
- Search "Rihla Travel & Tours" on Google to check no real agency uses the name.
- Packages, prices, departures, visa fees, the licence number and contact details are placeholders, and the hotels are examples. Everything lives in `src/data.js`. Visa requirements change, so confirm them before going live.
- Nothing is sent. A real agency would add an admin panel for packages and prices, an enquiry CRM with follow-up reminders, document upload for visa files, and online deposits, as the brief suggests.

Photos from Unsplash (free licence), self-hosted as WebP in `public/img/p/`. Map data from Natural Earth (public domain).
