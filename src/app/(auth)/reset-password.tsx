import { useState } from 'react';
import { Text } from 'react-native';
import { Link, router } from 'expo-router';
import { FormPage } from '@/components/FormPage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { styles } from '@/screens/EmailActionScreen';
import { EntryField, EntryHeading, EntryMessage } from '@/components/EntryUI';

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
  return <FormPage variant="entry" contentStyle={{ paddingTop: 56 }}>
    <EntryHeading eyebrow="A fresh start" title="Choose a new password." subtitle="Your next chapter is waiting." />
    {!authLoading && !session ? <>
      <Text style={styles.body}>Open the latest reset link from your email first.</Text>
      <Link href="/(auth)/forgot-password">Request a reset link</Link>
    </> : <>
      <EntryField inset password label="New password" placeholder="At least 8 characters" autoComplete="new-password" value={password} onChangeText={setPassword} editable={!loading} />
      <EntryField inset password label="Confirm password" placeholder="Re-inscribe cipher to confirm" autoComplete="new-password" value={confirmation} onChangeText={setConfirmation} editable={!loading} onSubmitEditing={save} />
      <EntryMessage error>{error}</EntryMessage>
      <PrimaryButton variant="entry" label="Save password" disabled={authLoading} loading={loading} onPress={save} />
    </>}
  </FormPage>;
}
