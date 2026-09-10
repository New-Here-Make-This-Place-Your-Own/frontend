import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Text } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { completeAuthLink } from '@/lib/auth-links';
import { FormPage } from '@/components/FormPage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/providers/auth-provider';

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
  return <FormPage>
    <Text>{error ? 'Unable to open this email link' : 'Verifying your email link…'}</Text>
    {error ? <>
      <Text accessibilityRole="alert">{error}</Text>
      <PrimaryButton label="Back to sign in" onPress={() => router.replace('/(auth)/login')} />
      <PrimaryButton label="Request another confirmation" onPress={() => router.replace('/(auth)/verify-email')} />
    </> : <ActivityIndicator />}
  </FormPage>;
}
