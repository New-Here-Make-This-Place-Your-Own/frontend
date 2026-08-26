import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { borders, colors, radii, shadow } from '../theme/tokens';

type Props = {
  children: ReactNode;
  gradient?: readonly [string, string];
  style?: ViewStyle;
  padding?: number;
};

/**
 * Every card in this design shares the same signature: thick dark border,
 * large rounded corners, soft drop shadow. `gradient` swaps the fill;
 * omit it for the plain white cards (e.g. locked curator quest).
 */
export function Card({ children, gradient, style, padding = 24 }: Props) {
  const content = (
    <View style={[styles.inner, { padding }, !gradient && styles.plain, style]}>
      {children}
    </View>
  );

  if (!gradient) {
    return <View style={shadow.card}>{content}</View>;
  }

  return (
    <View style={shadow.card}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.inner, { padding }, style]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    borderRadius: radii.xxl,
    borderWidth: borders.standard,
    borderColor: colors.ink,
  },
  plain: {
    backgroundColor: colors.white,
  },
});
