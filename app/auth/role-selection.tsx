import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Card } from '../../src/components/ui';
import {
  colors,
  radius,
  spacing,
  typography,
} from '../../src/theme';

export default function RoleSelectionScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.content}>
          <Text style={styles.logo}>🐄</Text>

          <Text style={styles.title}>
            Dairy App
          </Text>

          <Text style={styles.subtitle}>
            Simple milk collection and dairy management
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Who are you?
            </Text>

            <RoleCard
              icon="👨‍🌾"
              title="Dairy Owner"
              description="Manage farmers, milk collection and payments"
              onPress={() =>
                router.push('/auth/owner-register')
              }
            />

            <RoleCard
              icon="🧑‍🌾"
              title="Farmer"
              description="View your milk records, earnings and payments"
              onPress={() =>
                router.push('/auth/farmer-login')
              }
            />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

interface RoleCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

function RoleCard({
  icon,
  title,
  description,
  onPress,
}: RoleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleCard,
        pressed && styles.roleCardPressed,
      ]}
    >
      <Card style={styles.card}>
        <Text style={styles.roleIcon}>
          {icon}
        </Text>

        <View style={styles.roleContent}>
          <Text style={styles.roleTitle}>
            {title}
          </Text>

          <Text style={styles.roleDescription}>
            {description}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Card>
    </Pressable>
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
    paddingHorizontal: spacing.xl,
  },

  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  title: {
    ...typography.title,
    fontSize: 34,
    textAlign: 'center',
    color: colors.text,
  },

  subtitle: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xxxl,
  },

  section: {
    width: '100%',
  },

  sectionTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.md,
  },

  roleCard: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
  },

  roleCardPressed: {
    opacity: 0.85,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },

  roleIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },

  roleContent: {
    flex: 1,
  },

  roleTitle: {
    ...typography.subheading,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  roleDescription: {
    ...typography.caption,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  arrow: {
    fontSize: 28,
    color: colors.textDisabled,
  },
});