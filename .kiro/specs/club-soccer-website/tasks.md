# Implementation Plan: Club Soccer Website

## Overview

Implement a static hash-based SPA using HTML5, Tailwind CSS (CDN), and Vanilla JavaScript (ES modules, no build tools). The project is structured around a central `index.html`, a `/js/` module tree (router, data helpers, pages, components), static `/data/` JSON files, and a `/tests/` suite powered by Vitest + fast-check (PBT) + jsdom. Tasks proceed from scaffolding and data layer through each page/component, then testing, and finally wiring everything together.

---

## Tasks

- [ ] 1. Scaffold project structure and static assets
  - Create the full directory tree: `/js/pages/`, `/js/components/`, `/data/`, `/assets/images/players/`, `/assets/images/coaches/`, `/assets/icons/`, `/tests/`
  - Create `index.html` with `<header>`, `<main id="app" tabindex="-1">`, `<footer>`, Tailwind CDN `<link>` in `<head>`, and `<script type="module" src="js/main.js">` at end of `<body>`; include semantic HTML5 shell satisfying Req 6.1
  - Create `placeholder-avatar.svg` in `/assets/images/` (square SVG silhouette)
  - Create stub empty files for all JS modules: `js/main.js`, `js/router.js`, `js/data.js`, `js/utils.js`, `js/pages/home.js`, `js/pages/schedule.js`, `js/pages/tickets.js`, `js/pages/squad.js`, `js/components/nav.js`, `js/components/matchCard.js`, `js/components/ticketCard.js`, `js/components/reservationForm.js`, `js/components/playerCard.js`, `js/components/coachCard.js`
  - Create `package.json` with `vitest`, `@vitest/coverage-v8`, `fast-check`, and `jsdom` as dev dependencies; add `"test": "vitest --run"` script
  - Create `vitest.config.js` setting `environment: 'jsdom'` and pointing at `/tests/`
  - _Requirements: 1.1, 6.1_

- [ ] 2. Create static JSON data files
  - [ ] 2.1 Create `data/matches.json` with at least 6 match objects (mix of upcoming and past dates) conforming to the Match schema: `id`, `homeTeam`, `awayTeam`, `date` (YYYY-MM-DD), `time` (HH:MM), `venue`, `hasTicket`, `totalCapacity`, `reservedSeats`
    - _Requirements: 2.1, 2.3, 4.1, 4.8_

  - [ ] 2.2 Create `data/ticketCategories.json` with exactly three objects: `id` ∈ `{normal, vip, kids}`, `name`, `price`, `description` (≤ 150 chars), `benefits`; enforce `normal.price ≤ vip.price` and `normal.price ≤ kids.price`; VIP must list ≥1 exclusive benefit; Kids description must reference "under 12"
    - _Requirements: 3.1, 3.3, 3.4, 3.5_

  - [ ] 2.3 Create `data/players.json` with at least 11 player objects conforming to Player schema: `id`, `name`, `jerseyNumber` (1–99), `position` ∈ `{Goalkeeper, Defender, Midfielder, Forward}`, `photoUrl`; include at least one player with empty `photoUrl`
    - _Requirements: 5.1, 5.4, 5.5_

  - [ ] 2.4 Create `data/coaches.json` with at least 3 coach objects conforming to Coach schema: `id`, `name`, `role`, `photoUrl`; include at least one coach with empty `photoUrl`
    - _Requirements: 5.2, 5.4_

- [ ] 3. Implement `js/data.js` — async fetch helpers
  - [ ] 3.1 Implement `loadMatches()`, `loadPlayers()`, `loadCoaches()`, and `loadTicketCategories()` as async functions returning `{ ok: true, data }` on success and `{ ok: false, error }` on network or parse failure; wrap every `fetch()` in try/catch; check `res.ok` before parsing JSON
    - _Requirements: 2.6_

- [ ] 4. Implement `js/utils.js` — shared helpers and validators
  - [ ] 4.1 Implement `formatDate(isoDate: string): string` — converts `YYYY-MM-DD` to `DD/MM/YYYY`; implement `formatTime(time: string): string` — returns HH:MM unchanged; implement `categorizeMatch(match, now): "upcoming" | "past"` — returns `"upcoming"` iff match date/time ≥ `now`; implement `sortMatches(matches): Match[]` — sorts by ascending date then ascending time as secondary key
    - _Requirements: 2.1, 2.2, 2.5_

  - [ ]* 4.2 Write property test for `categorizeMatch` (Property 4)
    - **Property 4: Match classification correctly distinguishes upcoming from past**
    - **Validates: Requirements 2.2**
    - Generate arbitrary ISO date/time pairs for `match` and `now`; assert return value matches expected classification

  - [ ]* 4.3 Write property test for `sortMatches` (Property 5)
    - **Property 5: Match sorting produces ascending chronological order**
    - **Validates: Requirements 2.5**
    - Generate arrays of at least 2 Match objects with arbitrary dates and times; assert every adjacent pair satisfies `compareMatchDateTime(sorted[i], sorted[i+1]) ≤ 0`

  - [ ] 4.4 Implement `validateEmail(value: string): string | null` — returns null for valid email format, non-empty error string otherwise; implement `validatePhone(value: string): string | null` — allows digits, spaces, hyphens, optional leading `+`, rejects all other characters; implement `validateForm(state): errors` — returns an errors object with non-null entries for every empty or invalid required field (`fullName`, `email`, `phone`, `selectedMatchId`, `selectedCategoryId`, `seats`)
    - _Requirements: 4.3, 4.4, 4.7_

  - [ ]* 4.5 Write property test for `validateEmail` (Property 12)
    - **Property 12: Email validator rejects all invalid email formats**
    - **Validates: Requirements 4.4**
    - Use `fc.emailAddress()` for valid inputs (expect null) and `fc.string()` filtered to non-email strings for invalid inputs (expect non-empty error)

  - [ ]* 4.6 Write property test for `validatePhone` (Property 14)
    - **Property 14: Phone validator rejects strings with disallowed characters**
    - **Validates: Requirements 4.7**
    - Generate strings with only allowed chars and strings containing at least one disallowed char; assert correct return value in each case

  - [ ]* 4.7 Write property test for `validateForm` (Property 11)
    - **Property 11: Form validation returns errors for every empty required field**
    - **Validates: Requirements 4.3**
    - Generate arbitrary `ReservationState` objects where a random subset of required fields is empty; assert errors object has non-null entry for each empty field and null for filled fields

  - [ ] 4.8 Implement `calculateTotalPrice(category, seats): number` — returns `category.price * seats`
    - _Requirements: 4.5_

  - [ ]* 4.9 Write property test for `calculateTotalPrice` (Property 13)
    - **Property 13: Total price equals category price multiplied by seat count**
    - **Validates: Requirements 4.5**
    - Generate arbitrary numeric price ≥ 0 and seats ∈ [1, 10]; assert result equals `price * seats` exactly

  - [ ] 4.10 Implement `validateSeatsAvailability(requested: number, available: number): string | null` — returns non-empty error string if `requested > available`, null otherwise
    - _Requirements: 4.8_

  - [ ]* 4.11 Write property test for `validateSeatsAvailability` (Property 15)
    - **Property 15: Seat availability validator rejects over-capacity requests**
    - **Validates: Requirements 4.8**
    - Generate arbitrary `totalCapacity`, `reservedSeats`, and `requestedSeats`; assert error iff `requested > available`

  - [ ] 4.12 Implement `groupPlayersByPosition(players: Player[]): { position: string, players: Player[] }[]` — returns groups in fixed order: Goalkeepers → Defenders → Midfielders → Forwards; every input player appears in exactly one group
    - _Requirements: 5.5_

  - [ ]* 4.13 Write property test for `groupPlayersByPosition` (Property 18)
    - **Property 18: Player grouping preserves all players in correct position groups and fixed order**
    - **Validates: Requirements 5.5**
    - Generate arbitrary arrays of Player objects with positions drawn from the four valid values; assert fixed group order, every player in exactly one group, no duplicates or omissions

- [ ] 5. Checkpoint — ensure data layer and utilities are solid
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement navigation component (`js/components/nav.js`)
  - [ ] 6.1 Implement `renderNav(): string` — returns HTML for `<header>` containing `<nav aria-label="Main navigation">` with four `<a>` links (`#home`, `#schedule`, `#tickets`, `#squad}`); on `lg:` screens render as horizontal row; on default/`md:` render behind a hamburger `<button aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav-links">`; `<ul id="nav-links" role="list">` starts with class `hidden` on mobile
    - _Requirements: 1.1, 1.5, 6.1_

  - [ ] 6.2 Implement `nav.setActiveRoute(hash: string): void` — iterates all nav `<a>` links and toggles `aria-current="page"` plus the active indicator Tailwind class (`border-b-2 border-accent font-semibold`) onto the matching link and removes them from all others
    - _Requirements: 1.4_

  - [ ] 6.3 Implement hamburger toggle logic in `nav.js` — clicking the button toggles `#nav-links` between `hidden` and `flex flex-col`; update `aria-expanded` accordingly; pressing Escape closes the menu and returns focus to the hamburger button
    - _Requirements: 1.5_

  - [ ]* 6.4 Write property test for `nav.setActiveRoute` (Property 2)
    - **Property 2: Active navigation indicator matches current route**
    - **Validates: Requirements 1.4**
    - For each valid route string, call `setActiveRoute`, then assert exactly one `<a>` carries `aria-current="page"` and the active class, and it corresponds to the given route

- [ ] 7. Implement hash-based router (`js/router.js`)
  - [ ] 7.1 Implement `initRouter()` — registers `DOMContentLoaded` and `hashchange` listeners; on each event reads `window.location.hash`, normalises empty/unknown hash to `#home`, parses base route and query params (e.g. `#tickets?matchId=3` → base `"tickets"`, params `{ matchId: "3" }`), looks up the page module in the route registry, calls `page.render(container, params)`, calls `nav.setActiveRoute(base)`, and calls `document.getElementById('app').focus()` for keyboard focus management; unknown routes redirect to `#home`
    - _Requirements: 1.3, 1.4_

  - [ ]* 7.2 Write property test for router dispatch (Property 1)
    - **Property 1: Router dispatches the correct view**
    - **Validates: Requirements 1.3**
    - For each valid route hash, invoke the router dispatch function and assert rendered content in `#app` belongs exclusively to the corresponding page module (check for a page-specific marker element or data attribute)

- [ ] 8. Implement match card component (`js/components/matchCard.js`)
  - [ ] 8.1 Implement `renderMatchCard(match: Match, hasTicket: boolean): string` — returns an `<article>` HTML string containing home team, away team, date formatted as DD/MM/YYYY, time as HH:MM, venue; applies upcoming/past visual style using `categorizeMatch`; renders `<a href="#tickets?matchId=[id]">Buy Ticket</a>` when `hasTicket` is true and omits it when false
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 8.2 Write property test for `renderMatchCard` (Property 3)
    - **Property 3: Match card renders all required fields**
    - **Validates: Requirements 2.1, 2.3**
    - Generate arbitrary Match objects; assert rendered HTML contains homeTeam, awayTeam, DD/MM/YYYY-formatted date, HH:MM time, venue; assert "Buy Ticket" link present iff `hasTicket` is true

- [ ] 9. Implement Match Schedule page (`js/pages/schedule.js`)
  - [ ] 9.1 Implement `ScheduleView.render(container, params)` — calls `loadMatches()`, handles `ok: false` by rendering a distinct error message (Req 2.6), handles empty array by rendering empty state message (Req 2.4), otherwise sorts matches via `sortMatches` and renders each using `renderMatchCard` inside a responsive grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 10. Implement ticket card component (`js/components/ticketCard.js`)
  - [ ] 10.1 Implement `renderTicketCard(category: TicketCategory, isSelected: boolean): string` — returns a `<button>` HTML string (keyboard-accessible) showing category name, price, and description (≤ 150 chars); applies active indicator class when `isSelected` is true; active class is mutually exclusive (only the selected card carries it)
    - _Requirements: 3.1, 3.2_

  - [ ]* 10.2 Write property test for `renderTicketCard` (Property 6)
    - **Property 6: Ticket category card renders required fields**
    - **Validates: Requirements 3.1**
    - Generate arbitrary TicketCategory objects; assert rendered HTML contains name, price, and description ≤ 150 characters

  - [ ]* 10.3 Write property test for ticket category mutual exclusivity (Property 7)
    - **Property 7: Ticket category selection is mutually exclusive**
    - **Validates: Requirements 3.2**
    - Generate array of 3 TicketCategory objects and a randomly selected ID; render all three cards; assert exactly one carries the active class and it matches the selected ID

  - [ ]* 10.4 Write property test for Normal ticket price constraint (Property 8)
    - **Property 8: Normal ticket price does not exceed VIP or Kids ticket price**
    - **Validates: Requirements 3.3**
    - Load (or construct) any valid ticketCategories dataset; assert `normal.price <= vip.price` and `normal.price <= kids.price` simultaneously

- [ ] 11. Implement reservation form component (`js/components/reservationForm.js`)
  - [ ] 11.1 Implement `ReservationForm.init(container, params)` — initialises `ReservationState` with defaults; renders Step 1 (category selection using `renderTicketCard`); wires category card click handlers to update `selectedCategoryId` and re-render active state within 300ms (Req 3.2); stores state in module scope; if `params.matchId` is provided, pre-selects that match in Step 2
    - _Requirements: 3.1, 3.2, 3.7, 4.1_

  - [ ] 11.2 Implement Step 1 → Step 2 transition — "Continue" button runs category validation; if no category selected renders inline error (Req 3.6) and halts; otherwise renders Step 2 booking form with fields: full name (max 100), email (max 254), phone (max 20), match dropdown, seats (min 1, max 10); displays running total price via `calculateTotalPrice` in `<span id="total-price" aria-live="polite">`; recalculates total on every `input` event on seats and on every category card click
    - _Requirements: 3.6, 4.1, 4.5_

  - [ ] 11.3 Implement form submission handler — runs `validateForm(state)` synchronously; if any errors, renders inline `<p role="alert">` beside each invalid field and focuses first invalid field (Req 4.3); if all valid, calls `renderConfirmation` and displays the confirmation summary
    - _Requirements: 4.2, 4.3, 4.4, 4.7, 4.8_

  - [ ] 11.4 Implement `renderConfirmation(state, matches, categories): string` — returns HTML showing visitor name, selected match (formatted date/time and teams), ticket category name, number of seats, and total price; includes a "Book Another Ticket" button wired to `ReservationForm.reset()`
    - _Requirements: 4.2, 4.6_

  - [ ] 11.5 Implement `ReservationForm.reset()` — resets `ReservationState` to all-default empty values, sets `confirmed` to false, and re-renders Step 1
    - _Requirements: 4.6_

  - [ ]* 11.6 Write property test for `renderConfirmation` (Property 10)
    - **Property 10: Confirmation summary contains all required fields**
    - **Validates: Requirements 4.2**
    - Generate arbitrary valid `ReservationState` objects with all fields correctly filled; assert rendered HTML contains visitor name, match team names and formatted date/time, category name, seat count, and total price

  - [ ]* 11.7 Write property test for previously selected category preservation (Property 9)
    - **Property 9: Previously selected category is preserved across step navigation**
    - **Validates: Requirements 3.7**
    - Assign arbitrary valid category ID to `ReservationState.selectedCategoryId`; simulate back-navigation by reading the field; assert the same ID is returned without modification

- [ ] 12. Checkpoint — ensure navigation, routing, schedule, and ticketing modules are working
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement player card component (`js/components/playerCard.js`)
  - [ ] 13.1 Implement `renderPlayerCard(player: Player): string` — returns an HTML card string containing player name, jersey number, position, and an `<img>` with `alt="[name], [position]"`; uses `onerror` fallback to `/assets/images/placeholder-avatar.svg` with `this.onerror=null`; when `photoUrl` is empty, `src` is set directly to the placeholder
    - _Requirements: 5.1, 5.4_

  - [ ]* 13.2 Write property test for `renderPlayerCard` (Property 16)
    - **Property 16: Player card renders all required fields with correct alt text**
    - **Validates: Requirements 5.1, 5.4**
    - Generate arbitrary Player objects (including cases with empty `photoUrl`); assert rendered HTML contains name, jersey number, position, non-empty alt with player name, and placeholder src when photoUrl is empty

- [ ] 14. Implement coach card component (`js/components/coachCard.js`)
  - [ ] 14.1 Implement `renderCoachCard(coach: Coach): string` — returns HTML containing coach name, role, and `<img>` with `alt="[name], [role]"`; same `onerror` fallback pattern as player card
    - _Requirements: 5.2, 5.4_

  - [ ]* 14.2 Write property test for `renderCoachCard` (Property 17)
    - **Property 17: Coach card renders all required fields**
    - **Validates: Requirements 5.2**
    - Generate arbitrary Coach objects; assert rendered HTML contains name, role, and `<img>` with non-empty alt attribute containing the coach's name

- [ ] 15. Implement Squad & Coaches page (`js/pages/squad.js`)
  - [ ] 15.1 Implement `SquadView.render(container, params)` — calls `loadPlayers()` and `loadCoaches()` in parallel; renders Players section (`<section aria-labelledby>` with `<h2>`) before Coaches section; within Players, calls `groupPlayersByPosition` and renders each position group as `<section>` with `<h3>`; renders each player via `renderPlayerCard`; displays empty state message in players section if no players (Req 5.6); displays empty state in coaches section if no coaches (Req 5.7); handles load failure with distinct error message
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 16. Implement Home page (`js/pages/home.js`)
  - [ ] 16.1 Implement `HomeView.render(container, params)` — renders a hero section (full-width, descriptive `alt` on hero image) and a feature highlights grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) with at least three items linking to Schedule, Tickets, and Squad pages; all images have appropriate `alt` attributes per Req 6.2; uses semantic `<section>` elements with `aria-labelledby`
    - _Requirements: 1.1, 6.1, 6.2_

- [ ] 17. Implement `js/main.js` — bootstrap entry point
  - [ ] 17.1 Wire `main.js` to call `renderNav()` and inject result into `<header>`, then call `initRouter()` to start the SPA; ensure `nav.js` hamburger toggle event listeners are attached after nav HTML is inserted into the DOM
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [ ] 18. Apply accessibility and responsive polish across all components
  - [ ] 18.1 Audit all `<img>` elements across rendered output to confirm: informational images have non-empty descriptive `alt`; decorative images have `alt=""`; placeholder avatar `<img>` in cards has `alt=""` (Req 6.2)
    - _Requirements: 6.2_

  - [ ] 18.2 Add `focus-visible:ring-2 focus-visible:ring-offset-2` Tailwind classes to all interactive elements (links, buttons, form inputs) to ensure keyboard focus indicator ≥ 2px (Req 6.5) while remaining hidden on pointer interaction (Req 6.6)
    - _Requirements: 6.5, 6.6_

  - [ ] 18.3 Verify all Tailwind responsive classes ensure single-column layout at 320–767px (Req 6.7) and multi-column layout at 768–1279px (Req 6.8) by reviewing grid class declarations; fix any grids that would cause horizontal overflow on mobile
    - _Requirements: 1.2, 6.7, 6.8_

- [ ] 19. Final checkpoint — full test suite green
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 5, 12, and 19 ensure incremental validation
- The design document includes 18 correctness properties; every `*` test sub-task references at least one of those properties by number
- Property tests use `fast-check` with `numRuns: 100` minimum per the design's testing strategy
- All styling uses Tailwind CSS utility classes only — no custom CSS file required (Req 6.9)
- Data files are static JSON; reservation confirmation is client-side only (no backend persistence)
- Run tests with: `npm test` (maps to `vitest --run` for single-execution, non-watch mode)

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 1, "tasks": ["3.1"] },
    { "id": 2, "tasks": ["4.1", "4.4", "4.8", "4.10", "4.12"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.5", "4.6", "4.7", "4.9", "4.11", "4.13"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3", "7.1", "8.1", "10.1", "13.1", "14.1"] },
    { "id": 5, "tasks": ["6.4", "7.2", "8.2", "10.2", "10.3", "10.4", "13.2", "14.2"] },
    { "id": 6, "tasks": ["9.1", "11.1", "11.2", "11.3", "11.4", "11.5", "15.1", "16.1"] },
    { "id": 7, "tasks": ["11.6", "11.7"] },
    { "id": 8, "tasks": ["17.1"] },
    { "id": 9, "tasks": ["18.1", "18.2", "18.3"] }
  ]
}
```
