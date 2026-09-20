import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { entry } from '@/theme/entry';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';

export function FormPage({ children, variant = 'default', contentStyle, flush = false }: PropsWithChildren<{ variant?: 'default' | 'entry'; contentStyle?: StyleProp<ViewStyle>; flush?: boolean }>) {
  const isEntry = variant === 'entry';
  return <SafeAreaView style={[styles.screen, isEntry && styles.entryScreen]}>
    {isEntry && <LinearGradient pointerEvents="none" colors={['#fcefe5', entry.colors.paper, entry.colors.paper]} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} />}
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, isEntry && styles.entryContent, flush && styles.flush, contentStyle]}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  entryScreen: { backgroundColor: entry.colors.paper },
  entryContent: { maxWidth: 440, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48, gap: 24 },
  flush: { padding: 0, paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0, gap: 0 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, width: '100%', maxWidth: 600, alignSelf: 'center', padding: spacing.xxl, gap: spacing.xl },
});
