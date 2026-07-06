import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, categorizeMatch, sortMatches } from '../js/utils.js';

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  it('converts YYYY-MM-DD to DD/MM/YYYY', () => {
    expect(formatDate('2024-03-15')).toBe('15/03/2024');
  });

  it('zero-pads single-digit months and days', () => {
    expect(formatDate('2023-01-05')).toBe('05/01/2023');
  });

  it('handles end-of-year date', () => {
    expect(formatDate('2024-12-31')).toBe('31/12/2024');
  });
});

// ---------------------------------------------------------------------------
// formatTime
// ---------------------------------------------------------------------------
describe('formatTime', () => {
  it('returns the time string unchanged', () => {
    expect(formatTime('14:30')).toBe('14:30');
  });

  it('passes through midnight time unchanged', () => {
    expect(formatTime('00:00')).toBe('00:00');
  });

  it('passes through end-of-day time unchanged', () => {
    expect(formatTime('23:59')).toBe('23:59');
  });
});

// ---------------------------------------------------------------------------
// categorizeMatch
// ---------------------------------------------------------------------------
describe('categorizeMatch', () => {
  it('returns "upcoming" when match date/time is exactly equal to now', () => {
    const now = new Date('2024-06-15T20:00:00');
    const match = { date: '2024-06-15', time: '20:00' };
    expect(categorizeMatch(match, now)).toBe('upcoming');
  });

  it('returns "upcoming" when match is in the future', () => {
    const now = new Date('2024-06-10T12:00:00');
    const match = { date: '2024-06-15', time: '18:00' };
    expect(categorizeMatch(match, now)).toBe('upcoming');
  });

  it('returns "past" when match is strictly before now', () => {
    const now = new Date('2024-06-20T10:00:00');
    const match = { date: '2024-06-15', time: '18:00' };
    expect(categorizeMatch(match, now)).toBe('past');
  });

  it('returns "past" when match time on same day is before now', () => {
    const now = new Date('2024-06-15T20:01:00');
    const match = { date: '2024-06-15', time: '20:00' };
    expect(categorizeMatch(match, now)).toBe('past');
  });

  it('returns "upcoming" when match time on same day is after now', () => {
    const now = new Date('2024-06-15T19:59:00');
    const match = { date: '2024-06-15', time: '20:00' };
    expect(categorizeMatch(match, now)).toBe('upcoming');
  });
});

// ---------------------------------------------------------------------------
// sortMatches
// ---------------------------------------------------------------------------
describe('sortMatches', () => {
  it('sorts matches by ascending date', () => {
    const matches = [
      { id: 'b', date: '2024-07-20', time: '15:00' },
      { id: 'a', date: '2024-06-10', time: '18:00' },
      { id: 'c', date: '2024-09-01', time: '20:00' },
    ];
    const sorted = sortMatches(matches);
    expect(sorted.map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });

  it('uses time as secondary sort key for same-date matches', () => {
    const matches = [
      { id: 'late', date: '2024-06-15', time: '20:00' },
      { id: 'early', date: '2024-06-15', time: '10:00' },
      { id: 'mid', date: '2024-06-15', time: '15:30' },
    ];
    const sorted = sortMatches(matches);
    expect(sorted.map((m) => m.id)).toEqual(['early', 'mid', 'late']);
  });

  it('does not mutate the original array', () => {
    const matches = [
      { id: 'b', date: '2024-07-20', time: '15:00' },
      { id: 'a', date: '2024-06-10', time: '18:00' },
    ];
    const original = [...matches];
    sortMatches(matches);
    expect(matches).toEqual(original);
  });

  it('returns a new array reference', () => {
    const matches = [{ id: 'a', date: '2024-06-10', time: '18:00' }];
    const sorted = sortMatches(matches);
    expect(sorted).not.toBe(matches);
  });

  it('handles an empty array', () => {
    expect(sortMatches([])).toEqual([]);
  });

  it('handles a single-element array', () => {
    const matches = [{ id: 'a', date: '2024-06-10', time: '18:00' }];
    expect(sortMatches(matches)).toEqual(matches);
  });

  it('handles already-sorted input correctly', () => {
    const matches = [
      { id: 'a', date: '2024-06-10', time: '10:00' },
      { id: 'b', date: '2024-06-10', time: '18:00' },
      { id: 'c', date: '2024-07-01', time: '20:00' },
    ];
    const sorted = sortMatches(matches);
    expect(sorted.map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });
});
