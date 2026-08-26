import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { borders, colors, fonts, radii, shadow, spacing } from '../theme/tokens';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  if (selected) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={shadow.button}>
        <LinearGradient
          colors={colors.gradientPeach}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.chip}
        >
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.chip, styles.unselected]}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.md,
    paddingHorizontal: 18,
    borderRadius: radii.xl,
    borderWidth: borders.standard,
    borderColor: colors.ink,
  },
  unselected: {
    backgroundColor: colors.white,
  },
  label: {
    fontFamily: fonts.outfitExtraBold,
    fontSize: 14,
    color: colors.ink,
  },
});
