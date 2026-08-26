import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TreePalm, Sun, Lock, Clock, RefreshCw, Sparkles } from 'lucide-react-native';

import { Card } from '../components/Card';
import { borders, colors, fonts, radii, spacing } from '../theme/tokens';
import { supabase } from '../lib/supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

type Quest = {
  id: string;
  prompt: string;
  category: string;
  status: string;
  expires_at: string;
};

// Category -> icon/gradient, since the backend returns arbitrary category
// strings but the design has two fixed visual treatments (mint "anchor",
// coral "vibe"). Extend this as more categories get real card treatments.
const CARD_STYLE_BY_SLOT: Record<number, { gradient: readonly [string, string]; icon: typeof TreePalm; badge: string }> = {
  0: { gradient: colors.gradientMint, icon: TreePalm, badge: 'Anchor Quest' },
  1: { gradient: colors.gradientCoral, icon: Sun, badge: 'Sensory Vibe' },
};

function timeUntil(expiresAt: string): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Expired';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function DailyHomeScreen() {
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuests();
  }, []);

  async function fetchQuests() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${API_BASE_URL}/api/v1/quests/daily`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (!response.ok) throw new Error('Failed to load today\'s quests.');

      const data = await response.json();
      setQuests(data.quests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey Wanderer! 👋</Text>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>New Here</Text>
            <Text style={styles.dot}>·</Text>
            <View style={styles.locationBadge}>
              <Sparkles size={14} color={colors.ink} />
              <Text style={styles.locationText}>Port Louis</Text>
            </View>
          </View>
        </View>
        <View style={styles.avatarRing}>
          <View style={styles.avatar} />
        </View>
      </View>

      <View style={styles.philosophy}>
        <Text style={styles.philosophyLabel}>Today's Philosophy</Text>
        <Text style={styles.philosophyQuote}>
          "The real voyage of discovery consists not in seeking new landscapes, but in having new
          eyes."
        </Text>
      </View>

      {quests && quests[0] && (
        <View style={styles.timer}>
          <View style={styles.timerIcon}>
            <Clock size={18} color={colors.ink} />
          </View>
          <View style={styles.timerText}>
            <Text style={styles.timerLabel}>Next prompts in</Text>
            <Text style={styles.timerValue}>{timeUntil(quests[0].expires_at)}</Text>
          </View>
          <TouchableOpacity style={styles.resetChip} onPress={fetchQuests}>
            <RefreshCw size={16} color={colors.ink} />
            <Text style={styles.resetLabel}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.prompts}>
        <Text style={styles.sectionTitle}>Explore Today's Quests</Text>

        {!quests && !error && <ActivityIndicator style={styles.loader} />}
        {error && <Text style={styles.errorText}>{error}</Text>}

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
              {index === 0 && (
                <TouchableOpacity style={styles.captureButton}>
                  <Text style={styles.captureLabel}>📍 Capture Moment & Drop Pin</Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        })}

        {/* Curator quest — locked state; wire up to GET /quests/curator once
            that endpoint exists (next backend slice). */}
        <Card>
          <View style={styles.cardHeader}>
            <View style={[styles.badge, styles.badgeDark]}>
              <Text style={[styles.badgeLabel, styles.badgeLabelLight]}>Curator Pro</Text>
            </View>
            <View style={styles.lockIcon}>
              <Lock size={18} color={colors.ink} />
            </View>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Pro Quest: A hidden architectural detail built before 1950...</Text>
            <Text style={styles.cardSubtext}>Unlock to reveal the location and curator notes.</Text>
          </View>
          <TouchableOpacity style={styles.unlockButton}>
            <Text style={styles.unlockLabel}>✨ Tap to Unlock Curator Quests</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </SafeAreaView>
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
