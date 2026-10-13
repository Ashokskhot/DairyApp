import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../../src/context/AuthContext';
import { updateUserProfile } from '../../../src/services/userService';

import { colors } from '../../../src/theme/colors';
import { spacing } from '../../../src/theme/spacing';
import { radius } from '../../../src/theme/radius';
import { typography } from '../../../src/theme/typography';

import { Input } from '../../../src/components/ui';

export default function OwnerProfileScreen() {
  const { user, profile } = useAuth();

  const [name, setName] = useState(
    profile?.name || '',
  );

  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(
        'Required',
        'Please enter your name.',
      );
      return;
    }

    if (!user?.uid) {
      Alert.alert(
        'Error',
        'Unable to identify your account.',
      );
      return;
    }

    try {
      setLoading(true);

      await updateUserProfile(user.uid, {
        name: name.trim(),
      });

      Alert.alert(
        'Profile updated',
        'Your profile has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error(
        'Failed to update profile:',
        error,
      );

      Alert.alert(
        'Update failed',
        'Unable to update your profile. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  const email =
    profile?.email ||
    user?.email ||
    '';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Profile
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Avatar */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(name || 'D')
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <Text style={styles.profileName}>
            {name || 'Dairy Owner'}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              Dairy Owner
            </Text>
          </View>
        </View>

        {/* Personal Information */}
        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <View style={styles.card}>
          <Input
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            required
          />

          <Text style={styles.label}>
            Email
          </Text>

          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>
              {email || 'Not available'}
            </Text>
          </View>

          <Text style={styles.helperText}>
            Email is linked to your login account and
            cannot be changed here.
          </Text>
        </View>

        {/* Account Information */}
        <Text style={styles.sectionTitle}>
          Account Information
        </Text>

        <View style={styles.card}>
          <InfoRow
            label="Role"
            value="Dairy Owner"
          />

          <InfoRow
            label="Dairy ID"
            value={
              profile?.dairyId ||
              'Not available'
            }
            last
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            loading && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator
              color={colors.white}
            />
          ) : (
            <Text style={styles.saveButtonText}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        !last && styles.infoRowBorder,
      ]}
    >
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 100,
    paddingTop: 50,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },

  backText: {
    fontSize: 36,
    lineHeight: 40,
    color: colors.text,
  },

  headerTitle: {
    flex: 1,
    ...typography.heading,
    color: colors.text,
    textAlign: 'center',
  },

  headerSpacer: {
    width: 40,
  },

  content: {
    padding: spacing.xl,
    paddingBottom: spacing.huge,
  },

  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.round,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primaryDark,
  },

  profileName: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.md,
  },

  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    marginTop: spacing.sm,
  },

  roleText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primaryDark,
  },

  sectionTitle: {
    ...typography.subheading,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },

  label: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  readOnlyInput: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  readOnlyText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },

  infoRow: {
    minHeight: 52,
    justifyContent: 'center',
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  infoValue: {
    ...typography.bodyMedium,
    color: colors.text,
    marginTop: spacing.xs,
  },

  saveButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
});