import { test, expect } from '@jest/globals';
import { isValidBirthDate, isValidEmail, normalizeEmail } from '../validation';
import { isOnboardingComplete } from '../profile';
test.each(['alice@example.com', '  Alice+city@Example.COM  ', "o'connor@example.co.uk"])( 'accepts email %s', email => expect(isValidEmail(email)).toBe(true));
test.each(['', 'alice', 'alice@', 'alice@example', 'a b@example.com', '.alice@example.com', 'a..b@example.com', 'a@-example.com', 'a@example..com', 'a@@example.com', 'a@example.com.', 'a'.repeat(65) + '@example.com'])( 'rejects malformed email %s', email => expect(isValidEmail(email)).toBe(false));
test('normalizes email without removing plus tags', () => expect(normalizeEmail(' Alice+tag@EXAMPLE.com ')).toBe('alice+tag@example.com'));
test.each(['2000-02-29', '1995-12-31'])('accepts real birth date %s', date => expect(isValidBirthDate(date, new Date('2026-09-08'))).toBe(true));
test.each(['0000-01-01', '2001-02-29', '2020-04-31', '2026-09-09', '01/02/2000', '2000-1-01', ''])('rejects invalid or future birth date %s', date => expect(isValidBirthDate(date, new Date('2026-09-08'))).toBe(false));
test('bare signup profiles do not bypass onboarding', () => {
  expect(isOnboardingComplete(null)).toBe(false);
  expect(isOnboardingComplete({ first_name: null, last_name: null, date_of_birth: null, city_id: null, interests: [] })).toBe(false);
  expect(isOnboardingComplete({ first_name: 'Alice', last_name: 'Smith', date_of_birth: '2000-01-01', city_id: 'city-id', interests: [] })).toBe(true);
});
