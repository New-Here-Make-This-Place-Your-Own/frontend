import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { completeAuthLink } from '@/lib/auth-links';
import { FormPage } from '@/components/FormPage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/providers/auth-provider';
import { EntryHeading, EntryMessage } from '@/components/EntryUI';
import { entry } from '@/theme/entry';

export default function AuthCallback() {
  const url = Linking.useLinkingURL();
  const { loading } = useAuth();
  const [error, setError] = useState('');
  useEffect(() => {
    if (loading) return;
    const callbackUrl = Platform.OS === 'web' ? window.location.href : url;
    if (!callbackUrl) return;
    let active = true;
    completeAuthLink(callbackUrl).then(recovery => {
      if (active) router.replace(recovery ? '/(auth)/reset-password' : '/');
    }).catch(err => {
      if (active) setError(err instanceof Error ? err.message : 'Unable to verify this link.');
    });
    return () => { active = false; };
  }, [url, loading]);
  return <FormPage variant="entry" contentStyle={{ paddingTop: 56 }}>
    <EntryHeading title={error ? 'Let’s try that again.' : 'Opening your next chapter…'} />
    {error ? <>
      <EntryMessage error>{error}</EntryMessage>
      <PrimaryButton variant="entry" label="Back to sign in" onPress={() => router.replace('/(auth)/login')} />
      <PrimaryButton variant="entry" label="Request another confirmation" onPress={() => router.replace('/(auth)/verify-email')} />
    </> : <ActivityIndicator color={entry.colors.coral} />}
  </FormPage>;
}
