import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';
import { completeAuthLink, getAuthRedirectUrl } from './auth-links';

export type SocialProvider = 'google';

/** Web redirects in the same tab; native uses the system authentication session. */
export async function signInWithSocialProvider(provider: SocialProvider): Promise<boolean> {
  const redirectTo = getAuthRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' },
  });
  if (error) throw error;
  if (Platform.OS === 'web') return false;
  if (!data.url) throw new Error('Unable to start sign-in. Please try again.');
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;
  await completeAuthLink(result.url);
  return true;
}
