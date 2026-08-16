import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

import { registerUser } from '../../src/services/authService';
import { createDairy } from '../../src/services/dairyService';
import { createUserProfile } from '../../src/services/userService';

export default function OwnerRegister() {
  const [dairyName, setDairyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!dairyName.trim()) {
      Alert.alert('Required', 'Please enter dairy name.');
      return;
    }

    if (!ownerName.trim()) {
      Alert.alert('Required', 'Please enter owner name.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Required', 'Please enter email.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Invalid password',
        'Password must contain at least 6 characters.',
      );
      return;
    }

    try {
      setLoading(true);

      // 1. Create Firebase Authentication user
      const user = await registerUser(
        email.trim(),
        password,
      );

      // 2. Create dairy
      const dairyId = await createDairy({
        name: dairyName.trim(),
        ownerId: user.uid,
      });

      // 3. Create user profile
      await createUserProfile(user.uid, {
        name: ownerName.trim(),
        email: email.trim(),
        role: 'owner',
        dairyId,
      });

      Alert.alert(
        'Registration successful',
        'Your dairy account has been created.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/owner'),
          },
        ],
      );
    } catch (error: any) {
      console.error(error);

      Alert.alert(
        'Registration failed',
        error?.message || 'Something went wrong.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>
                Create Dairy Account
              </Text>

              <Text style={styles.subtitle}>
                Set up your dairy to start managing farmers
                and milk collection.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Dairy Name"
                placeholder="Enter dairy name"
                value={dairyName}
                onChangeText={setDairyName}
                autoCapitalize="words"
                required
              />

              <Input
                label="Owner Name"
                placeholder="Enter your name"
                value={ownerName}
                onChangeText={setOwnerName}
                autoCapitalize="words"
                required
              />

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
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                size="large"
                style={styles.createButton}
              />
            </View>

            <Text
              style={styles.loginText}
              onPress={() =>
                router.push('/auth/owner-login')
              }
            >
              Already have an account? Login
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
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
  },

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },

  header: {
    marginBottom: spacing.xxl,
  },

  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  form: {
    width: '100%',
  },

  createButton: {
    marginTop: spacing.sm,
  },

  loginText: {
    ...typography.bodyMedium,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});