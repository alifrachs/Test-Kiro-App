// data.js — Async JSON fetch helpers
// Exports: loadMatches(), loadPlayers(), loadCoaches(), loadTicketCategories()

/**
 * Loads match data from /data/matches.json.
 * @returns {Promise<{ok: true, data: object[]}|{ok: false, error: string}>}
 */
export async function loadMatches() {
  try {
    const res = await fetch('/data/matches.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Loads player data from /data/players.json.
 * @returns {Promise<{ok: true, data: object[]}|{ok: false, error: string}>}
 */
export async function loadPlayers() {
  try {
    const res = await fetch('/data/players.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Loads coach data from /data/coaches.json.
 * @returns {Promise<{ok: true, data: object[]}|{ok: false, error: string}>}
 */
export async function loadCoaches() {
  try {
    const res = await fetch('/data/coaches.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Loads ticket category data from /data/ticketCategories.json.
 * @returns {Promise<{ok: true, data: object[]}|{ok: false, error: string}>}
 */
export async function loadTicketCategories() {
  try {
    const res = await fetch('/data/ticketCategories.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
