import { Redirect } from 'expo-router';
import { ProfileGate } from '@/components/ProfileGate';
export default function Index() {
  return <ProfileGate><Redirect href="/(app)" /></ProfileGate>;
}
