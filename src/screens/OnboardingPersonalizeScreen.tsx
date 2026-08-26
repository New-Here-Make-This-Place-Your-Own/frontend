import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { PrimaryButton } from '../components/PrimaryButton';
import { PlacePicker } from '../components/PlacePicker'; // see PlacePicker.tsx from the earlier typeahead work
import { colors, fonts, radii, spacing, borders } from '../theme/tokens';
import { supabase } from '../lib/supabase';

const INTEREST_OPTIONS = [
  { label: 'Architecture 🏰', slug: 'architecture', category: 'architecture' },
  { label: 'Street Art 🎨', slug: 'street_art', category: 'art' },
  { label: 'Hidden Cafés ☕', slug: 'cafes', category: 'food' },
  { label: 'Nature Spots 🌿', slug: 'nature', category: 'nature' },
  { label: 'History 📜', slug: 'history', category: 'history' },
  { label: 'Photography 📷', slug: 'photography', category: 'sensory' },
  { label: 'Local Food 🍜', slug: 'local_food', category: 'food' },
  { label: 'Markets 🛍️', slug: 'markets', category: 'culture' },
];

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

type SelectedPlace = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

export function OnboardingPersonalizeScreen() {
  const router = useRouter();

  // NOTE: this screen's Figma design only covers interests. Name, DOB, and
  // place are required by the onboarding API but weren't in the mock —
  // added here at the top, styled to match, rather than inventing a new
  // screen outside the existing flow.
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // expects YYYY-MM-DD; swap for a real date picker when available
  const [place, setPlace] = useState<SelectedPlace | null>(null);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const canSubmit =
    firstName.trim() && lastName.trim() && dateOfBirth.trim() && place && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || !place) return;

    setSubmitting(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const isGpsOnly = !place.name; // PlacePicker signals GPS-only with an empty name

      // Multiple UI tags can map to the same backend category (e.g. Hidden
      // Cafés + Local Food both -> 'food') — dedupe before sending.
      const categories = [
        ...new Set(
          INTEREST_OPTIONS.filter((o) => selectedSlugs.includes(o.slug)).map((o) => o.category)
        ),
      ];

      const response = await fetch(`${API_BASE_URL}/api/v1/users/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          date_of_birth: dateOfBirth.trim(),
          latitude: place.latitude,
          longitude: place.longitude,
          ...(isGpsOnly ? {} : { place_name: place.name, place_country: place.country }),
          interests: categories,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail ?? 'Something went wrong finishing onboarding.');
      }

      router.replace('/(app)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>Preferences</Text>

        <View style={styles.headlineBlock}>
          <Text style={styles.headline}>What makes you wander?</Text>
          <Text style={styles.subhead}>
            Tell us a bit about you and where you're exploring, so we can curate your daily paths
            & quests.
          </Text>
        </View>

        <View style={styles.profileFields}>
          <View style={styles.nameRow}>
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="First name"
              placeholderTextColor={colors.inkMuted}
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="Last name"
              placeholderTextColor={colors.inkMuted}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Date of birth (YYYY-MM-DD)"
            placeholderTextColor={colors.inkMuted}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
          />
          <PlacePicker onSelect={setPlace} />
        </View>

        <View style={styles.tagsWrapper}>
          {INTEREST_OPTIONS.map((option) => (
            <Chip
              key={option.slug}
              label={option.label}
              selected={selectedSlugs.includes(option.slug)}
              onPress={() => toggleInterest(option.slug)}
            />
          ))}
        </View>

        <Card gradient={colors.gradientPeriwinkle} padding={16}>
          <Text style={styles.tipTitle}>💡 Explorer Tip</Text>
          <Text style={styles.tipBody}>
            "You can always change your settings later. Exploring is about surprising your
            senses!"
          </Text>
        </Card>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={submitting ? 'Setting things up…' : 'Start Exploring 🗺️'}
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={submitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between' },
  body: { padding: spacing.xxl, gap: spacing.xxl },
  eyebrow: { fontFamily: fonts.outfitExtraBold, fontSize: 13, color: colors.inkMuted, textTransform: 'uppercase' },
  headlineBlock: { gap: spacing.sm },
  headline: { fontFamily: fonts.outfitExtraBold, fontSize: 28, color: colors.ink },
  subhead: { fontFamily: fonts.loraItalic, fontSize: 15, color: colors.inkMuted },
  profileFields: { gap: spacing.md },
  nameRow: { flexDirection: 'row', gap: spacing.md },
  nameInput: { flex: 1 },
  input: {
    borderWidth: borders.standard,
    borderColor: colors.ink,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontFamily: fonts.outfitRegular,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  tagsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tipTitle: { fontFamily: fonts.outfitExtraBold, fontSize: 14, color: colors.ink, marginBottom: spacing.xs },
  tipBody: { fontFamily: fonts.loraItalic, fontSize: 13, color: colors.inkMuted },
  errorText: { fontFamily: fonts.outfitRegular, fontSize: 13, color: '#c0392b' },
  footer: { padding: spacing.xxl },
});
