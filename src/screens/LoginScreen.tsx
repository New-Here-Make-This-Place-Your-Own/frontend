import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FormPage } from '@/components/FormPage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EntryField, EntryHeading, EntryIcon, EntryMessage, ui } from '@/components/EntryUI';
import { entry } from '@/theme/entry';
import { entryAssets } from '@/theme/entry-assets';
import { SocialProvider } from '@/lib/social-auth';

export function LoginScreen({ onSubmit, onSocialSignIn, loading, socialProvider, error }: {
  error?: string; loading: boolean; socialProvider?: SocialProvider | null;
  onSubmit: (email: string, password: string) => void;
  onSocialSignIn: (provider: SocialProvider) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const busy = loading || Boolean(socialProvider);
  return <FormPage variant="entry" contentStyle={styles.page}>
    <EntryHeading title="Welcome back." subtitle="There’s more of your city waiting." />
    <View style={styles.form}>
      <EntryField label="Email" icon={entryAssets.login.imgMargin} placeholder="wanderer@cartography.org" autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} editable={!busy} />
      <EntryField label="Password" password icon={entryAssets.login.imgMargin1} placeholder="••••••••••" autoComplete="current-password" value={password} onChangeText={setPassword} editable={!busy} onSubmitEditing={() => onSubmit(email, password)} />
      <View style={styles.utilities}>
        <Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/verify-email')} hitSlop={8}><Text style={styles.resend}>Resend confirmation</Text></Pressable>
        <Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/forgot-password')} hitSlop={8}><Text style={ui.link}>Forgot password?</Text></Pressable>
      </View>
      <EntryMessage error>{error}</EntryMessage>
      <PrimaryButton variant="entryGradient" label="Continue journey" loading={loading} disabled={busy} onPress={() => onSubmit(email, password)} icon={<EntryIcon source={entryAssets.login.imgContainer1} size={12} />} />
    </View>
    <View style={styles.divider}><View style={styles.line} /><Text style={styles.dividerText}>or continue through</Text><View style={styles.line} /></View>
    <View style={styles.socials}>
      <Pressable accessibilityRole="button" accessibilityLabel="Continue with Google" accessibilityState={{ disabled: busy, busy: socialProvider === 'google' }} disabled={busy} onPress={() => onSocialSignIn('google')} style={({ pressed }) => [styles.social, (pressed || busy) && ui.pressed]}>
        {socialProvider === 'google' ? <ActivityIndicator color={entry.colors.rust} size="small" /> : <EntryIcon source={entryAssets.login.imgSvg} size={16} />}
        <Text style={styles.socialText}>Continue with Google</Text>
      </Pressable>
    </View>
    <View style={styles.footer}><Text style={styles.footerText}>New to the expedition?</Text><Pressable accessibilityRole="link" onPress={() => router.replace('/(auth)/signup')} hitSlop={8}><Text style={styles.create}>Create an account</Text></Pressable></View>
  </FormPage>;
}
const styles = StyleSheet.create({
  page: { paddingTop: 56, gap: 0, minHeight: 844 },
  form: { marginTop: 48, gap: 24 },
  utilities: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  resend: { fontFamily: entry.fonts.sans, fontSize: 11, color: entry.colors.subtle, lineHeight: 20 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 40, marginBottom: 28 },
  dividerText: { fontFamily: entry.fonts.italic, fontSize: 19, color: entry.colors.subtle },
  line: { flex: 1, height: 1, backgroundColor: '#e5e2dc' },
  socials: { gap: 12 },
  social: { flexDirection: 'row', gap: 12, justifyContent: 'center', alignItems: 'center', minHeight: 48, backgroundColor: '#fff', borderColor: entry.colors.line, borderWidth: 1, borderRadius: 999 },
  socialText: { fontFamily: entry.fonts.semibold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: entry.colors.ink },
  footer: { marginTop: 48, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: entry.colors.faint, flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center', justifyContent: 'center', gap: 8 },
  footerText: { fontFamily: entry.fonts.sans, fontSize: 12, color: entry.colors.muted },
  create: { fontFamily: entry.fonts.semibold, fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase', color: entry.colors.rust },
});
