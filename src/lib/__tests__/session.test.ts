import { jest, test, expect, beforeEach } from '@jest/globals';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { validateSession } from '../session';
jest.mock('../supabase', () => ({ supabase: { auth: { getUser: jest.fn(), getSession: jest.fn(), signOut: jest.fn() } } }));
const session = { access_token: 'cached-token', user: { id: 'deleted-user' } } as Session;
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session }, error: null });
  jest.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
});
test('deleted dashboard user loses the cached local session', async () => {
  jest.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null }, error: { status: 403 } } as never);
  await expect(validateSession(session)).resolves.toBeNull();
  expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
});
test('a valid returning user keeps their session', async () => {
  jest.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: session.user }, error: null });
  await expect(validateSession(session)).resolves.toEqual(session);
  expect(supabase.auth.signOut).not.toHaveBeenCalled();
});
test('no saved session never calls the auth server', async () => {
  await expect(validateSession(null)).resolves.toBeNull();
  expect(supabase.auth.getUser).not.toHaveBeenCalled();
});
test('temporary network failure does not delete credentials', async () => {
  jest.mocked(supabase.auth.getUser).mockRejectedValue(new Error('Network unavailable'));
  await expect(validateSession(session)).rejects.toThrow('Network unavailable');
  expect(supabase.auth.signOut).not.toHaveBeenCalled();
});
test('a stale invalidation does not sign out a newly signed-in user', async () => {
  jest.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null }, error: { status: 403 } } as never);
  jest.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: { ...session, access_token: 'new-token' } }, error: null });
  await validateSession(session);
  expect(supabase.auth.signOut).not.toHaveBeenCalled();
});
