import { Redirect } from 'expo-router';

import { useAuth } from '../providers/auth-provider';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (session) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}