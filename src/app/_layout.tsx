import { ProfileProvider } from '@/providers/profile-provider';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from '@expo-google-fonts/outfit';
import { Lora_400Regular, Lora_400Regular_Italic } from '@expo-google-fonts/lora';
import { AuthProvider } from '../providers/auth-provider';
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold, Lora_400Regular, Lora_400Regular_Italic,
    Newsreader_400Regular: require('../../assets/fonts/Newsreader_400Regular.ttf'),
    Newsreader_400Regular_Italic: require('../../assets/fonts/Newsreader_400Regular_Italic.ttf'),
    PlusJakartaSans_400Regular: require('../../assets/fonts/PlusJakartaSans_400Regular.ttf'),
    PlusJakartaSans_600SemiBold: require('../../assets/fonts/PlusJakartaSans_600SemiBold.ttf'),
    PlusJakartaSans_700Bold: require('../../assets/fonts/PlusJakartaSans_700Bold.ttf'),
  });
  useEffect(() => { if (loaded || error) void SplashScreen.hideAsync(); }, [loaded, error]);
  if (!loaded && !error) return null;
  return <AuthProvider><ProfileProvider><Stack screenOptions={{ headerShown: false }} /></ProfileProvider></AuthProvider>;
}
