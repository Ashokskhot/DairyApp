import { router } from 'expo-router';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { logoutUser } from '../../../src/services/authService';
import { useAuth } from '../../../src/context/AuthContext';

import { colors } from '../../../src/theme/colors';
import { spacing } from '../../../src/theme/spacing';
import { radius } from '../../../src/theme/radius';
import { typography } from '../../../src/theme/typography';

export default function AccountScreen() {
  const { user, profile } = useAuth();

  async function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();

              router.replace('/auth/role-selection');
            } catch (error) {
              console.error(
                'Logout error:',
                error,
              );

              Alert.alert(
                'Logout failed',
                'Unable to logout. Please try again.',
              );
            }
          },
        },
      ],
    );
  }

  const displayName =
    profile?.name || 'Dairy Owner';

  const email =
    profile?.email ||
    user?.email ||
    '';

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>
        Account
      </Text>

      <Text style={styles.subtitle}>
        Manage your dairy account
      </Text>

      {/* Profile */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {displayName}
          </Text>

          <Text style={styles.email}>
            {email}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              Dairy Owner
            </Text>
          </View>
        </View>
      </View>

      {/* Profile option */}
      <TouchableOpacity
        style={styles.option}
        activeOpacity={0.8}
        onPress={() => {
          router.push('/owner/accounts/profile')
        }}
      >
        <Text style={styles.optionIcon}>
          👤
        </Text>

        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>
            Profile
          </Text>

          <Text style={styles.optionSubtitle}>
            Manage your profile
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>

      {/* Dairy information */}
      <TouchableOpacity
        style={styles.option}
        activeOpacity={0.8}
        onPress={() => {
          // Dairy information screen will be added later
        }}
      >
        <Text style={styles.optionIcon}>
          🏪
        </Text>

        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>
            Dairy Information
          </Text>

          <Text style={styles.optionSubtitle}>
            Manage dairy details
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <Text style={styles.logoutIcon}>
          🚪
        </Text>

        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },

  title: {
    ...typography.title,
    color: colors.text,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },

  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.round,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
  },

  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  profileName: {
    ...typography.subheading,
    color: colors.text,
  },

  email: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    marginTop: spacing.sm,
  },

  roleText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primaryDark,
  },

  option: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  optionIcon: {
    fontSize: 23,
    width: 40,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    ...typography.subheading,
    color: colors.text,
  },

  optionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  arrow: {
    fontSize: 28,
    color: colors.textDisabled,
  },

  logoutButton: {
    marginTop: spacing.lg,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },

  logoutText: {
    ...typography.button,
    color: colors.error,
  },
});