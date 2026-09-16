import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FormPage } from '../components/FormPage';

import { PrimaryButton } from '../components/PrimaryButton';
import { borders, colors, fonts, radii, spacing } from '../theme/tokens';
import { router } from 'expo-router';


export function LoginScreen({
  onSubmit, loading, error
}: {
 error?: string; loading: boolean; onSubmit: (email: string, password: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <FormPage>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.headline}>Welcome back! 🔑</Text>
          <Text style={styles.subhead}>
            Sign in to resume dropping pins and exploring city secrets.
          </Text>
        </View>

        <View style={styles.fields}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="wanderer@secretplaces.com"
              placeholderTextColor={colors.inkMuted}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              accessibilityLabel="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.fieldGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.fieldLabel}>Secret Password</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                <Text style={styles.forgotLabel}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor={colors.inkMuted}
              accessibilityLabel="Password"
              autoComplete="current-password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.subhead}>{error}</Text> : null}
        <Text style={styles.toggleLink} onPress={() => router.push("/(auth)/verify-email")}>Resend confirmation email</Text>
        <PrimaryButton disabled={loading} label={loading? "Signing In...": "Sign In to Explore"} onPress={() => onSubmit(email, password)} />


      </View>

      <View style={styles.footer}>
        <Text style={styles.toggleText}>
          New to wandering? <Text style={styles.toggleLink} onPress={() => router.replace("/(auth)/signup")}>Create Account</Text>
        </Text>
      </View>
    </FormPage>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between' },
  body: { padding: spacing.xxl, gap: spacing.xl },
  header: { gap: spacing.sm },
  headline: { fontFamily: fonts.outfitExtraBold, fontSize: 28, color: colors.ink },
  subhead: { fontFamily: fonts.loraItalic, fontSize: 15, color: colors.inkMuted },
  fields: { gap: spacing.lg },
  fieldGroup: { gap: spacing.sm },
  fieldLabel: { fontFamily: fonts.outfitExtraBold, fontSize: 13, color: colors.ink, textTransform: 'uppercase' },
  passwordLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotLabel: { fontFamily: fonts.outfitBold, fontSize: 12, color: colors.inkMuted },
  input: {
    borderWidth: borders.standard,
    borderColor: colors.ink,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontFamily: fonts.outfitRegular,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.overlayLight },
  dividerLabel: { fontFamily: fonts.outfitBold, fontSize: 12, color: colors.inkMuted },
  socialRow: { flexDirection: 'row', gap: spacing.md },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: borders.standard,
    borderColor: colors.ink,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  socialLabel: { fontFamily: fonts.outfitBold, fontSize: 13, color: colors.ink },
  footer: { padding: spacing.xxl, alignItems: 'center' },
  toggleText: { fontFamily: fonts.loraRegular, fontSize: 14, color: colors.inkMuted },
  toggleLink: { fontFamily: fonts.outfitExtraBold, color: colors.ink, textDecorationLine: 'underline' },
});
