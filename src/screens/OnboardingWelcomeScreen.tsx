import { StyleSheet, Text, View } from 'react-native';
import { FormPage } from '../components/FormPage';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { PrimaryButton } from '../components/PrimaryButton';
import { borders, colors, fonts, radii, spacing } from '../theme/tokens';

export function OnboardingWelcomeScreen() {
  const router = useRouter();

  return (
    <FormPage>
      <View style={styles.body}>
        <View style={styles.brandBar}>
          <LinearGradient
            colors={colors.gradientMint}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconBadge}
          >
            <Sparkles size={16} color={colors.ink} />
          </LinearGradient>
          <Text style={styles.brandLabel}>New Here</Text>
        </View>

        <View style={styles.polaroid}>
          <LinearGradient colors={colors.gradientMint} style={styles.polaroidPhoto}><Text style={{ fontSize: 88 }}>🏘️</Text><Text style={styles.polaroidCaption}>A little curiosity. A new discovery.</Text></LinearGradient>
          <View style={styles.polaroidCaptionRow}>
            <Text style={styles.polaroidCaption}>The adventure at your doorstep...</Text>
            <Text style={styles.polaroidChapter}>Step 1 of 3</Text>
          </View>
        </View>

        <View style={styles.tagline}>
          <Text style={styles.headline}>Your city has secrets. We help you find them.</Text>
          <Text style={styles.subhead}>
            New Here is a whimsical daily companion that turns normal neighborhood strolls
            into playful curatorial quests. Let us give you new eyes.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Let's Begin 👋" onPress={() => router.push('/(onboarding)/how-it-works')} />
      </View>
    </FormPage>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between' },
  body: { gap: spacing.xxl },
  brandBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBadge: {
    padding: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: borders.standard,
    borderColor: colors.ink,
  },
  brandLabel: { fontFamily: fonts.outfitExtraBold, fontSize: 14, color: colors.ink, textTransform: 'uppercase' },
  polaroid: {
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: radii.md,
    padding: spacing.lg,
    paddingBottom: 44,
    gap: spacing.lg,
    transform: [{ rotate: '-2deg' }],
  },
  polaroidPhoto: {
    minHeight: 210,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.overlayLight,
  },
  polaroidCaptionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  polaroidCaption: { fontFamily: fonts.loraItalic, fontSize: 15, color: colors.ink, flex: 1 },
  polaroidChapter: { fontFamily: fonts.outfitBold, fontSize: 11, color: colors.inkMuted },
  tagline: { gap: spacing.md },
  headline: { fontFamily: fonts.outfitExtraBold, fontSize: 32, lineHeight: 37, color: colors.ink },
  subhead: { fontFamily: fonts.loraRegular, fontSize: 16, lineHeight: 24, color: colors.inkMuted },
  footer: { paddingVertical: spacing.lg },
});
