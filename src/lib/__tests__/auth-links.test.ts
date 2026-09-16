import { jest, test, expect, beforeEach, afterEach } from '@jest/globals';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { supabase } from '../supabase';
import { completeAuthLink, getAuthRedirectUrl, parseAuthLink } from '../auth-links';
jest.mock('expo-linking', () => ({ createURL: jest.fn(() => 'https://newhere.example/auth/callback') }));
jest.mock('expo-constants', () => ({ __esModule: true, default: { executionEnvironment: 'bare' }, ExecutionEnvironment: { StoreClient: 'storeClient', Bare: 'bare' } }));
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('../supabase', () => ({ supabase: { auth: { setSession: jest.fn(), exchangeCodeForSession: jest.fn() } } }));
beforeEach(() => { jest.useFakeTimers(); jest.clearAllMocks(); });
afterEach(() => { jest.runOnlyPendingTimers(); jest.useRealTimers(); });
test('native email redirects use the registered scheme', () => {
  expect(getAuthRedirectUrl()).toBe('newhere://auth/callback');
  expect(getAuthRedirectUrl(true)).toBe('newhere://auth/callback?type=recovery');
});
test('web email redirects return to the web origin', () => {
  const previous = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  expect(getAuthRedirectUrl()).toBe('https://newhere.example/auth/callback');
  Object.defineProperty(Platform, 'OS', { configurable: true, value: previous });
});
test('parses recovery tokens from a fragment', () => {
  expect(parseAuthLink('newhere://auth/callback#access_token=access&refresh_token=refresh&type=recovery')).toEqual({ accessToken: 'access', refreshToken: 'refresh', code: null, recovery: true });
});
test('surfaces expired link errors', () => {
  expect(() => parseAuthLink('newhere://auth/callback#error=access_denied&error_description=Link+expired')).toThrow('Link expired');
});
test('rejects incomplete links without calling auth', async () => {
  await expect(completeAuthLink('newhere://auth/callback#access_token=only-one-token')).rejects.toThrow('incomplete');
  expect(supabase.auth.setSession).not.toHaveBeenCalled();
});
test('establishes a recovery session and deduplicates delivery', async () => {
  jest.mocked(supabase.auth.setSession).mockResolvedValue({ data: { session: { access_token: 'access' }, user: {} }, error: null } as never);
  const url = 'newhere://auth/callback#access_token=access&refresh_token=refresh&type=recovery';
  const first = completeAuthLink(url);
  const duplicate = completeAuthLink(url);
  await expect(first).resolves.toBe(true);
  await expect(duplicate).resolves.toBe(true);
  expect(supabase.auth.setSession).toHaveBeenCalledTimes(1);
  expect(supabase.auth.setSession).toHaveBeenCalledWith({ access_token: 'access', refresh_token: 'refresh' });
});
test('exchanges PKCE codes', async () => {
  jest.mocked(supabase.auth.exchangeCodeForSession).mockResolvedValue({ data: { session: {}, user: {} }, error: null } as never);
  await expect(completeAuthLink('newhere://auth/callback?code=one-use-code')).resolves.toBe(false);
  expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('one-use-code');
});
test('does not treat rejected sessions as verified', async () => {
  jest.mocked(supabase.auth.setSession).mockResolvedValue({ data: { session: null, user: null }, error: new Error('Expired token') } as never);
  await expect(completeAuthLink('newhere://auth/callback#access_token=expired&refresh_token=expired')).rejects.toThrow('Expired token');
});

test('Expo Go confirmation uses its exp project URL instead of the installed-app scheme', () => {
  Constants.executionEnvironment = ExecutionEnvironment.StoreClient;
  jest.mocked(Linking.createURL).mockReturnValue('exp://192.168.1.10:8081/--/auth/callback');
  expect(getAuthRedirectUrl()).toBe('exp://192.168.1.10:8081/--/auth/callback');
  expect(getAuthRedirectUrl(true)).toBe('exp://192.168.1.10:8081/--/auth/callback?type=recovery');
  Constants.executionEnvironment = ExecutionEnvironment.Bare;
});
