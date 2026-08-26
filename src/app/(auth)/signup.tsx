import { useState } from 'react';
import {
  Alert,
  Button,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';

import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Unable to create account', error.message);
      return;
    }

    if (!data.session) {
      Alert.alert(
        'Check your email',
        'Confirm your email before signing in.'
      );

      router.replace('/(auth)/login');
      return;
    }

    router.replace('/');
  }

  return (
    <View>
      <Text>Create your New Here account</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={loading ? 'Creating...' : 'Create account'}
        onPress={handleSignup}
        disabled={loading}
      />

      <Link href="/(auth)/login">
        Already have an account?
      </Link>
    </View>
  );
}