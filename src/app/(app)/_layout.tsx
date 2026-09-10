import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import AppTabs from '@/components/app-tabs';
import { ProfileGate } from '@/components/ProfileGate';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  return <ProfileGate><ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}><AppTabs /></ThemeProvider></ProfileGate>;
}
