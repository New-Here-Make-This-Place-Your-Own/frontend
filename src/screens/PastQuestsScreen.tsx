import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { FormPage } from '@/components/FormPage';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CompleteQuestModal } from '@/components/CompleteQuestModal';
import { CompletionTarget, getPastQuests, PastQuest } from '@/lib/backend';

export function PastQuestsScreen() {
  const [quests, setQuests] = useState<PastQuest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [more, setMore] = useState(false);
  const [target, setTarget] = useState<CompletionTarget | null>(null);
  const revision = useRef(0);
  const load = useCallback(async (offset = 0) => {
    const request = ++revision.current;
    setLoading(true); setError('');
    try {
      const data = await getPastQuests(offset);
      if (request !== revision.current) return;
      setQuests(previous => offset ? [...previous, ...data.quests.filter(q => !previous.some(p => p.id === q.id))] : data.quests);
      setMore(data.quests.length === 50);
    } catch (err) { if (request === revision.current) setError(err instanceof Error ? err.message : 'Unable to load past quests.'); }
    finally { if (request === revision.current) setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); return () => { revision.current++; }; }, [load]));
  return <FormPage>
    <View style={{ gap: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold' }}>Past Quests</Text>
      <Text>Missed a day? Your unfinished quests can still become memories.</Text>
      {loading && <ActivityIndicator />}
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
      <PrimaryButton label="Refresh" onPress={() => void load()} disabled={loading} />
      {!loading && !error && !quests.length && <Text>No past quests yet.</Text>}
      {quests.map(quest => <Card key={quest.id}>
        <Text>{quest.kind === 'curator' ? 'Curator' : 'Daily'} · {new Date(quest.issued_at).toLocaleDateString()}</Text>
        <Text style={{ fontSize: 20, marginVertical: 12 }}>{quest.prompt}</Text>
        {quest.status === 'completed' ? <Text>Completed ✓</Text> : <PrimaryButton label="Capture Moment & Drop Pin" onPress={() => setTarget(quest)} />}
      </Card>)}
      {more && <PrimaryButton label="Load more" onPress={() => void load(quests.length)} disabled={loading} />}
    </View>
    {target && <CompleteQuestModal key={target.id} target={target} onClose={() => setTarget(null)} onCompleted={() => { setTarget(null); void load(); }} />}
  </FormPage>;
}
