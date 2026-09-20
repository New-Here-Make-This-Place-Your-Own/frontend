import { beforeEach, expect, jest, test } from '@jest/globals';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../supabase';
import { completeAuthLink } from '../auth-links';
import { signInWithSocialProvider } from '../social-auth';
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn() }));
jest.mock('../supabase', () => ({ supabase: { auth: { signInWithOAuth: jest.fn() } } }));
jest.mock('../auth-links', () => ({ getAuthRedirectUrl: () => 'newhere://auth/callback', completeAuthLink: jest.fn() }));
beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
  jest.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({ data: { provider: 'google', url: 'https://provider.example/authorize' }, error: null });
});
test('native Google sign-in exchanges a successful browser callback', async () => {
  const provider = 'google';
  jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({ type: 'success', url: 'newhere://auth/callback?code=example' } as WebBrowser.WebBrowserAuthSessionResult);
  expect(await signInWithSocialProvider(provider)).toBe(true);
  expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({ provider, options: { redirectTo: 'newhere://auth/callback', skipBrowserRedirect: true } });
  expect(completeAuthLink).toHaveBeenCalledWith('newhere://auth/callback?code=example');
});
test('cancelling native sign-in does not exchange credentials', async () => {
  jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({ type: 'cancel' } as WebBrowser.WebBrowserAuthSessionResult);
  expect(await signInWithSocialProvider('google')).toBe(false);
  expect(completeAuthLink).not.toHaveBeenCalled();
});
test('web uses the normal redirect and does not open a native browser session', async () => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  expect(await signInWithSocialProvider('google')).toBe(false);
  expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: 'google', options: { redirectTo: 'newhere://auth/callback', skipBrowserRedirect: false } });
  expect(WebBrowser.openAuthSessionAsync).not.toHaveBeenCalled();
});
test('provider errors propagate so the screen can display a retryable error', async () => {
  jest.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(new Error('Provider is not enabled'));
  await expect(signInWithSocialProvider('google')).rejects.toThrow('Provider is not enabled');
  expect(WebBrowser.openAuthSessionAsync).not.toHaveBeenCalled();
});
