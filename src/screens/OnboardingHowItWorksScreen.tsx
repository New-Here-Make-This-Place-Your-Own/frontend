import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FormPage } from '../components/FormPage';
import { useRouter } from 'expo-router';

import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { borders, colors, fonts, radii, spacing } from '../theme/tokens';

const STEPS = [
  {
    emoji: '🗺️',
    title: 'Get Location Quests',
    body: 'Receive playful daily prompts tuned to your current atmosphere, neighborhoods, and local sunlight.',
    gradient: colors.gradientMint,
  },
  {
    emoji: '📸',
    title: 'Capture & Pin',
    body: 'Take snaps of hidden gates, cozy benches, and secret signs, dropping memory pins onto your interactive map.',
    gradient: colors.gradientCoral,
  },
  {
    emoji: '📓',
    title: 'Reflect & Journal',
    body: "Log private thoughts or leave floating 'Ghost Notes' to surprise and inspire future wanderers who walk by.",
    gradient: colors.gradientPeriwinkle,
  },
] as const;

export function OnboardingHowItWorksScreen() {
  const router = useRouter();

  return (
    <FormPage>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>Step 2 of 3 · How it works</Text>
          <TouchableOpacity
            style={styles.skipBadge}
            onPress={() => router.push('/(onboarding)/personalize')}
          >
            <Text style={styles.skipLabel}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.eyebrow} onPress={() => router.replace("/(onboarding)/welcome")}>← Back</Text>
        <Text style={styles.headline}>Your Daily Adventure Loop</Text>

        <View style={styles.steps}>
          {STEPS.map((step) => (
            <Card key={step.title} gradient={step.gradient} padding={16}>
              <View style={styles.stepRow}>
                <View style={styles.emojiIcon}>
                  <Text style={styles.emoji}>{step.emoji}</Text>
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Continue to Personalize ↗"
          onPress={() => router.push('/(onboarding)/personalize')}
        />
      </View>
    </FormPage>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between' },
  body: { gap: spacing.xxl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontFamily: fonts.outfitExtraBold, fontSize: 13, color: colors.inkMuted, textTransform: 'uppercase' },
  skipBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: borders.thin,
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  skipLabel: { fontFamily: fonts.outfitExtraBold, fontSize: 11, color: colors.inkMuted },
  headline: { fontFamily: fonts.outfitExtraBold, fontSize: 28, color: colors.ink },
  steps: { gap: spacing.lg },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  emojiIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    borderWidth: borders.standard,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  stepText: { flex: 1, gap: spacing.xs },
  stepTitle: { fontFamily: fonts.outfitExtraBold, fontSize: 16, color: colors.ink },
  stepBody: { fontFamily: fonts.loraRegular, fontSize: 13, lineHeight: 18, color: colors.inkMuted },
  footer: { paddingVertical: spacing.lg },
});
