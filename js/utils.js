// utils.js — Shared helpers and validators
// Exports: formatDate, formatTime, categorizeMatch, sortMatches,
//          validateEmail, validatePhone, validateForm,
//          calculateTotalPrice, validateSeatsAvailability, groupPlayersByPosition

// ---------------------------------------------------------------------------
// Date / time helpers
// ---------------------------------------------------------------------------

/**
 * Converts an ISO date string (YYYY-MM-DD) to display format DD/MM/YYYY.
 * @param {string} isoDate
 * @returns {string}
 */
export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Returns the time string (HH:MM) unchanged — included for symmetry with
 * formatDate and to keep rendering code uniform.
 * @param {string} time  HH:MM (24-hour)
 * @returns {string}
 */
export function formatTime(time) {
  return time;
}

/**
 * Classifies a match as "upcoming" or "past" relative to `now`.
 * A match is upcoming if its combined date/time is >= now.
 *
 * @param {{ date: string, time: string }} match
 * @param {Date} now
 * @returns {"upcoming" | "past"}
 */
export function categorizeMatch(match, now) {
  const matchDateTime = new Date(`${match.date}T${match.time}`);
  return matchDateTime >= now ? 'upcoming' : 'past';
}

/**
 * Sorts an array of Match objects in ascending chronological order.
 * Primary key: date (YYYY-MM-DD); secondary key: time (HH:MM).
 * Returns a new array — does not mutate the input.
 *
 * @param {Array<{ date: string, time: string }>} matches
 * @returns {Array<{ date: string, time: string }>}
 */
export function sortMatches(matches) {
  return [...matches].sort((a, b) => {
    const aKey = `${a.date}T${a.time}`;
    const bKey = `${b.date}T${b.time}`;
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

/**
 * Validates an email address format.
 * A valid email must contain a non-empty local-part, an `@` symbol, and a
 * non-empty domain that includes at least one dot separating non-empty parts.
 *
 * Returns null when the value is valid; a non-empty error string otherwise.
 *
 * @param {string} value
 * @returns {string | null}
 */
export function validateEmail(value) {
  if (!value || value.trim() === '') {
    return 'Email is required.';
  }

  // RFC 5322-inspired regex: local-part @ domain.tld
  // Allows most common valid email formats without being overly strict.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return 'Please enter a valid email address (e.g. user@example.com).';
  }

  return null;
}

/**
 * Validates a phone number string.
 * Allowed characters: digits (0-9), spaces, hyphens (-), and an optional
 * leading plus sign (+). Any other character makes the value invalid.
 *
 * Returns null when the value is valid; a non-empty error string otherwise.
 *
 * @param {string} value
 * @returns {string | null}
 */
export function validatePhone(value) {
  if (!value || value.trim() === '') {
    return 'Phone number is required.';
  }

  // Optional leading +, then only digits / spaces / hyphens for the rest.
  const phoneRegex = /^\+?[0-9 -]+$/;
  if (!phoneRegex.test(value)) {
    return 'Phone number may only contain digits, spaces, hyphens, and an optional leading +.';
  }

  return null;
}

/**
 * Validates an entire ReservationState object.
 * Returns an errors object where each key is either null (field is valid) or
 * a non-empty string (field has a validation problem).
 *
 * Checked fields:
 *   fullName        — required, non-empty
 *   email           — required + format via validateEmail
 *   phone           — required + format via validatePhone
 *   selectedMatchId — required, non-null/non-empty
 *   selectedCategoryId — required, non-null/non-empty
 *   seats           — required, must be an integer between 1 and 10 inclusive
 *
 * @param {{
 *   fullName: string,
 *   email: string,
 *   phone: string,
 *   selectedMatchId: string | null,
 *   selectedCategoryId: string | null,
 *   seats: number
 * }} state
 * @returns {{
 *   fullName: string | null,
 *   email: string | null,
 *   phone: string | null,
 *   selectedMatchId: string | null,
 *   selectedCategoryId: string | null,
 *   seats: string | null
 * }}
 */
export function validateForm(state) {
  const errors = {
    fullName: null,
    email: null,
    phone: null,
    selectedMatchId: null,
    selectedCategoryId: null,
    seats: null,
  };

  // Full name — required
  if (!state.fullName || state.fullName.trim() === '') {
    errors.fullName = 'Full name is required.';
  }

  // Email — required + format
  errors.email = validateEmail(state.email);

  // Phone — required + format
  errors.phone = validatePhone(state.phone);

  // Match selection — required
  if (!state.selectedMatchId || state.selectedMatchId.trim() === '') {
    errors.selectedMatchId = 'Please select a match.';
  }

  // Category selection — required
  if (!state.selectedCategoryId || state.selectedCategoryId.trim() === '') {
    errors.selectedCategoryId = 'Please select a ticket category.';
  }

  // Seats — must be an integer between 1 and 10 inclusive
  const seats = Number(state.seats);
  if (state.seats === null || state.seats === undefined || state.seats === '' || isNaN(seats)) {
    errors.seats = 'Number of seats is required.';
  } else if (!Number.isInteger(seats) || seats < 1 || seats > 10) {
    errors.seats = 'Number of seats must be a whole number between 1 and 10.';
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Price helpers
// ---------------------------------------------------------------------------

/**
 * Calculates the total price for a reservation.
 *
 * @param {{ price: number }} category
 * @param {number} seats
 * @returns {number}
 */
export function calculateTotalPrice(category, seats) {
  return category.price * seats;
}

// ---------------------------------------------------------------------------
// Seat availability validator
// ---------------------------------------------------------------------------

/**
 * Checks whether a requested seat count is within available capacity.
 * Returns null when the request fits; a non-empty error string otherwise.
 *
 * @param {number} requested
 * @param {number} available
 * @returns {string | null}
 */
export function validateSeatsAvailability(requested, available) {
  if (requested > available) {
    return `Only ${available} seat(s) are available for this match.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Player grouping
// ---------------------------------------------------------------------------

const POSITION_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

/**
 * Groups an array of players by their position category in the fixed order:
 * Goalkeepers → Defenders → Midfielders → Forwards.
 *
 * Every player appears in exactly one group. Groups with zero players are
 * still included in the output to preserve the fixed order.
 *
 * @param {Array<{ position: string }>} players
 * @returns {Array<{ position: string, players: Array }>}
 */
export function groupPlayersByPosition(players) {
  const groups = POSITION_ORDER.map((position) => ({ position, players: [] }));

  for (const player of players) {
    const group = groups.find((g) => g.position === player.position);
    if (group) {
      group.players.push(player);
    }
  }

  return groups;
}
