import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export function getAuthRedirectUrl(recovery = false): string {
  const url = Platform.OS === 'web' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient
    ? Linking.createURL('auth/callback')
    : 'newhere://auth/callback';
  if (!recovery) return url;
  const redirect = new URL(url);
  redirect.searchParams.set('type', 'recovery');
  return redirect.toString();
}

export function parseAuthLink(url: string) {
  const parsed = new URL(url);
  const params = new URLSearchParams(parsed.search);
  new URLSearchParams(parsed.hash.slice(1)).forEach((value, key) => params.set(key, value));
  const error = params.get('error_description') || params.get('error');
  if (error) throw new Error(error);
  return {
    code: params.get('code'),
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    recovery: params.get('type') === 'recovery',
  };
}

// A callback can be delivered twice by the initial URL and the linking event.
let pending: { url: string; promise: Promise<boolean> } | undefined;
export function completeAuthLink(url: string): Promise<boolean> {
  if (pending?.url === url) return pending.promise;
  const promise = (async () => {
    const link = parseAuthLink(url);
    const result = link.code
      ? await supabase.auth.exchangeCodeForSession(link.code)
      : link.accessToken && link.refreshToken
        ? await supabase.auth.setSession({ access_token: link.accessToken, refresh_token: link.refreshToken })
        : null;
    if (!result) throw new Error('This link is incomplete. Request a new email and open its latest link.');
    if (result.error) throw result.error;
    if (!result.data.session) throw new Error('This link did not create a session. Please request a new email.');
    return link.recovery;
  })();
  pending = { url, promise };
  // Retain only briefly to deduplicate delivery, not the credentials indefinitely.
  void promise.finally(() => setTimeout(() => {
    if (pending?.promise === promise) pending = undefined;
  }, 5000)).catch(() => {});
  return promise;
}
