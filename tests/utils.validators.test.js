// Unit tests for validateEmail, validatePhone, and validateForm in js/utils.js
// Covers task 4.4 — Requirements 4.3, 4.4, 4.7

import { describe, it, expect } from 'vitest';
import { validateEmail, validatePhone, validateForm } from '../js/utils.js';

// ---------------------------------------------------------------------------
// validateEmail
// ---------------------------------------------------------------------------
describe('validateEmail', () => {
  it('returns null for a standard valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });

  it('returns null for email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBeNull();
  });

  it('returns null for email with plus sign in local-part', () => {
    expect(validateEmail('user+tag@example.com')).toBeNull();
  });

  it('returns null for email with dots in local-part', () => {
    expect(validateEmail('first.last@example.org')).toBeNull();
  });

  it('returns a non-empty error string for empty value', () => {
    const result = validateEmail('');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('returns a non-empty error string for null value', () => {
    const result = validateEmail(null);
    expect(result).toBeTruthy();
  });

  it('returns a non-empty error string when @ is missing', () => {
    const result = validateEmail('userexample.com');
    expect(result).toBeTruthy();
  });

  it('returns a non-empty error string when domain part is missing', () => {
    const result = validateEmail('user@');
    expect(result).toBeTruthy();
  });

  it('returns a non-empty error string when local-part is missing', () => {
    const result = validateEmail('@example.com');
    expect(result).toBeTruthy();
  });

  it('returns a non-empty error string when domain has no dot', () => {
    const result = validateEmail('user@examplecom');
    expect(result).toBeTruthy();
  });

  it('returns a non-empty error string for plain string with no structure', () => {
    const result = validateEmail('notanemail');
    expect(result).toBeTruthy();
  });

  it('returns a non-empty error string for email with spaces', () => {
    const result = validateEmail('user name@example.com');
    expect(result).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// validatePhone
// ---------------------------------------------------------------------------
describe('validatePhone', () => {
  it('returns null for a simple digit-only number', () => {
    expect(validatePhone('08123456789')).toBeNull();
  });

  it('returns null for number with spaces', () => {
    expect(validatePhone('081 234 567')).toBeNull();
  });

  it('returns null for number with hyphens', () => {
    expect(validatePhone('081-234-5678')).toBeNull();
  });

  it('returns null for number with leading plus sign', () => {
    expect(validatePhone('+62 812 3456 7890')).toBeNull();
  });

  it('returns null for number mixing digits, spaces, hyphens, and leading +', () => {
    expect(validatePhone('+1-800-555 1234')).toBeNull();
  });

  it('returns a non-empty error string for empty value', () => {
    const result = validatePhone('');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('returns a non-empty error string when value contains letters', () => {
    const result = validatePhone('0812abc456');
    expect(result).toBeTruthy();
  });

  it('returns a non-empty error string when value contains parentheses', () => {
    const result = validatePhone('(021) 555-1234');
    expect(result).toBeTruthy();
  });

  it('returns a non-empty error string when value contains a dot', () => {
    const result = validatePhone('021.555.1234');
    expect(result).toBeTruthy();
  });

  it('returns a non-empty error string for plus sign in the middle', () => {
    // Leading + is allowed; + anywhere else is not
    const result = validatePhone('0812+3456');
    expect(result).toBeTruthy();
  });

  it('returns a non-empty error string when value is null', () => {
    const result = validatePhone(null);
    expect(result).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// validateForm
// ---------------------------------------------------------------------------
describe('validateForm', () => {
  /** A fully valid state — all fields filled correctly. */
  const validState = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+62 812 3456 7890',
    selectedMatchId: 'match-001',
    selectedCategoryId: 'normal',
    seats: 2,
  };

  it('returns all-null errors for a fully valid state', () => {
    const errors = validateForm(validState);
    expect(errors.fullName).toBeNull();
    expect(errors.email).toBeNull();
    expect(errors.phone).toBeNull();
    expect(errors.selectedMatchId).toBeNull();
    expect(errors.selectedCategoryId).toBeNull();
    expect(errors.seats).toBeNull();
  });

  it('returns a non-empty error for empty fullName', () => {
    const errors = validateForm({ ...validState, fullName: '' });
    expect(errors.fullName).toBeTruthy();
    // Other fields should still be null
    expect(errors.email).toBeNull();
    expect(errors.phone).toBeNull();
  });

  it('returns a non-empty error for empty email', () => {
    const errors = validateForm({ ...validState, email: '' });
    expect(errors.email).toBeTruthy();
    expect(errors.fullName).toBeNull();
  });

  it('returns a non-empty error for invalid email format', () => {
    const errors = validateForm({ ...validState, email: 'not-an-email' });
    expect(errors.email).toBeTruthy();
  });

  it('returns a non-empty error for empty phone', () => {
    const errors = validateForm({ ...validState, phone: '' });
    expect(errors.phone).toBeTruthy();
  });

  it('returns a non-empty error for phone with disallowed characters', () => {
    const errors = validateForm({ ...validState, phone: '021 (555) abc' });
    expect(errors.phone).toBeTruthy();
  });

  it('returns a non-empty error for null selectedMatchId', () => {
    const errors = validateForm({ ...validState, selectedMatchId: null });
    expect(errors.selectedMatchId).toBeTruthy();
  });

  it('returns a non-empty error for empty selectedMatchId string', () => {
    const errors = validateForm({ ...validState, selectedMatchId: '' });
    expect(errors.selectedMatchId).toBeTruthy();
  });

  it('returns a non-empty error for null selectedCategoryId', () => {
    const errors = validateForm({ ...validState, selectedCategoryId: null });
    expect(errors.selectedCategoryId).toBeTruthy();
  });

  it('returns a non-empty error when seats is 0', () => {
    const errors = validateForm({ ...validState, seats: 0 });
    expect(errors.seats).toBeTruthy();
  });

  it('returns a non-empty error when seats is 11 (above maximum)', () => {
    const errors = validateForm({ ...validState, seats: 11 });
    expect(errors.seats).toBeTruthy();
  });

  it('returns null for seats when seats is 1 (minimum valid)', () => {
    const errors = validateForm({ ...validState, seats: 1 });
    expect(errors.seats).toBeNull();
  });

  it('returns null for seats when seats is 10 (maximum valid)', () => {
    const errors = validateForm({ ...validState, seats: 10 });
    expect(errors.seats).toBeNull();
  });

  it('returns errors for every empty required field simultaneously', () => {
    const emptyState = {
      fullName: '',
      email: '',
      phone: '',
      selectedMatchId: null,
      selectedCategoryId: null,
      seats: null,
    };
    const errors = validateForm(emptyState);
    expect(errors.fullName).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.selectedMatchId).toBeTruthy();
    expect(errors.selectedCategoryId).toBeTruthy();
    expect(errors.seats).toBeTruthy();
  });

  it('returns null for a field that is correctly filled even if other fields have errors', () => {
    const partialState = {
      fullName: 'Jane Smith',  // valid
      email: '',               // invalid
      phone: '',               // invalid
      selectedMatchId: null,   // invalid
      selectedCategoryId: null,// invalid
      seats: 3,                // valid
    };
    const errors = validateForm(partialState);
    expect(errors.fullName).toBeNull();  // correctly filled → no error
    expect(errors.seats).toBeNull();     // correctly filled → no error
    expect(errors.email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.selectedMatchId).toBeTruthy();
    expect(errors.selectedCategoryId).toBeTruthy();
  });
});
