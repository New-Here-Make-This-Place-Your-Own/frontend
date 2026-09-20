import { expect, test } from '@jest/globals';
import { birthDateFromParts, detailsError, onboardingPayload } from '../onboarding';

test('split birthday fields accept single-digit days and validate actual dates', () => {
  expect(birthDateFromParts('2', '3', '1994')).toBe('1994-03-02');
  expect(birthDateFromParts('', '3', '1994')).toBe('');
  expect(detailsError('A', 'B', birthDateFromParts('31', '2', '2000'))).toContain('real date');
  expect(detailsError('A', 'B', birthDateFromParts('29', '2', '2000'))).toBe('');
  expect(detailsError(' ', 'B', '2000-01-01')).toContain('first and last');
});

test('visual interests map to existing backend categories and keep optional interests optional', () => {
  const place = { name: 'Port Louis', country: 'Mauritius', latitude: -20.16, longitude: 57.5 };
  const body = onboardingPayload(' A ', ' B ', '2000-01-01', place, ['food', 'photography', 'food'], 'Indian/Mauritius');
  expect(body).toEqual({ first_name: 'A', last_name: 'B', date_of_birth: '2000-01-01', latitude: -20.16, longitude: 57.5, place_name: 'Port Louis', place_country: 'Mauritius', interests: ['sensory', 'food', 'culture'], timezone: 'Indian/Mauritius' });
  expect(onboardingPayload('A', 'B', '2000-01-01', place, [], 'UTC').interests).toEqual([]);
});

test('GPS selections omit invented place names and invalid personal details cannot submit', () => {
  const gps = { name: '', country: '', latitude: 0, longitude: 0 };
  expect(onboardingPayload('A', 'B', '2000-01-01', gps, [], 'UTC')).not.toHaveProperty('place_name');
  expect(() => onboardingPayload('', 'B', '2000-01-01', gps, [], 'UTC')).toThrow();
});
