
import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../src/context/AuthContext';
import { logoutUser } from '../src/services/authService';
import { colors, spacing, typography } from '../src/theme';

export default function Index() {
  const { user, profile, loading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (loading || signingOut) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/role-selection" />;
  }

  if (profile?.role === 'owner') {
    return <Redirect href="/owner/(tabs)" />;
  }

  if (profile?.role === 'farmer') {
    return <Redirect href="/farmer" />;
  }

  async function handleSignOut() {
    try {
      setSigningOut(true);
      await logoutUser();
    } catch (error) {
      console.error('Sign out failed:', error);
      Alert.alert('Error', 'Unable to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Account setup incomplete</Text>
      <Text style={styles.message}>
        We couldn't find a valid DairyApp profile for this account.
        Please sign out and contact your dairy owner if the problem continues.
      </Text>

      <Pressable style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  button: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 10,
  },
  buttonText: {
    ...typography.bodyMedium,
    color: '#FFFFFF',
  },
});
