import { Onboarding } from './backend';
import { isValidBirthDate } from './validation';

export type SelectedPlace = { name: string; country: string; region?: string | null; latitude: number; longitude: number };
export const INTERESTS = [
  { id: 'photography', title: 'Photography', description: 'Golden angle rakes, framing alleys', categories: ['sensory'] },
  { id: 'food', title: 'Food & Markets', description: 'Morning bakeries, spice stalls, steam', categories: ['food', 'culture'] },
  { id: 'architecture', title: 'Architecture', description: 'Brutalist lines, aged lintels, façades', categories: ['architecture'] },
  { id: 'nature', title: 'Nature & Greenery', description: 'Overgrown ruins, pocket parks, moss', categories: ['nature'] },
  { id: 'art', title: 'Art & Murals', description: 'Wheatpaste, studio glass, pigment', categories: ['art'] },
  { id: 'history', title: 'History & Heritage', description: 'Etched cornerstones, oral archives', categories: ['history'] },
] as const;
export function birthDateFromParts(day: string, month: string, year: string): string {
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) return '';
  return year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
}
export function detailsError(firstName: string, lastName: string, dateOfBirth: string): string {
  if (!firstName.trim() || !lastName.trim()) return 'Please enter your first and last name.';
  if (!isValidBirthDate(dateOfBirth)) return 'Enter a real date of birth that is not in the future.';
  return '';
}
export function onboardingPayload(firstName: string, lastName: string, dateOfBirth: string, place: SelectedPlace, interests: string[], timezone: string): Onboarding {
  const error = detailsError(firstName, lastName, dateOfBirth);
  if (error) throw new Error(error);
  return {
    first_name: firstName.trim(), last_name: lastName.trim(), date_of_birth: dateOfBirth,
    latitude: place.latitude, longitude: place.longitude,
    ...(place.name ? { place_name: place.name, place_country: place.country } : {}),
    interests: [...new Set(INTERESTS.filter(option => interests.includes(option.id)).flatMap(option => [...option.categories]))],
    timezone,
  };
}
