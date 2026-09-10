import { jest, test, expect, beforeEach, afterEach } from '@jest/globals';
import { supabase } from '../supabase';
import { apiRequest } from '../api';
jest.mock('../supabase', () => ({ supabase: { auth: { getSession: jest.fn() } } }));
const originalFetch = globalThis.fetch;
const originalBase = process.env.EXPO_PUBLIC_API_BASE_URL;
beforeEach(() => {
  process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example/';
  globalThis.fetch = jest.fn<typeof fetch>();
  jest.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: { access_token: 'test-token' } }, error: null } as never);
});
afterEach(() => { globalThis.fetch = originalFetch; if (originalBase === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL; else process.env.EXPO_PUBLIC_API_BASE_URL = originalBase; });
test('sends an authenticated onboarding request to the backend', async () => {
  jest.mocked(globalThis.fetch).mockResolvedValue({ ok: true, json: async () => ({ city_id: 'city' }) } as Response);
  await expect(apiRequest('/api/v1/users/onboarding', { method: 'POST', body: '{}' })).resolves.toEqual({ city_id: 'city' });
  expect(globalThis.fetch).toHaveBeenCalledWith('https://api.example/api/v1/users/onboarding', expect.objectContaining({ method: 'POST', headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) }));
});
test('blocks a missing session before sending a request', async () => {
  jest.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });
  await expect(apiRequest('/api/v1/users/onboarding')).rejects.toThrow('session has expired');
  expect(globalThis.fetch).not.toHaveBeenCalled();
});
test('renders FastAPI validation arrays as readable messages', async () => {
  jest.mocked(globalThis.fetch).mockResolvedValue({ ok: false, json: async () => ({ detail: [{ msg: 'Invalid date' }] }) } as Response);
  await expect(apiRequest('/api/v1/users/onboarding')).rejects.toThrow('Invalid date');
});
