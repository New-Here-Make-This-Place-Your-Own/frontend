import { PropsWithChildren } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { useProfile } from '@/providers/profile-provider';
import { isOnboardingComplete } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { FormPage } from './FormPage';
import { PrimaryButton } from './PrimaryButton';

export function ProfileGate({ children, onboarding = false }: PropsWithChildren<{ onboarding?: boolean }>) {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading, error, reload } = useProfile();
  if (authLoading) return <ActivityIndicator />;
  if (!session) return <Redirect href="/(auth)/start" />;
  if (loading) return <ActivityIndicator />;
  if (error) return <FormPage>
    <Text accessibilityRole="alert">{error}</Text>
    <PrimaryButton label="Try again" onPress={() => { void reload(); }} />
    <PrimaryButton label="Sign out" onPress={() => { void supabase.auth.signOut(); }} />
  </FormPage>;
  const complete = isOnboardingComplete(profile);
  if (onboarding && complete) return <Redirect href="/(app)" />;
  if (!onboarding && !complete) return <Redirect href="/(onboarding)/welcome" />;
  return children;
}
