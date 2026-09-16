import { FormPage } from '../components/FormPage';
import { useProfile } from '../providers/profile-provider';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { CompleteQuestModal } from '../components/CompleteQuestModal';
import { City, CompletionTarget, CuratorResponse, DailyQuest, getCity, getCuratorQuest, getDailyQuests, retryCityDiscovery } from '../lib/backend';
import { ActivityIndicator, AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TreePalm, Sun, Clock, RefreshCw, Sparkles } from 'lucide-react-native';

import { Card } from '../components/Card';
import { borders, colors, fonts, radii, spacing } from '../theme/tokens';
// Category -> icon/gradient, since the backend returns arbitrary category
// strings but the design has two fixed visual treatments (mint "anchor",
// coral "vibe"). Extend this as more categories get real card treatments.
const CARD_STYLE_BY_SLOT: Record<number, { gradient: readonly [string, string]; icon: typeof TreePalm; badge: string }> = {
  0: { gradient: colors.gradientMint, icon: TreePalm, badge: 'Anchor Quest' },
  1: { gradient: colors.gradientCoral, icon: Sun, badge: 'Sensory Vibe' },
};

function timeUntil(expiresAt: string, now: number): string {
  const diffMs = new Date(expiresAt).getTime() - now;
  if (diffMs <= 0) return 'Expired';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function DailyHomeScreen() {
  const { profile } = useProfile();
  const cityId = profile?.city_id;
  const [quests, setQuests] = useState<DailyQuest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [curator, setCurator] = useState<CuratorResponse | null>(null);
  const [curatorError, setCuratorError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [city, setCity] = useState<City | null>(null);
  const [target, setTarget] = useState<CompletionTarget | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const revision = useRef(0);
  const lastPoll = useRef(now);
  const inFlight = useRef(false);
  const focused = useRef(false);

  const fetchQuests = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    const request = revision.current;
    setError(null); setCuratorError('');
    await Promise.all([
      getDailyQuests().then(data => { if (request === revision.current) setQuests(data.quests); })
        .catch(err => { if (request === revision.current) setError(err instanceof Error ? err.message : 'Unable to load quests.'); }),
      getCuratorQuest().then(data => { if (request === revision.current) setCurator(data); })
        .catch(err => { if (request === revision.current) setCuratorError(err instanceof Error ? err.message : 'Unable to load curator quest.'); }),
      cityId ? getCity(cityId).then(data => { if (request === revision.current) setCity(data); })
        .catch(() => { if (request === revision.current) setCity(null); }) : Promise.resolve(),
    ]);
    if (request === revision.current) inFlight.current = false;
  }, [cityId]);

  async function retryDiscovery() {
    if (!cityId || retrying) return;
    setRetrying(true); setCuratorError('');
    try {
      const updated = await retryCityDiscovery(cityId);
      revision.current++; inFlight.current = false;
      setCity(updated);
      await fetchQuests();
    } catch (err) { setCuratorError(err instanceof Error ? err.message : 'Unable to retry discovery.'); }
    finally { setRetrying(false); }
  }

  useFocusEffect(useCallback(() => {
    focused.current = true;
    void fetchQuests();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') void fetchQuests(); });
    return () => { focused.current = false; revision.current++; inFlight.current = false; subscription.remove(); };
  }, [fetchQuests]));
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!focused.current || now <= lastPoll.current) return;
    lastPoll.current = now;
    const dailyExpired = quests?.some(q => new Date(q.expires_at).getTime() <= now);
    const curatorExpired = curator?.quest && new Date(curator.quest.expires_at).getTime() <= now;
    const cooldownEnded = curator?.next_available_at && new Date(curator.next_available_at).getTime() <= now;
    if (dailyExpired || curatorExpired || cooldownEnded || curator?.reason === 'city_not_ready') void fetchQuests();
  }, [now, quests, curator, fetchQuests]);

  return (
    <FormPage>
      {target && <CompleteQuestModal key={target.id} target={target} onClose={() => setTarget(null)} onCompleted={() => { setTarget(null); revision.current++; inFlight.current = false; void fetchQuests(); }} />}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey {profile?.first_name || 'Wanderer'}! 👋</Text>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>New Here</Text>
            <Text style={styles.dot}>·</Text>
            <View style={styles.locationBadge}>
              <Sparkles size={14} color={colors.ink} />
              <Text style={styles.locationText}>{city?.name || 'Your neighborhood'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.avatarRing}>
          <View style={styles.avatar} />
        </View>
      </View>

      <View style={styles.philosophy}>
        <Text style={styles.philosophyLabel}>Today&apos;s Philosophy</Text>
        <Text style={styles.philosophyQuote}>
          The real voyage of discovery consists not in seeking new landscapes, but in having new
          eyes.
        </Text>
      </View>

      {quests && quests[0] && (
        <View style={styles.timer}>
          <View style={styles.timerIcon}>
            <Clock size={18} color={colors.ink} />
          </View>
          <View style={styles.timerText}>
            <Text style={styles.timerLabel}>Next prompts in</Text>
            <Text style={styles.timerValue}>{timeUntil(quests[0].expires_at, now)}</Text>
          </View>
          <TouchableOpacity style={styles.resetChip} onPress={fetchQuests}>
            <RefreshCw size={16} color={colors.ink} />
            <Text style={styles.resetLabel}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.prompts}>
        <Text style={styles.sectionTitle}>Explore Today&apos;s Quests</Text>

        {!quests && !error && <ActivityIndicator style={styles.loader} />}
        {error && <TouchableOpacity onPress={fetchQuests}><Text style={styles.errorText}>{error} Tap to retry.</Text></TouchableOpacity>}

        {quests?.length === 0 && <Text style={styles.cardSubtext}>You have explored every available daily quest. You can still finish quests in Past Quests.</Text>}
        {quests?.map((quest, index) => {
          const style = CARD_STYLE_BY_SLOT[index];
          if (!style) return null; // more than 2 quests isn't designed for yet
          const Icon = style.icon;

          return (
            <Card key={quest.id} gradient={style.gradient}>
              <View style={styles.cardHeader}>
                <View style={styles.badge}>
                  <Text style={styles.badgeLabel}>{style.badge}</Text>
                </View>
                <Icon size={24} color={colors.ink} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{quest.prompt}</Text>
              </View>
              {quest.status !== 'completed' ? (
                <TouchableOpacity style={styles.captureButton} onPress={() => setTarget({ id: quest.id, kind: 'daily', prompt: quest.prompt })}>
                  <Text style={styles.captureLabel}>📍 Capture Moment & Drop Pin</Text>
                </TouchableOpacity>
              ) : <Text style={styles.cardSubtext}>Completed ✓</Text>}
            </Card>
          );
        })}

        <Card>
          <Text style={styles.sectionTitle}>Curator Quest</Text>
          {city?.status === 'failed' && <TouchableOpacity style={styles.captureButton} onPress={retryDiscovery} disabled={retrying}>
            <Text style={styles.captureLabel}>{retrying ? 'Starting discovery…' : 'Retry place discovery'}</Text>
          </TouchableOpacity>}
          {curatorError ? <TouchableOpacity onPress={fetchQuests}><Text style={styles.errorText}>{curatorError} Tap to retry.</Text></TouchableOpacity> : null}
          {!curator && !curatorError && <ActivityIndicator />}
          {curator?.quest ? <>
            <Text style={styles.cardTitle}>{curator.quest.riddle}</Text>
            <Text style={styles.cardSubtext}>Moves to Past Quests in {timeUntil(curator.quest.expires_at, now)}.</Text>
            <TouchableOpacity style={styles.captureButton} onPress={() => setTarget({ id: curator.quest!.id, kind: 'curator', prompt: curator.quest!.riddle })}>
              <Text style={styles.captureLabel}>📍 Capture Moment & Drop Pin</Text>
            </TouchableOpacity>
          </> : curator ? <Text style={styles.cardSubtext}>{
            curator.reason === 'not_yet' ? `Your next curator quest is available ${curator.next_available_at ? new Date(curator.next_available_at).toLocaleString() : 'next week'}.` :
            curator.reason === 'city_not_ready' ? (city?.status === 'failed' ? 'Place discovery failed. Tap below to try again.' : 'Discovering places in your city…') :
            curator.reason === 'no_eligible_places' ? 'No new places with enough clues are available yet.' :
            'Finish setting up your city to receive curator quests.'
          }</Text> : null}
        </Card>
      </View>
    </FormPage>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.xxl,
  },
  greeting: { fontFamily: fonts.outfitExtraBold, fontSize: 28, color: colors.ink },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  brand: { fontFamily: fonts.outfitExtraBold, fontSize: 13, color: colors.ink },
  dot: { fontFamily: fonts.outfitBold, fontSize: 13, color: colors.inkMuted },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.xl,
    backgroundColor: colors.overlayLight,
  },
  locationText: { fontFamily: fonts.outfitBold, fontSize: 13, color: colors.ink },
  avatarRing: {
    borderWidth: borders.standard,
    borderColor: colors.ink,
    borderRadius: radii.pill,
    padding: 3,
  },
  avatar: { width: 44, height: 44, borderRadius: radii.pill, backgroundColor: colors.overlayLight },
  philosophy: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.xs },
  philosophyLabel: { fontFamily: fonts.outfitSemiBold, fontSize: 15, color: colors.inkMuted, textTransform: 'uppercase' },
  philosophyQuote: { fontFamily: fonts.loraItalic, fontSize: 18, lineHeight: 25, color: colors.ink },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.xxl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.overlayLight,
  },
  timerIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: { flex: 1, gap: 2 },
  timerLabel: { fontFamily: fonts.outfitBold, fontSize: 12, color: colors.inkMuted, textTransform: 'uppercase' },
  timerValue: { fontFamily: fonts.outfitExtraBold, fontSize: 16, color: colors.ink },
  resetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  resetLabel: { fontFamily: fonts.outfitExtraBold, fontSize: 12, color: colors.ink },
  prompts: { padding: spacing.xxl, gap: spacing.xl },
  sectionTitle: { fontFamily: fonts.outfitExtraBold, fontSize: 18, color: colors.ink },
  loader: { marginVertical: spacing.xxl },
  errorText: { fontFamily: fonts.outfitRegular, fontSize: 14, color: '#c0392b' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: borders.thin,
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  badgeDark: { backgroundColor: colors.ink, borderColor: colors.ink },
  badgeLabel: { fontFamily: fonts.outfitExtraBold, fontSize: 11, color: colors.ink, textTransform: 'uppercase' },
  badgeLabelLight: { color: colors.white },
  cardBody: { gap: spacing.sm, marginBottom: spacing.lg },
  cardTitle: { fontFamily: fonts.outfitExtraBold, fontSize: 22, lineHeight: 26, color: colors.ink },
  cardSubtext: { fontFamily: fonts.loraItalic, fontSize: 14, color: colors.inkMuted },
  captureButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: borders.standard,
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  captureLabel: { fontFamily: fonts.outfitExtraBold, fontSize: 14, color: colors.ink },
  lockIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    borderWidth: borders.thin,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockButton: {
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.ink,
    alignItems: 'center',
  },
  unlockLabel: { fontFamily: fonts.outfitExtraBold, fontSize: 14, color: colors.white },
});
