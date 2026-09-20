import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { FormPage } from '@/components/FormPage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EntryField, EntryHeading, EntryIcon, EntryMessage, ui } from '@/components/EntryUI';
import { entryAssets } from '@/theme/entry-assets';
import { entry } from '@/theme/entry';

export function SignupScreen({ onSubmit, loading, error }: {
  error?: string; loading: boolean; onSubmit: (email: string, password: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [confirmationError, setConfirmationError] = useState('');
  function submit() {
    if (loading) return;
    if (password !== confirmation) { setConfirmationError('The passwords do not match.'); return; }
    setConfirmationError(''); onSubmit(email, password);
  }
  return <FormPage variant="entry" contentStyle={styles.page}>
    <View style={styles.heading}>
      <Image source={entryAssets.signup.imgSvg} contentFit="contain" style={styles.contours} accessible={false} />
      <EntryHeading eyebrow="New Here" title="Start somewhere new." subtitle="“Even if you’ve lived there for years.”" />
    </View>
    <View style={styles.fields}>
      <EntryField inset label="Email" icon={entryAssets.signup.imgContainer1} placeholder="wanderer@new.here" keyboardType="email-address" autoComplete="email" autoCorrect={false} autoCapitalize="none" value={email} onChangeText={setEmail} editable={!loading} />
      <EntryField inset label="Password" password placeholder="A cipher known only to your compass" autoComplete="new-password" value={password} onChangeText={setPassword} editable={!loading} />
      <EntryField inset label="Re-type password" password placeholder="Re-inscribe cipher to confirm" autoComplete="new-password" value={confirmation} onChangeText={value => { setConfirmation(value); setConfirmationError(''); }} editable={!loading} onSubmitEditing={submit} />
      <Text style={styles.hint}>Use at least 8 characters.</Text>
      <EntryMessage error>{confirmationError || error}</EntryMessage>
      <PrimaryButton variant="entry" label="Create account" loading={loading} onPress={submit} icon={<EntryIcon source={entryAssets.signup.imgContainer2} size={16} />} />
    </View>
    <View style={styles.footer}><Text style={ui.body}>Already exploring?</Text><Pressable accessibilityRole="link" onPress={() => router.replace('/(auth)/login')} hitSlop={8}><Text style={styles.login}>Log in →</Text></Pressable></View>
  </FormPage>;
}
const styles = StyleSheet.create({
  page: { paddingTop: 32, gap: 0 },
  heading: { position: 'relative', paddingBottom: 70 },
  contours: { position: 'absolute', right: 0, top: -32, width: 215, height: 165, opacity: 0.65 },
  fields: { gap: 16 },
  hint: { fontFamily: entry.fonts.sans, fontSize: 11, color: entry.colors.subtle },
  footer: { marginTop: 28, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8 },
  login: { fontFamily: entry.fonts.semibold, color: entry.colors.coral, fontSize: 15 },
});
