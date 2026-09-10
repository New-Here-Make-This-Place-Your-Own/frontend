import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LoginScreen } from '@/screens/LoginScreen';
import { isValidEmail, normalizeEmail } from '@/lib/validation';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function handleLogin(email: string, password: string) {
    if (loading) return;
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
  return <LoginScreen loading={loading} error={error} onSubmit={handleLogin} />;
}
