# Design Document: Club Soccer Website

## Overview

The club soccer website is a static single-page application (SPA) delivering four views — Home, Match Schedule, Ticket Reservation, and Squad & Coaches — with no server-side rendering and no build toolchain. All interactivity is handled by Vanilla JavaScript running in the browser. Navigation between views uses hash-based routing (`#home`, `#schedule`, `#tickets`, `#squad`), so the browser never reloads the page. Styling is handled entirely by Tailwind CSS loaded from CDN, eliminating the need for a custom CSS file or PostCSS pipeline.

Static JSON data files (co-located in a `/data/` directory) supply match, player, coach, and ticket-category information. The absence of a backend means there is no server-side reservation persistence; confirmed reservations are acknowledged with a client-side confirmation summary only.

**Key design goals:**
- Zero build dependencies — open `index.html` in a browser and it works.
- Accessible by default — semantic HTML5, ARIA where needed, keyboard-navigable.
- Fully responsive — mobile-first Tailwind breakpoints.
- Clean separation between routing, data, and UI rendering logic.

---

## Architecture

### High-Level Architecture

```
index.html
│
├── <head>  – Tailwind CDN, meta tags, favicon
│
└── <body>
    ├── <header>  – Global navigation bar (always visible)
    ├── <main id="app">  – View container (content swapped by router)
    └── <footer>  – Club info, social links (always visible)

/js/
├── router.js       – Hash-change listener, view registry, route dispatch
├── data.js         – Async JSON fetch helpers with error handling
├── pages/
│   ├── home.js
│   ├── schedule.js
│   ├── tickets.js
│   └── squad.js
└── components/
    ├── nav.js      – Navigation rendering and active-link management
    ├── matchCard.js
    ├── ticketCard.js
    ├── reservationForm.js
    ├── playerCard.js
    └── coachCard.js

/data/
├── matches.json
├── players.json
├── coaches.json
└── ticketCategories.json

/assets/
├── images/
│   ├── players/
│   ├── coaches/
│   └── placeholder-avatar.svg
└── icons/
```

### Hash-Based SPA Routing

The router listens on `window.addEventListener('hashchange', ...)` and also fires on initial load (`DOMContentLoaded`). It maps hash strings to page modules and injects the rendered HTML into `<main id="app">`.

```
Route table:
  #home      → pages/home.js
  #schedule  → pages/schedule.js
  #tickets   → pages/tickets.js  (optional ?matchId= param)
  #squad     → pages/squad.js
  (empty)    → redirect to #home
```

The router passes any query-string parameters embedded after the hash (e.g., `#tickets?matchId=3`) to the page module so the Ticket Reservation page can pre-select the match when navigated from a "Buy Ticket" button.

Navigation is completed synchronously (DOM swap) or asynchronously (data fetch then render). The 2-second navigation requirement from Req 1.3 is met because JSON files are static assets served from the same origin.

---

## Components and Interfaces

### Navigation Component (`nav.js`)

Renders the `<header>` with `<nav>` containing four links. On every route change the active link class is updated by removing and re-applying the active indicator class (`border-b-2 border-white font-bold` or equivalent).

On mobile (≤767px) the nav collapses behind a hamburger button. The button toggles a CSS class on the link container (`hidden` ↔ `flex flex-col`). ARIA attributes:
- `<button aria-label="Toggle navigation" aria-expanded="false/true" aria-controls="nav-links">`
- `<ul id="nav-links" role="list">`

**Interface (called by router.js):**
```js
nav.setActiveRoute(hash: string): void
```

---

### Match Card Component (`matchCard.js`)

Renders one match entry. Applies a visual style based on whether the match is in the future or past.

**Interface:**
```js
renderMatchCard(match: Match, hasTicket: boolean): string  // returns HTML string
```

---

### Ticket Card Component (`ticketCard.js`)

Renders one ticket category selection card. Manages selected/unselected visual state.

**Interface:**
```js
renderTicketCard(category: TicketCategory, isSelected: boolean): string
```

---

### Reservation Form Component (`reservationForm.js`)

A multi-step form rendered inside the Ticket Reservation page. Manages:
1. Category selection state
2. Form field state (name, email, phone, match, seats)
3. Real-time price calculation
4. Validation state per field
5. Confirmation display state

**Interface:**
```js
ReservationForm.init(container: HTMLElement, params: { matchId?: string }): void
ReservationForm.reset(): void
```

Internally, the form stores its state in a plain JS object and re-renders affected DOM nodes on each state change rather than full re-renders, keeping interactions snappy.

---

### Player Card Component (`playerCard.js`)

**Interface:**
```js
renderPlayerCard(player: Player): string
```

Renders name, jersey number, position, and photo (`<img alt="[name] – [position]">`). Falls back to `/assets/images/placeholder-avatar.svg` on `onerror`.

---

### Coach Card Component (`coachCard.js`)

**Interface:**
```js
renderCoachCard(coach: Coach): string
```

Renders name, role, and photo. Same avatar fallback as player cards.

---

## Data Models

### Match

```js
// matches.json — array of Match objects
{
  "id": "string",              // unique identifier, e.g. "match-001"
  "homeTeam": "string",        // e.g. "FC Kiro"
  "awayTeam": "string",        // e.g. "Rival United"
  "date": "YYYY-MM-DD",        // ISO date for reliable sorting
  "time": "HH:MM",             // 24-hour format
  "venue": "string",
  "hasTicket": true | false,   // whether a "Buy Ticket" button appears
  "totalCapacity": number,     // total seats for this match
  "reservedSeats": number      // seats already reserved (static in JSON)
}
```

Display formatting (DD/MM/YYYY and HH:MM) is handled at render time, not stored in data.

---

### Player

```js
// players.json — array of Player objects
{
  "id": "string",
  "name": "string",
  "jerseyNumber": number,      // 1–99 inclusive
  "position": "Goalkeeper" | "Defender" | "Midfielder" | "Forward",
  "photoUrl": "string"         // relative path or empty string
}
```

Position category grouping order: Goalkeepers → Defenders → Midfielders → Forwards.

---

### Coach

```js
// coaches.json — array of Coach objects
{
  "id": "string",
  "name": "string",
  "role": "string",            // e.g. "Head Coach", "Assistant Coach"
  "photoUrl": "string"
}
```

---

### TicketCategory

```js
// ticketCategories.json — array of TicketCategory objects
{
  "id": "normal" | "vip" | "kids",
  "name": "string",            // display name
  "price": number,             // in local currency units
  "description": "string",     // max 150 characters
  "benefits": ["string"]       // VIP must include ≥1 benefit not in Normal/Kids
}
```

Price constraint enforced at design time in the data file: `normal.price ≤ kids.price` and `normal.price ≤ vip.price`. The rendering layer reads prices from the JSON — it does not hard-code them.

---

### ReservationState (in-memory only)

```js
// Not persisted — lives in reservationForm.js module scope
{
  selectedCategoryId: string | null,
  selectedMatchId: string | null,
  fullName: string,
  email: string,
  phone: string,
  seats: number,               // 1–10
  errors: {
    category: string | null,
    fullName: string | null,
    email: string | null,
    phone: string | null,
    seats: string | null,
    match: string | null
  },
  confirmed: boolean
}
```

On "Book Another Ticket" action: `ReservationForm.reset()` sets all fields back to defaults and `confirmed` to `false`.

---

## Navigation and Routing Design

### Router Implementation

`router.js` exports a single `initRouter()` function called once at startup. Internally it:

1. Reads `window.location.hash` on `DOMContentLoaded`.
2. Normalises an empty or unrecognised hash to `#home`.
3. Separates the hash base from query params: `#tickets?matchId=3` → base `tickets`, params `{ matchId: "3" }`.
4. Looks up the page module in the route registry.
5. Calls the page module's `render(container, params)` method, passing `document.getElementById('app')` as the container.
6. Calls `nav.setActiveRoute(base)` to update the active indicator.

```
Route registry:
  "home"     → HomeView
  "schedule" → ScheduleView
  "tickets"  → TicketsView
  "squad"    → SquadView
```

On `hashchange`, steps 2–6 repeat. There is no history manipulation; the browser's back/forward buttons work naturally with hash navigation.

### Active Link Indicator

The nav renders four `<a>` elements. On each route change, `nav.setActiveRoute` iterates the links and toggles an `aria-current="page"` attribute plus a Tailwind active class (e.g., `border-b-2 border-accent font-semibold`). Non-active links have these classes removed. The indicator persists as long as the current hash matches, satisfying Req 1.4.

### "Buy Ticket" Deep Link

Match cards on the Schedule page render:
```html
<a href="#tickets?matchId=match-001" class="...">Buy Ticket</a>
```

When the Tickets view loads, it reads `params.matchId` and pre-selects that match in the reservation form's match dropdown.

### Mobile Navigation Toggle

The hamburger button (`<button>`) toggles the class list of `#nav-links`. On screens ≤767px (Tailwind `md:` breakpoint and below), `#nav-links` starts with class `hidden`. After toggle it gets `flex flex-col` replacing `hidden`. Pressing the button again restores `hidden`. Keyboard users can Tab to the button and activate with Enter/Space; pressing Escape also closes the menu.

---

## Ticket Reservation Flow

The reservation flow is a two-step wizard rendered inside a single view (`#tickets`). State is held in the `ReservationForm` module; no page reload occurs between steps.

```
Step 1: Category Selection
         │
         ▼
   [Choose Normal / VIP / Kids]
   ← validation: must select one before proceeding
         │
         ▼
Step 2: Booking Form
         │
         ├── Full Name (max 100 chars, required)
         ├── Email (required, valid format)
         ├── Phone (required, digits/spaces/hyphens/leading +)
         ├── Match (dropdown, pre-selected if matchId param present)
         ├── Seats (1–10, required; checked against available capacity)
         └── Total Price (recalculates within 1s on seats/category change)
         │
         ▼
   [Submit] ← all fields valid
         │
         ▼
Confirmation Summary
         ├── Visitor name
         ├── Selected match (formatted date/time/teams)
         ├── Ticket category
         ├── Number of seats
         └── Total price
         │
         ▼
   [Book Another Ticket] → resets form to Step 1 defaults
```

### Step Transitions

- "Continue" / "Proceed" button at bottom of Step 1 validates category selection. If no category selected, inline error shown and Step 2 is not rendered.
- Navigating back to Step 1 (via a "Back" link or breadcrumb) restores the previously selected category — the `ReservationState.selectedCategoryId` is preserved in memory.
- On form submit, client-side validation runs synchronously. If any field is invalid, inline errors appear next to each offending field and submission is blocked.

### Price Calculation

```js
totalPrice = category.price * seats
```

Recalculated on every `input` event on the seats field and on every category card click. Updated DOM element: `<span id="total-price">`.

### Capacity Validation

`availableSeats = match.totalCapacity - match.reservedSeats`. If `requestedSeats > availableSeats`, a field-level error is shown. Because data is static JSON (no live updates), this is a front-end advisory check only.

---

## Responsive Layout Strategy

The design uses a mobile-first approach with Tailwind breakpoints. No custom media queries are written; all layout changes are expressed through Tailwind utility classes.

### Breakpoints Used

| Breakpoint | Tailwind prefix | Range          | Layout intent             |
|------------|-----------------|----------------|---------------------------|
| Default    | (none)          | 0px – 767px    | Single column             |
| md         | `md:`           | 768px – 1023px | Two columns where suitable|
| lg         | `lg:`           | ≥ 1024px       | Three+ columns, full nav  |

### Per-Page Layout

**Navigation:** Full horizontal nav on `lg:`, collapses to hamburger on default/`md:`.

**Home:** Hero section full-width, feature highlights in `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

**Match Schedule:** Cards in `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. Each card is a `<article>` with flex column layout internally.

**Ticket Reservation:**
- Category cards: `grid grid-cols-1 md:grid-cols-3` (three side-by-side on tablet+).
- Booking form: single column always (`max-w-lg mx-auto`).
- Confirmation summary: card with `max-w-md mx-auto`.

**Squad & Coaches:**
- Player cards: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
- Coach cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

### Single-Column Mobile (320px–767px)

All grids resolve to one column (default Tailwind grid without `md:` prefix). The nav link list is hidden and toggled. Ticket category cards stack vertically. No element causes horizontal overflow because all widths use `w-full` or `max-w-*` with `mx-auto`.

### Image Handling

Player/coach photos use `aspect-square object-cover` to maintain uniform card heights regardless of source image ratio. The placeholder SVG is square by design.

---

## Accessibility Implementation

### Semantic HTML Structure

Every page is wrapped in:
```html
<body>
  <header>
    <nav aria-label="Main navigation">…</nav>
  </header>
  <main id="app" tabindex="-1">…</main>
  <footer>…</footer>
</body>
```

`<section>` elements inside `<main>` carry descriptive `aria-labelledby` pointing to their visible heading. Match cards are `<article>` elements. The squad page uses `<section>` for Players and Coaches, each with an `<h2>`. Position groups use `<section>` with `<h3>`.

### Focus Management

On route change, `router.js` calls `document.getElementById('app').focus()` (the `<main>` has `tabindex="-1"`) so keyboard users land at the top of the new view's content rather than remaining on the nav link. This is consistent with single-page app focus management best practices.

On form submission failure, focus is moved to the first invalid field.

### Keyboard Navigation

- All interactive elements (links, buttons, form controls) are natively focusable — no `tabindex` manipulation needed beyond the `<main>` anchor.
- The hamburger button responds to Enter and Space (default button behaviour). Escape closes the menu and returns focus to the hamburger button.
- The ticket category cards are rendered as `<button>` elements (not `<div>`), making them keyboard-operable by default.

### Focus Indicator

Tailwind's `focus-visible:ring-2 focus-visible:ring-offset-2` utility is applied to all interactive elements. This satisfies the "visible when keyboard navigating, hidden when using pointer" requirement (Req 6.5 / 6.6) because `focus-visible` only activates for keyboard focus.

### Alt Text

- Player/coach photos: `alt="[name], [position or role]"`.
- Placeholder avatar: `alt=""` (decorative — the card text already conveys identity).
- Club logo / hero image: descriptive `alt` text.
- Purely decorative images: `alt=""`.

### Color Contrast

The color palette is selected to maintain ≥4.5:1 for normal text and ≥3:1 for large text. Key pairs:

| Element            | Foreground  | Background  | Ratio target |
|--------------------|-------------|-------------|--------------|
| Body text          | `gray-900`  | `white`     | ≥ 4.5:1      |
| Nav links          | `white`     | `green-800` | ≥ 4.5:1      |
| Upcoming badge     | `white`     | `green-600` | ≥ 4.5:1      |
| Past badge         | `gray-700`  | `gray-200`  | ≥ 4.5:1      |
| VIP card accent    | `white`     | `yellow-600`| ≥ 4.5:1      |
| Button text        | `white`     | `green-700` | ≥ 4.5:1      |

Exact Tailwind color values are validated against WCAG 2.1 AA before finalising the palette.

### ARIA Live Region

When the total price updates in the reservation form, the `<span id="total-price">` is marked `aria-live="polite"` so screen readers announce the new value without interrupting the user.

---

## File / Folder Structure

```
/
├── index.html                  ← single HTML entry point
│
├── /js/
│   ├── main.js                 ← bootstraps router, nav, and initial render
│   ├── router.js               ← hash-based SPA router
│   ├── data.js                 ← fetch helpers (loadMatches, loadPlayers, etc.)
│   ├── utils.js                ← shared helpers (date formatting, validation)
│   │
│   ├── /pages/
│   │   ├── home.js             ← Home view render function
│   │   ├── schedule.js         ← Match Schedule view
│   │   ├── tickets.js          ← Ticket Reservation view
│   │   └── squad.js            ← Squad & Coaches view
│   │
│   └── /components/
│       ├── nav.js              ← navigation bar + mobile toggle
│       ├── matchCard.js        ← single match card HTML factory
│       ├── ticketCard.js       ← single ticket category card HTML factory
│       ├── reservationForm.js  ← multi-step reservation form with state
│       ├── playerCard.js       ← single player card HTML factory
│       └── coachCard.js        ← single coach card HTML factory
│
├── /data/
│   ├── matches.json
│   ├── players.json
│   ├── coaches.json
│   └── ticketCategories.json
│
└── /assets/
    ├── /images/
    │   ├── /players/           ← player photos (e.g. player-001.jpg)
    │   ├── /coaches/           ← coach photos
    │   └── placeholder-avatar.svg
    └── /icons/
        └── hamburger.svg       ← (or inline SVG in nav.js)
```

`index.html` loads:
1. Tailwind CSS via CDN `<link>` in `<head>`.
2. All JS modules as `<script type="module" src="js/main.js">` at end of `<body>`.

No bundler, no transpiler, no npm. ES module syntax is used natively (supported by all modern browsers).

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Router dispatches the correct view

*For any* valid route hash in the route registry (`home`, `schedule`, `tickets`, `squad`), invoking the router's dispatch function with that hash should render content belonging exclusively to the corresponding page module into the app container.

**Validates: Requirements 1.3**

---

### Property 2: Active navigation indicator matches current route

*For any* valid route string, after calling `nav.setActiveRoute(route)`, exactly one navigation link should carry `aria-current="page"` and the active indicator CSS class, and that link must correspond to the given route.

**Validates: Requirements 1.4**

---

### Property 3: Match card renders all required fields

*For any* Match object, `renderMatchCard` should produce HTML containing the home team name, away team name, match date formatted as DD/MM/YYYY, match time formatted as HH:MM, venue, a "Buy Ticket" link when `hasTicket` is `true`, and no "Buy Ticket" link when `hasTicket` is `false`.

**Validates: Requirements 2.1, 2.3**

---

### Property 4: Match classification correctly distinguishes upcoming from past

*For any* match date/time string, `categorizeMatch(match, now)` should return `"upcoming"` if and only if the match date/time is on or after `now`, and `"past"` if and only if it is strictly before `now`.

**Validates: Requirements 2.2**

---

### Property 5: Match sorting produces ascending chronological order

*For any* array of Match objects with varying dates and times, `sortMatches(matches)` should return an array where for every adjacent pair the date of element `i` is less than or equal to the date of element `i+1`, and for same-date pairs the time of element `i` is less than or equal to the time of element `i+1`.

**Validates: Requirements 2.5**

---

### Property 6: Ticket category card renders required fields

*For any* TicketCategory object, `renderTicketCard(category, isSelected)` should produce HTML containing the category name, price value, and description text (within 150 characters).

**Validates: Requirements 3.1**

---

### Property 7: Ticket category selection is mutually exclusive

*For any* array of TicketCategory objects and any one selected category ID from that array, rendering the category cards should produce exactly one card with the active indicator class (matching the selected ID) and all other cards without that class.

**Validates: Requirements 3.2**

---

### Property 8: Normal ticket price does not exceed VIP or Kids ticket price

*For any* valid ticketCategories dataset loaded from the data file, `normal.price <= vip.price` and `normal.price <= kids.price` must hold simultaneously.

**Validates: Requirements 3.3**

---

### Property 9: Previously selected category is preserved across step navigation

*For any* valid category ID that was assigned to `ReservationState.selectedCategoryId`, reading that field back immediately (simulating a back-navigation) should return the same category ID without modification.

**Validates: Requirements 3.7**

---

### Property 10: Confirmation summary contains all required fields

*For any* valid `ReservationState` (all fields correctly filled), `renderConfirmation(state, matches, categories)` should produce HTML that includes the visitor's full name, the selected match's team names and formatted date/time, the ticket category name, the number of seats, and the computed total price.

**Validates: Requirements 4.2**

---

### Property 11: Form validation returns errors for every empty required field

*For any* `ReservationState` where one or more required fields (`fullName`, `email`, `phone`, `selectedMatchId`, `selectedCategoryId`, `seats`) are empty or null, `validateForm(state)` should return an errors object with a non-null, non-empty error string for each and every empty field, and no error for fields that are correctly filled.

**Validates: Requirements 4.3**

---

### Property 12: Email validator rejects all invalid email formats

*For any* string that does not conform to the standard email format (local-part `@` domain), `validateEmail(value)` should return a non-empty error string; for any string that does conform, it should return null.

**Validates: Requirements 4.4**

---

### Property 13: Total price equals category price multiplied by seat count

*For any* TicketCategory with a numeric price and any seat count between 1 and 10 inclusive, `calculateTotalPrice(category, seats)` should return exactly `category.price * seats`.

**Validates: Requirements 4.5**

---

### Property 14: Phone validator rejects strings with disallowed characters

*For any* string containing at least one character outside the allowed set (digits `0-9`, spaces, hyphens `-`, and an optional leading plus sign `+`), `validatePhone(value)` should return a non-empty error string; for any string containing only allowed characters, it should return null.

**Validates: Requirements 4.7**

---

### Property 15: Seat availability validator rejects over-capacity requests

*For any* match with a computed `availableSeats = totalCapacity - reservedSeats` and any requested seat count strictly greater than `availableSeats`, `validateSeatsAvailability(requested, available)` should return a non-empty error string; for any requested count ≤ `availableSeats`, it should return null.

**Validates: Requirements 4.8**

---

### Property 16: Player card renders all required fields with correct alt text

*For any* Player object, `renderPlayerCard(player)` should produce HTML containing the player's name, jersey number, position label, an `<img>` element whose `alt` attribute is non-empty and contains the player's name, and a `src` pointing to the placeholder avatar when `photoUrl` is empty.

**Validates: Requirements 5.1, 5.4**

---

### Property 17: Coach card renders all required fields

*For any* Coach object, `renderCoachCard(coach)` should produce HTML containing the coach's name, role, and an `<img>` element with a non-empty `alt` attribute containing the coach's name.

**Validates: Requirements 5.2**

---

### Property 18: Player grouping preserves all players in correct position groups and fixed order

*For any* array of Player objects, `groupPlayersByPosition(players)` should return a list of groups where: (a) the groups appear in the fixed order Goalkeepers → Defenders → Midfielders → Forwards, (b) every player from the input appears in exactly one group matching their position, and (c) no player is omitted or duplicated.

**Validates: Requirements 5.5**

---

## Error Handling

### Data Loading Errors

`data.js` wraps every `fetch()` call in a try/catch and returns a discriminated result:

```js
// data.js pattern
async function loadMatches() {
  try {
    const res = await fetch('/data/matches.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true, data: await res.json() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
```

Each page module checks the result and renders either content or an error state:
- **Empty data** (`data.length === 0`): renders empty state message specific to that page.
- **Fetch failure** (`ok: false`): renders a distinct error message (e.g., "Failed to load match schedule. Please try again later."). This satisfies Req 2.6 — the error state is visually distinct from the empty state.

### Form Validation Errors

All validation runs client-side and synchronously before any DOM update. The `validateForm` function returns an `errors` object; the form component maps each non-null error to an inline `<p role="alert">` element rendered immediately after the corresponding field. Errors are cleared per-field as the user corrects input.

### Photo Load Errors

All `<img>` elements for player/coach photos use an inline `onerror` handler:

```html
<img src="/assets/images/players/player-001.jpg"
     alt="Player Name – Midfielder"
     onerror="this.src='/assets/images/placeholder-avatar.svg'; this.onerror=null;">
```

Setting `this.onerror = null` after the first fallback prevents infinite error loops if the placeholder itself is missing.

### Unknown Route

If the hash resolves to an unknown route string (not in the route registry), the router redirects to `#home` by setting `window.location.hash = 'home'`, which triggers another `hashchange` event handled normally.

### Missing Match ID Parameter

If the Ticket Reservation page receives a `matchId` param that does not match any match in `matches.json`, the match dropdown defaults to empty/unselected and the user can manually select a match. No error is thrown.

---

## Testing Strategy

### Overview

Because this is a no-build Vanilla JS project, testing uses a lightweight setup: **Vitest** (with JSDOM for DOM testing) configured to run without a bundler step. All test files live in a `/tests/` directory mirroring the `/js/` structure.

PBT is applicable here because the core logic (validators, formatters, sorters, renderers, router dispatch) consists of pure or near-pure functions with clear input/output behavior and large input spaces. Testing with 100+ random inputs meaningfully reveals edge cases in date sorting, price calculation, email/phone validation, and rendering completeness.

### Property-Based Testing Library

**fast-check** is used for property-based tests. It is the most widely adopted JS/TS PBT library and integrates directly with Vitest.

```
npm install --save-dev vitest @vitest/coverage-v8 fast-check jsdom
```

Each property test is configured with a minimum of 100 runs (`numRuns: 100`).

### Dual Testing Approach

**Unit / Example Tests** — verify specific scenarios:
- Nav renders four links with correct hrefs.
- Empty schedule shows empty state message.
- Data load failure shows error message distinct from empty state.
- Confirmation view includes "Book Another Ticket" button.
- Squad page renders players section before coaches section.
- Kids ticket description contains "under 12".
- VIP ticket has at least one exclusive benefit.

**Property Tests** — verify universal properties (all 18 properties above):
- Each property maps to a single `it.prop(...)` / `fc.property(...)` test.
- Generators produce arbitrary match arrays, player arrays, form states, strings, numeric ranges, etc.
- Each test runs 100+ iterations.

### Test File Structure

```
/tests/
├── router.test.js          ← Properties 1, 2
├── matchCard.test.js       ← Properties 3, 4, 5
├── ticketCard.test.js      ← Properties 6, 7, 8, 9
├── reservationForm.test.js ← Properties 10, 11, 12, 13, 14, 15
├── playerCard.test.js      ← Property 16
├── coachCard.test.js       ← Property 17
└── squad.test.js           ← Property 18
```

### Test Tag Format

Each property test carries a comment header:

```js
// Feature: club-soccer-website, Property 5: Match sorting produces ascending chronological order
it.prop([fc.array(matchArbitrary, { minLength: 2 })])
  ('sortMatches returns ascending order', (matches) => {
    const sorted = sortMatches(matches);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(compareMatchDateTime(sorted[i], sorted[i+1])).toBeLessThanOrEqual(0);
    }
  }, { numRuns: 100 });
```

### Integration / Smoke Tests

The following are excluded from property testing and covered by manual review or single-execution checks:
- Semantic HTML structure audit (Req 6.1, 6.9)
- WCAG color contrast audit (Req 6.3, 6.4)
- Keyboard navigation and focus indicator (Req 6.5, 6.6)
- Responsive layout at three breakpoints (Req 1.2, 6.7, 6.8)
- Mobile hamburger menu toggle (Req 1.5)

These are documented as manual test cases in a separate QA checklist.
