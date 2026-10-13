import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Button,
  Input,
  ScreenHeader,
} from '../../src/components/ui';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../src/theme';

import { loginUser } from '../../src/services/authService';

export default function FarmerLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function handleLogin() {
    if (!email.trim()) {
      Alert.alert(
        'Required',
        'Please enter your email address.',
      );
      return;
    }

    if (!password) {
      Alert.alert(
        'Required',
        'Please enter your password.',
      );
      return;
    }

    try {
      setLoading(true);

      await loginUser(
        email.trim(),
        password,
      );

      /*
       * Do not manually navigate to the farmer
       * dashboard here.
       *
       * AuthContext will detect the authenticated
       * Firebase user and app/index.tsx will handle
       * role-based navigation.
       */

      router.replace('/');
    } catch (error: any) {
      console.error(
        'Farmer login error:',
        error,
      );

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Farmer Login"
          showBack
          onBackPress={() => router.back()}
        />

        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>
              👨‍🌾
            </Text>
          </View>

          <Text style={styles.title}>
            Welcome Back
          </Text>

          <Text style={styles.subtitle}>
            Login to view your milk collection
            and earnings.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            required
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            required
          />

          <Button
            title={
              loading
                ? 'Logging in...'
                : 'Login'
            }
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          />
        </View>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() =>
            router.push(
              '/auth/farmer-register',
            )
          }
        >
          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text style={styles.registerTextBold}>
              Register
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },

  headerContent: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxxl,
  },

  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: radius.round,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  icon: {
    fontSize: 36,
  },

  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 300,
  },

  form: {
    width: '100%',
  },

  loginButton: {
    marginTop: spacing.md,
  },

  backLink: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
  },

  backLinkText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },

  registerText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  registerTextBold: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
});