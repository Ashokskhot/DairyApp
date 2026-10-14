
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button, ScreenHeader } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { logoutUser } from '../../src/services/authService';
import { colors, spacing, typography } from '../../src/theme';

export default function FarmerHomeScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);
      await logoutUser();
      router.replace('/');
    } catch (error) {
      console.error('Farmer logout failed:', error);
      Alert.alert('Error', 'Unable to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Farmer Dashboard" />

      <View style={styles.content}>
        <Text style={styles.icon}>👨‍🌾</Text>

        <Text style={styles.title}>
          Welcome{profile?.name ? `, ${profile.name}` : ''}
        </Text>

        <Text style={styles.message}>
          You are logged in to your farmer account.
          Your milk collection history and payment details
          will be available here as those modules are implemented.
        </Text>

        <Button
          title="Logout"
          onPress={handleLogout}
          loading={loading}
          disabled={loading}
          size="large"
          style={styles.logoutButton}
        />

        {loading && <ActivityIndicator color={colors.primary} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 23,
  },
  logoutButton: {
    marginTop: spacing.xxl,
    width: '100%',
  },
});
