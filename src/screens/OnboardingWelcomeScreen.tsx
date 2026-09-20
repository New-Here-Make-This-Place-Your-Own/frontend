import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { FormPage } from '@/components/FormPage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EntryIcon, ui } from '@/components/EntryUI';
import { entry } from '@/theme/entry';
import { entryAssets } from '@/theme/entry-assets';

export function OnboardingWelcomeScreen() {
  const art = entryAssets.intro;
  const concepts = [
    { title: '01 // Discover', body: 'Follow small prompts into unfamiliar corners.', icon: art.imgContainer, tint: '#e0f2fe' },
    { title: '02 // Remember', body: 'Save photos and notes from places that mattered.', icon: art.imgContainer1, tint: '#ffedd5' },
    { title: '03 // Reveal', body: 'Watch your map uncover itself as you explore.', icon: art.imgContainer2, tint: '#dcfce7' },
  ];
  return <FormPage variant="entry" contentStyle={{ gap: 32 }}>
    <LinearGradient colors={['#fff1eb', '#f9e8f4', '#eef2ff']} style={styles.hero}>
      <View style={styles.photo}>
        <Image source={art.imgPhoto1516483638261F4Dbaf036963} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
        <LinearGradient colors={['rgba(240,238,232,0)', 'rgba(240,238,232,0.6)', '#f0eee8']} style={StyleSheet.absoluteFill} />
        <Image source={art.imgSvgLivingMistVectorContours} style={[StyleSheet.absoluteFill, { opacity: 0.4 }]} contentFit="fill" />
      </View>
      <View style={styles.editorial}>
        <Text style={ui.eyebrow}>The art of noticing</Text>
        <Text accessibilityRole="header" style={ui.title}>Make this place{'\n'}<Text style={{ fontFamily: entry.fonts.italic, color: entry.colors.rust }}>your own.</Text></Text>
        <Text style={styles.description}>New Here gives you small reasons to wander, notice, and remember.</Text>
      </View>
    </LinearGradient>
    <View style={{ gap: 24 }}>{concepts.map(concept => <View key={concept.title} style={styles.concept}>
      <View style={[styles.badge, { backgroundColor: concept.tint }]}><EntryIcon source={concept.icon} size={18} /></View>
      <View style={{ flex: 1, gap: 8 }}><Text style={styles.conceptTitle}>{concept.title}</Text><Text style={[ui.body, { lineHeight: 21 }]}>{concept.body}</Text></View>
    </View>)}</View>
    <LinearGradient colors={['#fff1eb', '#f9e8f4', '#eef2ff']} style={styles.note}>
      <View style={styles.info}><Text style={{ fontFamily: entry.fonts.italic, color: '#fff' }}>i</Text></View>
      <View style={{ flex: 1, gap: 4 }}><Text style={ui.eyebrow}>Ghost echoes</Text><Text style={styles.noteText}>“Sometimes, you’ll find traces left by strangers too.”</Text></View>
    </LinearGradient>
    <View style={{ gap: 16 }}><View style={styles.dots}><View style={styles.activeDot} /><View style={styles.dot} /><View style={styles.dot} /></View>
      <PrimaryButton variant="entry" label="Continue" onPress={() => router.push('/(onboarding)/personalize')} icon={<EntryIcon source={art.imgContainer3} size={14} />} />
    </View>
  </FormPage>;
}
const styles = StyleSheet.create({
  hero: { borderWidth: 1, borderColor: '#fed7aa', borderRadius: 12, overflow: 'hidden' },
  photo: { height: 256 }, editorial: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24, gap: 8 },
  description: { fontFamily: entry.fonts.serif, fontSize: 19, lineHeight: 31, color: entry.colors.muted },
  concept: { ...ui.card, flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 16 },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  conceptTitle: { fontFamily: entry.fonts.bold, fontSize: 10, lineHeight: 14, letterSpacing: 0.5, textTransform: 'uppercase', color: entry.colors.ink },
  note: { borderWidth: 1, borderColor: '#fed7aa', borderRadius: 12, padding: 16, gap: 12, flexDirection: 'row' },
  info: { width: 28, height: 28, borderRadius: 14, backgroundColor: entry.colors.coral, alignItems: 'center', justifyContent: 'center' },
  noteText: { fontFamily: entry.fonts.italic, fontSize: 14, lineHeight: 20, color: '#59413d' },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#c7c7bf' },
  activeDot: { width: 24, height: 6, borderRadius: 3, backgroundColor: entry.colors.coral },
});
