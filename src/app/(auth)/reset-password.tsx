import { useState } from 'react';
import { Text, TextInput } from 'react-native';
import { Link, router } from 'expo-router';
import { FormPage } from '@/components/FormPage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { styles } from '@/screens/EmailActionScreen';

export default function ResetPassword() {
  const { session, loading: authLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function save() {
    if (loading) return;
    setError('');
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (password !== confirmation) { setError('The passwords do not match.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update your password. Please try again.');
    } finally { setLoading(false); }
  }
  return <FormPage>
    <Text style={styles.title}>Choose a new password</Text>
    {!authLoading && !session ? <>
      <Text style={styles.body}>Open the latest reset link from your email first.</Text>
      <Link href="/(auth)/forgot-password">Request a reset link</Link>
    </> : <>
      <TextInput style={styles.input} accessibilityLabel="New password" placeholder="New password (at least 8 characters)" secureTextEntry autoComplete="new-password" value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} accessibilityLabel="Confirm password" placeholder="Confirm password" secureTextEntry autoComplete="new-password" value={confirmation} onChangeText={setConfirmation} />
      {error ? <Text accessibilityRole="alert" style={styles.body}>{error}</Text> : null}
      <PrimaryButton label="Save password" disabled={authLoading} loading={loading} onPress={save} />
    </>}
  </FormPage>;
}
