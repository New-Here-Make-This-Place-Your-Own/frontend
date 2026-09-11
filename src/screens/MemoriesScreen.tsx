import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Image, Linking, Text, View } from 'react-native';
import { FormPage } from '@/components/FormPage';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { GhostMap } from '@/components/GhostMap';
import { getGhostNotes, getMemories, GhostNote, Memory } from '@/lib/backend';
import { supabase } from '@/lib/supabase';

type DisplayMemory = Memory & { photoUrl?: string };
export function MemoriesScreen({ shared = false }: { shared?: boolean }) {
  const [items, setItems] = useState<(GhostNote | DisplayMemory)[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [selected, setSelected] = useState<GhostNote | null>(null);
  const revision = useRef(0);
  const load = useCallback(async (offset = 0) => {
    const request = ++revision.current;
    setLoading(true); setError('');
    try {
      let rows: (GhostNote | DisplayMemory)[];
      if (shared) rows = (await getGhostNotes(offset)).notes;
      else rows = await Promise.all((await getMemories(offset)).memories.map(async memory => {
        const { data } = await supabase.storage.from('quest-photos').createSignedUrl(memory.photo_path, 3600);
        return { ...memory, photoUrl: data?.signedUrl };
      }));
      if (request !== revision.current) return;
      setItems(previous => offset ? [...previous, ...rows.filter(r => !previous.some(p => p.id === r.id))] : rows);
      setMore(rows.length === (shared ? 100 : 50));
    } catch (err) { if (request === revision.current) setError(err instanceof Error ? err.message : 'Unable to load memories.'); }
    finally { if (request === revision.current) setLoading(false); }
  }, [shared]);
  useFocusEffect(useCallback(() => { void load(); return () => { revision.current++; }; }, [load]));
  return <FormPage><View style={{ gap: 20 }}>
    <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{shared ? 'Ghost notes' : 'Your library'}</Text>
    <Text>{shared ? 'Anonymous moments left by fellow explorers.' : 'All your memories, including the notes you chose to share.'}</Text>
    {shared && <GhostMap key={selected?.id || 'all'} notes={selected ? [selected] : items} />}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    <PrimaryButton label="Refresh" onPress={() => { setSelected(null); void load(); }} disabled={loading} loading={loading} />
    {!loading && !error && !items.length && <Text>{shared ? 'No ghost notes yet.' : 'Complete a quest to save your first memory.'}</Text>}
    {items.map(item => <Card key={item.id}>
      <Text>{shared ? 'Anonymous explorer' : ('is_ghost' in item && item.is_ghost ? 'Shared ghost note' : 'Private memory')}</Text>
      {'photoUrl' in item && item.photoUrl && <Image source={{ uri: item.photoUrl }} style={{ height: 200, width: '100%', borderRadius: 12 }} />}
      <Text>{item.caption || 'A moment of exploration'}</Text>
      <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
      {shared && <PrimaryButton label="Show pin" onPress={() => setSelected(item)} />}
      <PrimaryButton label="Open location" onPress={() => { void Linking.openURL(`https://www.openstreetmap.org/?mlat=${item.latitude}&mlon=${item.longitude}#map=16/${item.latitude}/${item.longitude}`); }} />
    </Card>)}
    {more && <PrimaryButton label="Load more" disabled={loading} onPress={() => void load(items.length)} />}
  </View></FormPage>;
}
