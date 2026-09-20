import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { FormPage } from '@/components/FormPage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EntryIcon, ui } from '@/components/EntryUI';
import { entry } from '@/theme/entry';
import { entryAssets } from '@/theme/entry-assets';

export function WelcomeScreen() {
  const art = entryAssets.welcome;
  return <FormPage variant="entry" flush>
    <View style={styles.postcard}>
      <Image source={art.imgBeautifulSunDrenchedCobblestoneAlleyVisual} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
      <LinearGradient colors={['rgba(255,238,211,0.91)', 'rgba(255,240,224,0.9)', '#fffaf3']} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>Your city isn’t{'\n'}<Text style={styles.italic}>finished yet.</Text></Text>
        <Text style={styles.description}>Small adventures for seeing familiar places differently. Uncover whispers, botanical alleys, and quiet architectural echoes.</Text>
      </View>
      <View style={styles.contours} pointerEvents="none">
        <Image source={art.imgVector} style={styles.contourOne} contentFit="fill" />
        <Image source={art.imgVector1} style={styles.contourTwo} contentFit="fill" />
        <Image source={art.imgVector2} style={styles.contourThree} contentFit="fill" />
        <Image source={art.imgVector5} style={styles.path} contentFit="fill" />
        <Image source={art.imgVector4} style={styles.ring} contentFit="contain" />
        <Image source={art.imgVector3} style={styles.point} contentFit="contain" />
        <Image source={art.imgVector6} style={styles.endPoint} contentFit="contain" />
      </View>
    </View>
    <View style={styles.actions}>
      <PrimaryButton variant="entry" label="Start exploring" onPress={() => router.push('/(auth)/signup')} icon={<EntryIcon source={art.imgContainer} size={12} />} />
      <Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/login')} style={styles.signIn}><Text style={[ui.body, { fontSize: 14 }]}>I already have an account</Text></Pressable>
    </View>
    <Text style={styles.quote}>“To step without a destination is the only honest way to arrive.”</Text>
  </FormPage>;
}
const styles = StyleSheet.create({
  postcard: { minHeight: 620, overflow: 'hidden', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  copy: { paddingHorizontal: 16, paddingTop: 48, gap: 14 },
  title: { fontFamily: entry.fonts.serif, fontSize: 34, lineHeight: 39, letterSpacing: -0.85, color: '#201d1b' },
  italic: { fontFamily: entry.fonts.italic, fontSize: 32, color: entry.colors.rust },
  description: { fontFamily: entry.fonts.sans, fontSize: 16, lineHeight: 26, maxWidth: 285, color: '#4a4542' },
  contours: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 320, opacity: 0.35 },
  contourOne: { position: 'absolute', top: '56.77%', left: '-5%', width: '110%', height: '11.34%' },
  contourTwo: { position: 'absolute', top: '68.14%', left: '-2.5%', width: '110%', height: '8.72%' },
  contourThree: { position: 'absolute', top: '79.1%', left: '-10%', width: '120%', height: '8.11%' },
  path: { position: 'absolute', top: '43.33%', left: '35%', width: '45%', height: '16.67%' },
  ring: { position: 'absolute', top: '56%', left: '32%', width: '6%', height: '8%' },
  point: { position: 'absolute', top: '58.83%', left: '34.13%', width: '1.75%', height: '2.34%' },
  endPoint: { position: 'absolute', top: '42.5%', left: '79.38%', width: '1.24%', height: '1.67%' },
  actions: { marginHorizontal: 16, marginTop: -24, padding: 16, gap: 12, borderRadius: 16, backgroundColor: '#fffcf7', borderWidth: 1, borderColor: '#ffeedd', shadowColor: entry.colors.coral, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 3 },
  signIn: { alignItems: 'center', paddingVertical: 10 },
  quote: { fontFamily: entry.fonts.italic, fontSize: 15, lineHeight: 24, textAlign: 'center', color: '#59413d', marginHorizontal: 24, marginTop: 54, marginBottom: 56 },
});
