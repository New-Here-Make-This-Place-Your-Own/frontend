import { Stack } from 'expo-router';
import { ProfileGate } from '@/components/ProfileGate';
export default function OnboardingLayout() {
  return <ProfileGate onboarding><Stack screenOptions={{ headerShown: false }} /></ProfileGate>;
}
