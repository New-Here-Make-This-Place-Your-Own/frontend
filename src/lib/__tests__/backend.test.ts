import { jest, test, expect, beforeEach } from '@jest/globals';
import { apiRequest } from '../api';
import { completeQuest, deviceTimezone, getCuratorQuest, getDailyQuests, getPastQuests, submitOnboarding } from '../backend';
jest.mock('../api', () => ({ apiRequest: jest.fn() }));
beforeEach(() => { jest.clearAllMocks(); });
test('daily requests never supply a client date', async () => {
  await getDailyQuests();
  expect(apiRequest).toHaveBeenCalledWith('/api/v1/quests/daily', {}, 60000);
});
test.each(['daily', 'curator'] as const)('completes %s with assignment ID, uploaded path and pin', async kind => {
  const body = { photo_path: 'user/photo.jpg', caption: 'Found it', latitude: -20.1, longitude: 57.5 };
  await completeQuest(kind, 'assignment-id', body);
  expect(apiRequest).toHaveBeenCalledWith(`/api/v1/quests/${kind}/assignment-id/complete`, { method: 'POST', body: JSON.stringify(body) });
});
test('onboarding includes timezone and canonical city selection', async () => {
  const body = { first_name: 'A', last_name: 'B', date_of_birth: '2000-01-01', place_name: 'Port Louis', place_country: 'Mauritius', latitude: -20, longitude: 57, interests: ['nature'], timezone: 'Indian/Mauritius' };
  await submitOnboarding(body);
  expect(apiRequest).toHaveBeenCalledWith('/api/v1/users/onboarding', { method: 'POST', body: JSON.stringify(body) });
});
test('history sends pagination parameters', async () => {
  await getPastQuests(50);
  expect(apiRequest).toHaveBeenCalledWith('/api/v1/quests/past?limit=50&offset=50');
});
test('curator allows time for generation and serialization', async () => {
  await getCuratorQuest();
  expect(apiRequest).toHaveBeenCalledWith('/api/v1/quests/curator', {}, 60000);
});
test('device timezone is an IANA timezone accepted by Intl', () => {
  expect(() => new Intl.DateTimeFormat('en', { timeZone: deviceTimezone() })).not.toThrow();
});
