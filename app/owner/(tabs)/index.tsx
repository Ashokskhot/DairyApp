import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { Card } from '../../../src/components/ui';
import {
  colors,
  radius,
  spacing,
  typography,
} from '../../../src/theme';

export default function HomeScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.greeting}>
            Good Morning 👋
          </Text>

          <Text style={styles.title}>
            Dairy Dashboard
          </Text>

          {/* Today's Collection */}
          <Card style={styles.collectionCard}>
            <Text style={styles.cardTitle}>
              Today's Collection
            </Text>

            <Text style={styles.amount}>
              0.00 L
            </Text>

            <Text style={styles.collectionSubtitle}>
              No milk collected yet
            </Text>
          </Card>

          {/* Dashboard Stats */}
          <View style={styles.row}>
            <Card style={styles.statCard}>
              <Text style={styles.smallTitle}>
                Farmers
              </Text>

              <Text style={styles.smallValue}>
                0
              </Text>
            </Card>

            <Card style={styles.statCard}>
              <Text style={styles.smallTitle}>
                Today's Amount
              </Text>

              <Text style={styles.smallValue}>
                ₹0
              </Text>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  greeting: {
    ...typography.body,
    color: colors.textSecondary,
  },

  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },

  collectionCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },

  cardTitle: {
    ...typography.bodyMedium,
    color: colors.white,
  },

  amount: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.white,
    marginTop: spacing.sm,
  },

  collectionSubtitle: {
    ...typography.body,
    color: '#E8F5E9',
    marginTop: spacing.xs,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },

  statCard: {
    flex: 1,
    padding: spacing.lg,
  },

  smallTitle: {
    ...typography.body,
    color: colors.textSecondary,
  },

  smallValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
});