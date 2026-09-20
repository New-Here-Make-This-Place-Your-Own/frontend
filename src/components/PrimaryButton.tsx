import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { entry } from '../theme/entry';

import { borders, colors, fonts, radii, shadow, spacing } from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  variant?: 'default' | 'entry' | 'entryGradient';
};

export function PrimaryButton({ label, onPress, disabled, loading, icon, variant = 'default' }: Props) {
  const isEntry = variant !== 'default';
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[isEntry ? styles.entryShadow : shadow.button, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={variant === 'entryGradient' ? entry.gradient : isEntry ? [entry.colors.coral, entry.colors.coral] : colors.gradientGold}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, isEntry && styles.entryButton]}
      >
        {loading ? (
          <ActivityIndicator color={isEntry ? entry.colors.white : colors.ink} />
        ) : (
          <>
            {!isEntry && icon}
            <Text style={[styles.label, isEntry && styles.entryLabel]}>{label}</Text>
            {isEntry && icon}
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  entryShadow: { shadowColor: entry.colors.coral, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 9, elevation: 4, borderRadius: 999 },
  entryButton: { minHeight: 56, borderWidth: 0, borderRadius: 999, paddingHorizontal: 20 },
  entryLabel: { fontFamily: entry.fonts.semibold, fontSize: 12, letterSpacing: 1, color: entry.colors.white, textAlign: 'center', textTransform: 'uppercase' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.xl,
    borderWidth: borders.standard,
    borderColor: colors.ink,
  },
  label: {
    fontFamily: fonts.outfitExtraBold,
    fontSize: 16,
    color: colors.ink,
  },
  disabled: {
    opacity: 0.5,
  },
});
