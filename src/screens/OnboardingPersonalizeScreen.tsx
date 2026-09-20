import { useCallback, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { FormPage } from '@/components/FormPage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PlacePicker } from '@/components/PlacePicker';
import { EntryBack, EntryHeading, EntryIcon, EntryMessage, ui } from '@/components/EntryUI';
import { useProfile } from '@/providers/profile-provider';
import { deviceTimezone, submitOnboarding } from '@/lib/backend';
import { birthDateFromParts, detailsError, INTERESTS, onboardingPayload, SelectedPlace } from '@/lib/onboarding';
import { entry } from '@/theme/entry';
import { entryAssets } from '@/theme/entry-assets';

const interestArt = [
  { icon: entryAssets.interests.imgContainer8, tint: '#ffe6db' },
  { icon: entryAssets.interests.imgContainer2, tint: '#fef7da' },
  { icon: entryAssets.interests.imgContainer3, tint: '#ffe6db' },
  { icon: entryAssets.interests.imgContainer5, tint: '#e5f7ed' },
  { icon: entryAssets.interests.imgContainer6, tint: '#f1ecfc' },
  { icon: entryAssets.interests.imgContainer7, tint: '#fcebe4' },
];
type Step = 'location' | 'details' | 'interests' | 'complete';

export function OnboardingPersonalizeScreen() {
  const { profile, reload } = useProfile();
  const [step, setStep] = useState<Step>('location');
  const [place, setPlace] = useState<SelectedPlace | null>(null);
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [year, setYear] = useState(profile?.date_of_birth?.slice(0, 4) ?? '');
  const [month, setMonth] = useState(profile?.date_of_birth?.slice(5, 7) ?? '');
  const [day, setDay] = useState(profile?.date_of_birth?.slice(8, 10) ?? '');
  const [interests, setInterests] = useState<string[]>(INTERESTS.filter(option => option.categories.some(category => profile?.interests.includes(category))).map(option => option.id));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitOnboarding>> | null>(null);
  const goBack = useCallback(() => {
    if (busy || step === 'complete') return;
    setError('');
    if (step === 'location') router.replace('/(onboarding)/welcome');
    else setStep(step === 'details' ? 'location' : 'details');
  }, [busy, step]);
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { goBack(); return true; });
    return () => subscription.remove();
  }, [goBack]));
  function advanceDetails() {
    const validation = detailsError(firstName, lastName, birthDateFromParts(day, month, year));
    setError(validation);
    if (!validation) setStep('interests');
  }
  async function submit() {
    if (submitting.current || !place) return;
    submitting.current = true; setBusy(true); setError('');
    try {
      const response = await submitOnboarding(onboardingPayload(firstName, lastName, birthDateFromParts(day, month, year), place, interests, deviceTimezone()));
      setResult(response);
      setStep('complete');
      // Refresh only when the user leaves the completion screen, so ProfileGate
      // does not redirect away before they can see the successful result.
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save your preferences. Please try again.'); }
    finally { submitting.current = false; setBusy(false); }
  }
  async function finish() {
    if (submitting.current) return;
    submitting.current = true; setBusy(true);
    await reload();
    router.replace('/');
  }
  const locationName = place?.name || 'Your current location';
  const arrow = <EntryIcon source={entryAssets.intro.imgContainer3} size={14} />;

  if (step === 'complete' && result && place) return <FormPage key="complete" variant="entry" flush>
    <View style={styles.completionMap}>
      {place.latitude > -20.35 && place.latitude < -20.05 && place.longitude > 57.35 && place.longitude < 57.65
        ? <Image source={entryAssets.completion.imgBaseMapUnderlayGoogleStaticMapTarget} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
        : <LinearGradient colors={['#c6dff3', '#e8e5f5', '#fcf9f3']} style={StyleSheet.absoluteFill}><View style={styles.mapCenter}><View style={styles.mapHalo}><View style={styles.mapPin} /></View><Text style={styles.mapName}>{result.city_name}</Text></View></LinearGradient>}
      <LinearGradient colors={['rgba(252,249,243,0.1)', 'rgba(252,249,243,0.45)', entry.colors.paper]} locations={[0, 0.7, 1]} style={StyleSheet.absoluteFill} />
    </View>
    <View style={styles.completionBody}>
      <View style={styles.inline}><EntryIcon source={entryAssets.completion.imgContainer} size={20} /><Text style={ui.eyebrow}>Threshold crossed</Text></View>
      <EntryHeading title="Your map is waiting." subtitle="“Every place you discover makes it a little more yours.”" />
      <LinearGradient colors={['#fffcf6', '#fff3eb']} style={styles.readyCard}>
        <View style={styles.readyBadge}><EntryIcon source={entryAssets.completion.imgContainer2} size={24} /></View>
        <View style={{ flex: 1, gap: 4 }}><Text style={[ui.label, { color: '#855300' }]}>{result.city_name}</Text><Text style={ui.body}>{result.city_status === 'ready' ? 'Your city is ready to explore.' : result.city_status === 'failed' ? 'Your location is saved. You can retry city discovery from your home screen.' : 'Your city is taking shape. Your first discoveries are on their way.'}</Text></View>
      </LinearGradient>
      <PrimaryButton variant="entryGradient" label="See what’s out there" loading={busy} onPress={finish} icon={<EntryIcon source={entryAssets.completion.imgContainer1} size={18} />} />
    </View>
  </FormPage>;

  return <FormPage key={step} variant="entry" contentStyle={{ gap: 28 }}>
    <EntryBack onPress={goBack} />
    {step === 'location' && <>
      <EntryHeading title={'Where are you\nexploring?'} subtitle="This becomes the city you slowly uncover." />
      <PlacePicker initialPlace={place} onSelect={setPlace} />
      <View style={[ui.card, { marginTop: 4 }]}>
        <Text style={ui.eyebrow}>{place ? 'Selected terroir' : 'Your next chapter'}</Text>
        <Text style={styles.placeName}>{place ? locationName + (place.country ? ',\n' + place.country : '') : 'Every city starts\nwith a little curiosity.'}</Text>
        <LinearGradient colors={['#dfe8f8', '#eee5f4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.locationMap}>
          <View style={[styles.mapHalo, !place && { opacity: 0.3 }]}><View style={styles.mapPin}><View style={styles.pinCenter} /></View></View>
        </LinearGradient>
        <View style={styles.inline}><EntryIcon source={entryAssets.location.imgContainer3} size={18} /><Text style={[ui.subtitle, { flex: 1, fontSize: 18 }]}>{place ? 'This is your map to uncover.' : 'Find the place you’ll make your own.'}</Text></View>
      </View>
      <PrimaryButton variant="entry" label="Begin uncovering" disabled={!place} onPress={() => { setError(''); setStep('details'); }} icon={arrow} />
    </>}
    {step === 'details' && <>
      <EntryHeading title="A little about you." subtitle="This helps us shape the experience around you." />
      <View style={styles.detailsFields}>
        <View style={styles.nameField}><Text style={styles.detailLabel}>First name</Text><View style={styles.inline}><TextInput accessibilityLabel="First name" autoComplete="given-name" placeholder="e.g. Julian" placeholderTextColor={entry.colors.placeholder} value={firstName} onChangeText={setFirstName} style={styles.nameInput} /><EntryIcon source={entryAssets.details.imgMargin} size={16} /></View></View>
        <View style={styles.nameField}><Text style={styles.detailLabel}>Last name</Text><View style={styles.inline}><TextInput accessibilityLabel="Last name" autoComplete="family-name" placeholder="e.g. Vane" placeholderTextColor={entry.colors.placeholder} value={lastName} onChangeText={setLastName} style={styles.nameInput} /><EntryIcon source={entryAssets.details.imgMargin1} size={16} /></View></View>
        <View style={{ gap: 16 }}><Text style={styles.detailLabel}>Date of birth</Text>
          <View style={styles.dateRow}>
            {([{ label: 'Day', value: day, set: setDay, placeholder: '14', length: 2 }, { label: 'Month', value: month, set: setMonth, placeholder: '10', length: 2 }, { label: 'Year', value: year, set: setYear, placeholder: '1994', length: 4 }]).map(part => <View key={part.label} style={styles.dateField}>
              <Text style={ui.eyebrow}>{part.label}</Text><TextInput accessibilityLabel={'Birth ' + part.label.toLowerCase()} keyboardType="number-pad" maxLength={part.length} placeholder={part.placeholder} placeholderTextColor={entry.colors.placeholder} value={part.value} onChangeText={value => part.set(value.replace(/\D/g, ''))} style={styles.dateInput} />
            </View>)}
          </View>
        </View>
      </View>
      <EntryMessage error>{error}</EntryMessage>
      <View style={{ marginTop: 28 }}><PrimaryButton variant="entry" label="Continue" onPress={advanceDetails} icon={arrow} /></View>
    </>}
    {step === 'interests' && <>
      <View style={{ gap: 12 }}><EntryHeading title="What pulls you outside?" /><Text style={ui.body}>We’ll use this to shape the kinds of places, hushed corners, and curator prompts you discover.</Text></View>
      <View style={styles.lenses}>
        <View style={styles.lensIcon}><EntryIcon source={entryAssets.interests.imgContainer1} size={20} /></View>
        <View style={{ flex: 1, gap: 4 }}><Text style={styles.lensTitle}>Curiosity Lenses</Text><Text accessibilityLiveRegion="polite" style={styles.lensSubtitle}>{interests.length} of {INTERESTS.length} perspectives calibrated</Text></View>
        <View style={styles.counter}><Text style={styles.counterText}>{interests.length} / {INTERESTS.length}</Text></View>
      </View>
      <View style={styles.tiles}>{INTERESTS.map((option, index) => {
        const selected = interests.includes(option.id);
        return <Pressable key={option.id} accessibilityRole="checkbox" accessibilityLabel={option.title} accessibilityState={{ checked: selected, disabled: busy }} disabled={busy} onPress={() => setInterests(prev => selected ? prev.filter(id => id !== option.id) : [...prev, option.id])} style={({ pressed }) => [styles.tile, selected && styles.selectedTile, pressed && ui.pressed]}>
          <View style={[styles.tileIcon, { backgroundColor: interestArt[index].tint }]}><EntryIcon source={interestArt[index].icon} size={18} /></View>
          {selected && <View style={styles.check}><EntryIcon source={entryAssets.interests.imgContainer4} size={10} /></View>}
          <Text style={styles.tileTitle}>{option.title}</Text><Text style={styles.tileDescription}>{option.description}</Text>
        </Pressable>;
      })}</View>
      <EntryMessage error>{error}</EntryMessage>
      <PrimaryButton variant="entry" label="Shape my adventures" loading={busy} onPress={submit} icon={<EntryIcon source={entryAssets.interests.imgContainer9} size={12} />} />
      <Text style={styles.footnote}>Choose as many as you like, or start with an open mind.</Text>
    </>}
  </FormPage>;
}
const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  placeName: { fontFamily: entry.fonts.serif, fontSize: 26, lineHeight: 34, color: entry.colors.ink },
  locationMap: { height: 224, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginVertical: 8 },
  mapHalo: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fac9c4', alignItems: 'center', justifyContent: 'center', shadowColor: entry.colors.coral, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  mapPin: { width: 20, height: 20, borderWidth: 2, borderColor: '#fff', borderRadius: 10, backgroundColor: entry.colors.coral, alignItems: 'center', justifyContent: 'center' },
  pinCenter: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  detailsFields: { marginTop: 20, gap: 38 },
  detailLabel: { ...ui.eyebrow, color: entry.colors.subtle },
  nameField: { gap: 6, borderBottomWidth: 1, borderBottomColor: '#e5e2dc' },
  nameInput: { flex: 1, minWidth: 0, fontFamily: entry.fonts.italic, fontSize: 22, color: entry.colors.ink, paddingVertical: 8 },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateField: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: '#eee9df', backgroundColor: '#fdfbf7', borderRadius: 12, padding: 12, gap: 6 },
  dateInput: { fontFamily: entry.fonts.serif, fontSize: 22, color: entry.colors.ink, padding: 0 },
  lenses: { ...ui.card, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  lensIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff0d4', alignItems: 'center', justifyContent: 'center' },
  lensTitle: { fontFamily: entry.fonts.serif, fontSize: 22, color: entry.colors.ink },
  lensSubtitle: { fontFamily: entry.fonts.italic, fontSize: 13, color: entry.colors.subtle },
  counter: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#e0f2fe' },
  counterText: { fontFamily: entry.fonts.bold, fontSize: 10, color: '#0284c7' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '47%', flexGrow: 1, padding: 16, minHeight: 186, borderWidth: 1, borderColor: '#f0eee6', borderRadius: 12, backgroundColor: '#fff', gap: 8 },
  selectedTile: { backgroundColor: '#fff4ed', borderColor: entry.colors.coral, shadowColor: entry.colors.coral, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  tileIcon: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  check: { position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: 12, backgroundColor: entry.colors.coral, alignItems: 'center', justifyContent: 'center' },
  tileTitle: { fontFamily: entry.fonts.serif, fontSize: 22, lineHeight: 28, color: entry.colors.ink },
  tileDescription: { fontFamily: entry.fonts.italic, fontSize: 14, lineHeight: 20, color: entry.colors.muted },
  footnote: { fontFamily: entry.fonts.serif, fontSize: 14, lineHeight: 20, textAlign: 'center', color: entry.colors.muted },
  completionMap: { height: 386, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: 'hidden' },
  mapCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  mapName: { fontFamily: entry.fonts.serif, fontSize: 26, color: entry.colors.muted },
  completionBody: { padding: 20, gap: 24 },
  readyCard: { borderWidth: 1, borderColor: '#fed7aa', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  readyBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffd4b6', alignItems: 'center', justifyContent: 'center' },
});
