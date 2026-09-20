import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { FormPage } from '@/components/FormPage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { supabase } from '@/lib/supabase';
import { getAuthRedirectUrl } from '@/lib/auth-links';
import { isValidEmail, normalizeEmail } from '@/lib/validation';
import { EntryBack, EntryField, EntryHeading, EntryIcon, EntryMessage, ui } from '@/components/EntryUI';
import { entryAssets } from '@/theme/entry-assets';

export function EmailActionScreen({ recovery = false, initialEmail = '' }: { recovery?: boolean; initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  async function send() {
    if (loading || cooldown) return;
    setError(''); setMessage('');
    if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
    setLoading(true);
    try {
      const result = recovery
        ? await supabase.auth.resetPasswordForEmail(normalizeEmail(email), { redirectTo: getAuthRedirectUrl(true) })
        : await supabase.auth.resend({ type: 'signup', email: normalizeEmail(email), options: { emailRedirectTo: getAuthRedirectUrl() } });
      if (result.error) throw result.error;
      setMessage('If this address is eligible, an email is on its way. Check your inbox and spam folder, then open the latest link on the device with New Here installed.');
      setCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send email. Please try again.');
    } finally { setLoading(false); }
  }
  return <FormPage variant="entry">
    <EntryBack label="Login" onPress={() => router.replace('/(auth)/login')} />
    <View style={styles.vignette}>
      <Image source={entryAssets.recovery.imgImage} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
      <LinearGradient colors={['rgba(240,238,232,0)', 'rgba(240,238,232,0.4)', '#f0eee8']} style={StyleSheet.absoluteFill} />
    </View>
    <EntryHeading eyebrow={recovery ? 'Field recovery' : 'One more step'} title={recovery ? 'Find your way back.' : 'Check your email.'} />
    <Text style={ui.body}>{recovery ? 'Enter your email and we’ll send you a reset link to recover your field journal, pinned memories, and uncataloged paths.' : 'Confirm your email to finish creating your account. The link will bring you back to New Here.'}</Text>
    <View style={{ marginTop: 8 }}>
      <EntryField label="Registered email" icon={entryAssets.recovery.imgIcon} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" placeholder="wanderer@flaneur.archive" editable={!loading} onSubmitEditing={send} />
    </View>
    <EntryMessage error>{error}</EntryMessage>
    <EntryMessage>{message}</EntryMessage>
    <PrimaryButton variant="entry" label={cooldown ? 'Send again in ' + cooldown + 's' : recovery ? 'Send reset link' : 'Resend confirmation email'} loading={loading} disabled={cooldown > 0} onPress={send} icon={<EntryIcon source={entryAssets.recovery.imgContainer1} size={12} />} />
    <Link href="/(auth)/login" style={styles.back}>← Back to login</Link>
  </FormPage>;
}
export const styles = StyleSheet.create({
  title: ui.title,
  body: ui.body,
  input: { ...ui.inputRow, ...ui.input, flex: undefined },
  vignette: { height: 144, borderRadius: 12, overflow: 'hidden' },
  back: { ...ui.label, textAlign: 'center', padding: 12 },
});
