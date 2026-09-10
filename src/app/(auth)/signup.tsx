import { useState } from 'react';
import { router } from 'expo-router';
import { SignupScreen } from '@/screens/SignupScreen';
import { supabase } from '@/lib/supabase';
import { getAuthRedirectUrl } from '@/lib/auth-links';
import { isValidEmail, normalizeEmail } from '@/lib/validation';

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function handleSignup(email: string, password: string) {
    if (loading) return;
    setError('');
    if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizeEmail(email), password,
        options: { emailRedirectTo: getAuthRedirectUrl() },
      });
      if (error) throw error;
      router.replace(data.session ? '/' : { pathname: '/(auth)/verify-email', params: { email: normalizeEmail(email) } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account. Please try again.');
    } finally { setLoading(false); }
  }
  return <SignupScreen loading={loading} error={error} onSubmit={handleSignup} />;
}
