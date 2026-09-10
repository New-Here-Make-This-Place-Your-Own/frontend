import { useLocalSearchParams } from 'expo-router';
import { EmailActionScreen } from '@/screens/EmailActionScreen';
export default function VerifyEmail() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  return <EmailActionScreen initialEmail={typeof email === 'string' ? email : ''} />;
}
