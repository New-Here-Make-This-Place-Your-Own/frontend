/**
 * Design tokens pulled directly from the New Here Figma file
 * (fileKey 0753Kv92CjN5TiO5g1WzpK). Keep this as the single source of
 * truth — every screen/component should reference these rather than
 * hardcoding hex values, so a future re-sync from Figma only touches
 * one file.
 */

export const colors = {
  background: '#faf8f5',
  ink: '#2d2623', // primary text / borders — nearly everything is outlined in this
  inkMuted: '#594f4b', // secondary text
  white: '#ffffff',

  // Card gradients (LinearGradient start -> end)
  gradientMint: ['#a8e6cf', '#dcedc1'] as const, // anchor quest, step 1
  gradientCoral: ['#ffd3b6', '#ffaaa5'] as const, // sensory vibe, step 2
  gradientPeriwinkle: ['#e0c3fc', '#8ec5fc'] as const, // step 3, tip box
  gradientGold: ['#ffd166', '#ff9f1c'] as const, // primary CTA buttons
  gradientPeach: ['#ffeaa7', '#ffd3b6'] as const, // selected preference tags

  overlayLight: 'rgba(45,38,35,0.1)',
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 100,
} as const;

export const borders = {
  thin: 1.5,
  standard: 2,
  thick: 4,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/**
 * Font families. Requires @expo-google-fonts/outfit and
 * @expo-google-fonts/lora — see README for the useFonts setup.
 *
 * Outfit carries all UI chrome (headings, labels, buttons).
 * Lora Italic carries the "voice" text — quotes, descriptions, taglines.
 */
export const fonts = {
  outfitExtraBold: 'Outfit_800ExtraBold',
  outfitBold: 'Outfit_700Bold',
  outfitSemiBold: 'Outfit_600SemiBold',
  outfitRegular: 'Outfit_400Regular',
  loraItalic: 'Lora_400Regular_Italic',
  loraRegular: 'Lora_400Regular',
} as const;

export const shadow = {
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  button: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 4,
  },
} as const;
