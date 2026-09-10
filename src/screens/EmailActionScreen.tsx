import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { FormPage } from '@/components/FormPage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { supabase } from '@/lib/supabase';
import { getAuthRedirectUrl } from '@/lib/auth-links';
import { isValidEmail, normalizeEmail } from '@/lib/validation';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

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
  return <FormPage>
    <Text style={styles.title}>{recovery ? 'Forgot your password?' : 'Check your email'}</Text>
    <Text style={styles.body}>{recovery ? 'We will send you a link to choose a new password.' : 'Confirm your email to finish creating your account. The link will bring you back to New Here.'}</Text>
    <TextInput accessibilityLabel="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" placeholder="you@example.com" />
    {error ? <Text accessibilityRole="alert" style={styles.body}>{error}</Text> : null}
    {message ? <Text accessibilityLiveRegion="polite" style={styles.body}>{message}</Text> : null}
    <PrimaryButton label={cooldown ? `Send again in ${cooldown}s` : recovery ? 'Send reset link' : 'Resend confirmation email'} loading={loading} disabled={cooldown > 0} onPress={send} />
    <Link href="/(auth)/login" style={styles.body}>Back to sign in</Link>
  </FormPage>;
}
export const styles = StyleSheet.create({
  title: { fontFamily: fonts.outfitExtraBold, fontSize: 28, color: colors.ink },
  body: { fontFamily: fonts.outfitRegular, fontSize: 16, lineHeight: 24, color: colors.inkMuted },
  input: { borderWidth: 2, borderColor: colors.ink, borderRadius: radii.md, padding: spacing.lg, backgroundColor: colors.white, color: colors.ink, fontSize: 16 },
});
