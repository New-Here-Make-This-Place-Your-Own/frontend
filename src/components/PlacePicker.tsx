import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { apiRequest } from '@/lib/api';
import { entry } from '@/theme/entry';
import { entryAssets } from '@/theme/entry-assets';
import { EntryIcon, ui } from './EntryUI';

type PlaceResult = { name: string; country: string; region?: string | null; latitude: number; longitude: number };
export function PlacePicker({ onSelect, initialPlace }: { onSelect: (place: PlaceResult | null) => void; initialPlace?: PlaceResult | null }) {
  const [query, setQuery] = useState(initialPlace ? [initialPlace.name, initialPlace.country].filter(Boolean).join(', ') || 'Current location selected' : '');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(Boolean(initialPlace));
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
    <View style={styles.search}>
      <EntryIcon source={entryAssets.location.imgMargin} size={18} />
      <TextInput accessibilityLabel="Search city, town, or village" style={styles.input} value={query} onChangeText={change} placeholder="Search for your city" placeholderTextColor={entry.colors.subtle} autoCorrect={false} editable={!detecting} />
      {query && !detecting ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear location" onPress={() => change('')} hitSlop={12}><Text style={styles.clear}>×</Text></TouchableOpacity> : null}
    </View>
    {loading ? <ActivityIndicator color={entry.colors.coral} /> : null}
    {results.map((item, index) => <TouchableOpacity accessibilityRole="button" style={styles.option} key={`${item.name}-${item.country}-${index}`} onPress={() => {
      cancelPending(); setQuery([item.name, item.region, item.country].filter(Boolean).join(", ")); setSelected(true); setError(''); onSelect(item);
    }}><Text style={styles.label}>{[item.name, item.region, item.country].filter(Boolean).join(", ")}</Text></TouchableOpacity>)}
    <TouchableOpacity accessibilityRole="button" style={styles.detect} onPress={detect} disabled={detecting}>
      {detecting ? <ActivityIndicator size="small" color={entry.colors.coral} /> : <EntryIcon source={entryAssets.location.imgContainer1} size={18} />}
      <Text style={styles.detectText}>{detecting ? 'Finding your coordinates…' : 'Use my current\ncoordinates'}</Text>
    </TouchableOpacity>
    {selected ? <Text accessibilityLiveRegion="polite" style={styles.status}>Location selected</Text> : null}
    {error ? <Text accessibilityRole="alert" style={ui.error}>{error}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: 12 },
  label: { ...ui.body, fontSize: 14 },
  search: { flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 54, backgroundColor: '#fff', borderRadius: 999, borderWidth: 1, borderColor: '#ede0cf', paddingHorizontal: 16 },
  input: { flex: 1, minWidth: 0, fontFamily: entry.fonts.sans, fontSize: 14, color: entry.colors.ink, paddingVertical: 14 },
  clear: { fontSize: 22, color: entry.colors.subtle },
  option: { padding: 12, borderRadius: 12, backgroundColor: entry.colors.card, borderWidth: 1, borderColor: entry.colors.line },
  detect: { alignSelf: 'center', flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center', minHeight: 46, minWidth: 212, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#ede0cf', backgroundColor: '#fff' },
  detectText: { fontFamily: entry.fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textAlign: 'center', color: entry.colors.muted },
  status: { fontFamily: entry.fonts.sans, fontSize: 11, color: entry.colors.subtle, textAlign: 'center' },
});
