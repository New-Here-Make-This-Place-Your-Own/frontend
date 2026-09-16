import { jest, test, expect, beforeEach, afterEach } from '@jest/globals';
import { supabase } from '../supabase';
import { apiRequest } from '../api';
jest.mock('../supabase', () => ({ supabase: { auth: { getSession: jest.fn(), getUser: jest.fn(), signOut: jest.fn() } } }));
const originalFetch = globalThis.fetch;
const originalBase = process.env.EXPO_PUBLIC_API_BASE_URL;
beforeEach(() => {
  process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example/';
  globalThis.fetch = jest.fn<typeof fetch>();
  jest.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: { access_token: 'test-token', user: { id: 'user-id' } } }, error: null } as never);
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

test('a backend 401 clears the session only when Supabase also rejects it', async () => {
  jest.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null }, error: { status: 403 } } as never);
  jest.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
  jest.mocked(globalThis.fetch).mockResolvedValue({ ok: false, status: 401, json: async () => ({ detail: 'Invalid token' }) } as Response);
  await expect(apiRequest('/api/v1/users/onboarding')).rejects.toThrow('Please sign in again');
  expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
});

test('a backend 401 does not sign out a user Supabase still recognizes', async () => {
  jest.mocked(supabase.auth.signOut).mockClear();
  jest.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null } as never);
  jest.mocked(globalThis.fetch).mockResolvedValue({ ok: false, status: 401, json: async () => ({ detail: 'Invalid token' }) } as Response);
  await expect(apiRequest('/api/v1/places/search?q=Port')).rejects.toThrow('server could not verify');
  expect(supabase.auth.signOut).not.toHaveBeenCalled();
});
