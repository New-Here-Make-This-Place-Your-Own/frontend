import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';

import { supabase } from '../lib/supabase';

type PlaceResult = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

type Props = {
  onSelect: (place: PlaceResult) => void;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
const DEBOUNCE_MS = 350;

export function PlacePicker({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const search = useCallback(async (text: string) => {
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    const thisRequestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `${API_BASE_URL}/api/v1/places/search?q=${encodeURIComponent(text)}`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );
      const data = await response.json();

      // Ignore stale responses — a slower earlier request finishing after
      // a faster later one would otherwise flash outdated results.
      if (thisRequestId === requestIdRef.current) {
        setResults(data.results ?? []);
      }
    } catch (error) {
      console.error('Place search failed:', error);
    } finally {
      if (thisRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => search(text), DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleAutoDetect = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Fall back silently to manual search — don't block onboarding
        // on a denied permission.
        return;
      }

      const position = await Location.getCurrentPositionAsync({});

      // We don't reverse-geocode client-side — send raw coordinates and
      // let the backend resolve the display name. Keeps geocoding logic
      // in one place.
      onSelect({
        name: '', // signals to the caller: GPS-only, no name resolved yet
        country: '',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (error) {
      console.error('Location detection failed:', error);
    } finally {
      setDetecting(false);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handleAutoDetect} disabled={detecting}>
        <Text>{detecting ? 'Detecting your location…' : '📍 Use my current location'}</Text>
      </TouchableOpacity>

      <TextInput
        value={query}
        onChangeText={handleChangeText}
        placeholder="Or search for a city, town, or village"
        autoCorrect={false}
      />

      {loading && <ActivityIndicator />}

      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.name}-${item.country}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setQuery(`${item.name}, ${item.country}`);
              setResults([]);
              onSelect(item);
            }}
          >
            <Text>{item.name}, {item.country}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
