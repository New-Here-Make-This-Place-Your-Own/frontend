import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LoginScreen } from '@/screens/LoginScreen';
import { isValidEmail, normalizeEmail } from '@/lib/validation';
import { signInWithSocialProvider, SocialProvider } from '@/lib/social-auth';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(null);
  async function handleSocial(provider: SocialProvider) {
    if (loading || socialProvider) return;
    setSocialProvider(provider); setError('');
    try {
      if (await signInWithSocialProvider(provider)) router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally { setSocialProvider(null); }
  }
  async function handleLogin(email: string, password: string) {
    if (loading || socialProvider) return;
    setError('');
    if (!isValidEmail(email) || !password) {
      setError('Enter a valid email address and your password.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
      if (error) throw error;
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally { setLoading(false); }
  }
  return <LoginScreen loading={loading} socialProvider={socialProvider} error={error} onSubmit={handleLogin} onSocialSignIn={handleSocial} />;
}
