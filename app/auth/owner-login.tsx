import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { Button, Input } from '../../src/components/ui';
import {
  colors,
  spacing,
  typography,
} from '../../src/theme';

import { loginUser } from '../../src/services/authService';

export default function OwnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert(
        'Required',
        'Please enter email and password.',
      );
      return;
    }

    try {
      setLoading(true);

      await loginUser(
        email.trim(),
        password,
      );

      router.replace('/owner');
    } catch (error: any) {
      console.error('Login error:', error);

      Alert.alert(
        'Login failed',
        error?.message ||
          'Unable to login. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.logo}>🥛</Text>

          <Text style={styles.title}>
            Owner Login
          </Text>

          <Text style={styles.subtitle}>
            Login to manage your dairy
          </Text>

          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
            />

            <Input
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              required
            />

            <Button
              title="Login"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              size="large"
              style={styles.loginButton}
            />
          </View>

          <Text
            style={styles.registerText}
            onPress={() =>
              router.push('/auth/owner-register')
            }
          >
            Don't have an account? Create one
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },

  logo: {
    fontSize: 50,
    textAlign: 'center',
  },

  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxxl,
  },

  form: {
    width: '100%',
  },

  loginButton: {
    marginTop: spacing.sm,
  },

  registerText: {
    ...typography.bodyMedium,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});