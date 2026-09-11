import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { apiRequest } from '@/lib/api';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

type PlaceResult = { name: string; country: string; region?: string | null; latitude: number; longitude: number };
export function PlacePicker({ onSelect }: { onSelect: (place: PlaceResult | null) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revision = useRef(0);
  function cancelPending() {
    revision.current++;
    if (debounce.current) clearTimeout(debounce.current);
    setLoading(false); setResults([]);
  }
  useEffect(() => () => { revision.current++; if (debounce.current) clearTimeout(debounce.current); }, []);
  function change(text: string) {
    cancelPending();
    setQuery(text); setSelected(false); setError(''); onSelect(null);
    if (text.trim().length < 2) return;
    const request = revision.current;
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiRequest<{ results: PlaceResult[] }>(`/api/v1/places/search?q=${encodeURIComponent(text.trim())}`);
        if (request !== revision.current) return;
        setResults(data.results);
        if (!data.results.length) setError('No places found. Try a nearby city or town.');
      } catch (err) {
        if (request === revision.current) setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
      } finally { if (request === revision.current) setLoading(false); }
    }, 350);
  }
  async function detect() {
    cancelPending();
    const request = revision.current;
    setDetecting(true); setError(''); setSelected(false); onSelect(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Location access was denied. Search for your city below.');
      const position = await Location.getCurrentPositionAsync({});
      if (request !== revision.current) return;
      onSelect({ name: '', country: '', latitude: position.coords.latitude, longitude: position.coords.longitude });
      setQuery('Current location selected'); setSelected(true);
    } catch (err) {
      if (request === revision.current) setError(err instanceof Error ? err.message : 'Unable to find your location. Search below.');
    } finally { setDetecting(false); }
  }
  return <View style={styles.container}>
    <Text style={styles.label}>Where are you exploring?</Text>
    <TouchableOpacity accessibilityRole="button" style={styles.option} onPress={detect} disabled={detecting}>
      <Text style={styles.label}>{detecting ? 'Detecting your location…' : '📍 Use my current location'}</Text>
    </TouchableOpacity>
    <TextInput accessibilityLabel="Search city, town, or village" style={styles.input} value={query} onChangeText={change} placeholder="Search for a city, town, or village" autoCorrect={false} editable={!detecting} />
    {loading ? <ActivityIndicator /> : null}
    {results.map((item, index) => <TouchableOpacity accessibilityRole="button" style={styles.option} key={`${item.name}-${item.country}-${index}`} onPress={() => {
      cancelPending(); setQuery([item.name, item.region, item.country].filter(Boolean).join(", ")); setSelected(true); setError(''); onSelect(item);
    }}><Text style={styles.label}>{[item.name, item.region, item.country].filter(Boolean).join(", ")}</Text></TouchableOpacity>)}
    {selected ? <Text accessibilityLiveRegion="polite" style={styles.label}>✓ Location selected</Text> : null}
    {error ? <Text accessibilityRole="alert" style={styles.label}>{error}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: { fontFamily: fonts.outfitRegular, color: colors.ink, fontSize: 14 },
  input: { borderWidth: 2, borderColor: colors.ink, borderRadius: radii.md, padding: spacing.lg, backgroundColor: colors.white, color: colors.ink, fontSize: 14 },
  option: { padding: spacing.md, borderRadius: radii.sm, backgroundColor: colors.overlayLight },
});
