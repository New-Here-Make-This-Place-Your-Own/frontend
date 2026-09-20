import { ReactNode, useState } from 'react';
import { Image, ImageSource } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { entry } from '@/theme/entry';
import { entryAssets } from '@/theme/entry-assets';

export function EntryIcon({ source, size = 18, width = size, height = size }: { source: ImageSource; size?: number; width?: number; height?: number }) {
  return <Image source={source} style={{ width, height }} contentFit="contain" accessible={false} />;
}

export function EntryBack({ onPress, label }: { onPress: () => void; label?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label || 'Back'} onPress={onPress} style={({ pressed }) => [ui.back, label ? ui.backLabel : null, pressed && ui.pressed]}>
    <EntryIcon source={entryAssets.location.imgContainer} size={16} />
    {label && <Text style={ui.label}>{label}</Text>}
  </Pressable>;
}

export function EntryHeading({ title, subtitle, eyebrow }: { title: string; subtitle?: string; eyebrow?: string }) {
  return <View style={{ gap: 8 }}>
    {eyebrow && <Text style={ui.eyebrow}>{eyebrow}</Text>}
    <Text accessibilityRole="header" style={ui.title}>{title}</Text>
    {subtitle && <Text style={ui.subtitle}>{subtitle}</Text>}
  </View>;
}

export function EntryMessage({ children, error = false }: { children?: ReactNode; error?: boolean }) {
  if (!children) return null;
  return <Text accessibilityRole={error ? 'alert' : undefined} accessibilityLiveRegion="polite" style={[ui.message, error && ui.error]}>{children}</Text>;
}

export function EntryField({ label, icon, password = false, inset = false, ...props }: TextInputProps & { label: string; icon?: ImageSource; password?: boolean; inset?: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const [focused, setFocused] = useState(false);
  return <View style={[ui.field, inset && ui.insetField, inset && focused && ui.focus]}>
    <View style={ui.row}>
      <Text style={[ui.label, inset && ui.smallLabel]}>{label}</Text>
      {password && <Pressable accessibilityRole="button" accessibilityLabel={`${revealed ? 'Hide' : 'Reveal'} ${label.toLowerCase()}`} onPress={() => setRevealed(!revealed)} hitSlop={12}>
        {inset ? <EntryIcon source={entryAssets.signup.imgButton} size={18} /> : <Text style={ui.reveal}>{revealed ? 'Hide' : 'Reveal'}</Text>}
      </Pressable>}
      {!password && inset && icon && <EntryIcon source={icon} size={16} />}
    </View>
    <View style={[ui.inputRow, inset && ui.insetInputRow, !inset && focused && ui.focus]}>
      {!inset && icon && <EntryIcon source={icon} width={password ? 20 : 18} height={18} />}
      <TextInput {...props} autoCapitalize={password ? 'none' : props.autoCapitalize} autoCorrect={password ? false : props.autoCorrect} accessibilityLabel={props.accessibilityLabel || label} secureTextEntry={password && !revealed} placeholderTextColor={entry.colors.placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={[ui.input, inset && ui.insetInput, props.style]} />
    </View>
  </View>;
}

export const ui = StyleSheet.create({
  title: { fontFamily: entry.fonts.serif, fontSize: 34, lineHeight: 40, letterSpacing: -0.85, color: entry.colors.ink },
  subtitle: { fontFamily: entry.fonts.italic, fontSize: 19, lineHeight: 29, color: entry.colors.muted },
  body: { fontFamily: entry.fonts.sans, fontSize: 15, lineHeight: 24, color: entry.colors.muted },
  eyebrow: { fontFamily: entry.fonts.semibold, fontSize: 10, lineHeight: 14, letterSpacing: 1, textTransform: 'uppercase', color: entry.colors.coral },
  label: { fontFamily: entry.fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: 'uppercase', color: entry.colors.muted },
  smallLabel: { fontSize: 10, color: entry.colors.subtle },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  back: { width: 40, height: 40, borderWidth: 1, borderColor: '#eee9df', borderRadius: 999, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  backLabel: { width: 'auto', alignSelf: 'flex-start', borderWidth: 0, backgroundColor: 'transparent' },
  pressed: { opacity: 0.65 },
  field: { gap: 4 },
  insetField: { backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 1, borderColor: entry.colors.line, borderRadius: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, minHeight: 86, gap: 7 },
  inputRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: entry.colors.line, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 8, paddingHorizontal: 16 },
  insetInputRow: { borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0, minHeight: 28 },
  input: { flex: 1, minWidth: 0, paddingVertical: 12, fontFamily: entry.fonts.italic, fontSize: 16, color: entry.colors.ink },
  insetInput: { paddingVertical: 2, fontSize: 17 },
  focus: { borderColor: entry.colors.coral },
  reveal: { fontFamily: entry.fonts.bold, fontSize: 10, color: entry.colors.rust, letterSpacing: 0.8 },
  link: { fontFamily: entry.fonts.sans, color: entry.colors.rust, fontSize: 13, lineHeight: 20 },
  message: { fontFamily: entry.fonts.sans, fontSize: 13, lineHeight: 21, color: entry.colors.muted },
  error: { color: entry.colors.rust },
  card: { backgroundColor: entry.colors.card, borderWidth: 1, borderColor: '#f1ece1', borderRadius: 12, padding: 20, gap: 12, shadowColor: '#7e4b2a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
});
