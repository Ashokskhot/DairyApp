import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../../src/context/AuthContext';
import { getFarmers } from '../../../src/services/farmerService';
import {
  getTodayMilkCollections,
  MilkCollection,
} from '../../../src/services/collectionService';

import { Card } from '../../../src/components/ui';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../../src/theme';

interface DashboardStats {
  totalLitres: number;
  totalAmount: number;
  collectionCount: number;

  cowLitres: number;
  cowAmount: number;

  buffaloLitres: number;
  buffaloAmount: number;

  morningLitres: number;
  morningAmount: number;

  eveningLitres: number;
  eveningAmount: number;

  farmerCount: number;
}

const initialStats: DashboardStats = {
  totalLitres: 0,
  totalAmount: 0,
  collectionCount: 0,

  cowLitres: 0,
  cowAmount: 0,

  buffaloLitres: 0,
  buffaloAmount: 0,

  morningLitres: 0,
  morningAmount: 0,

  eveningLitres: 0,
  eveningAmount: 0,

  farmerCount: 0,
};

export default function HomeScreen() {
  const { profile } = useAuth();

  const [stats, setStats] =
    useState<DashboardStats>(initialStats);

  const [recentCollections, setRecentCollections] =
    useState<MilkCollection[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dairyId = profile?.dairyId;

  async function loadDashboard() {
    if (!dairyId) {
      setLoading(false);
      return;
    }

    try {
      const [collections, farmers] =
        await Promise.all([
          getTodayMilkCollections(dairyId),
          getFarmers(dairyId),
        ]);

      calculateStats(collections, farmers.length);
    } catch (error) {
      console.error(
        'Failed to load dashboard:',
        error,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function calculateStats(
    collections: MilkCollection[],
    farmerCount: number,
  ) {
    const calculated: DashboardStats = {
      ...initialStats,
      farmerCount,
    };

    collections.forEach((item) => {
      calculated.totalLitres += item.quantity;
      calculated.totalAmount += item.amount;
      calculated.collectionCount += 1;

      if (item.animalType === 'cow') {
        calculated.cowLitres += item.quantity;
        calculated.cowAmount += item.amount;
      }

      if (item.animalType === 'buffalo') {
        calculated.buffaloLitres += item.quantity;
        calculated.buffaloAmount += item.amount;
      }

      if (item.session === 'morning') {
        calculated.morningLitres += item.quantity;
        calculated.morningAmount += item.amount;
      }

      if (item.session === 'evening') {
        calculated.eveningLitres += item.quantity;
        calculated.eveningAmount += item.amount;
      }
    });

    setStats(calculated);

    // Keep only latest 5 records
    setRecentCollections(
      [...collections]
        .sort((a, b) => {
          const aTime =
            a.createdAt?.seconds || 0;

          const bTime =
            b.createdAt?.seconds || 0;

          return bTime - aTime;
        })
        .slice(0, 5),
    );
  }

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [dairyId]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadDashboard();
  }

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const greetingName =
    profile?.name?.trim() || 'Owner';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Header */}
          <Text style={styles.greeting}>
            Good Morning, {greetingName} 👋
          </Text>

          <Text style={styles.title}>
            Dairy Dashboard
          </Text>

          {/* Today's Main Summary */}
          <Card style={styles.collectionCard}>
            <Text style={styles.cardTitle}>
              Today's Collection
            </Text>

            <Text style={styles.amount}>
              {formatLitres(stats.totalLitres)}
            </Text>

            <Text style={styles.litreLabel}>
              litres collected
            </Text>

            <View style={styles.mainCardDivider} />

            <View style={styles.mainCardBottom}>
              <View>
                <Text
                  style={
                    styles.mainCardSecondaryLabel
                  }
                >
                  Today's Amount
                </Text>

                <Text
                  style={
                    styles.mainCardSecondaryValue
                  }
                >
                  {formatAmount(
                    stats.totalAmount,
                  )}
                </Text>
              </View>

              <View style={styles.mainCardRight}>
                <Text
                  style={
                    styles.mainCardSecondaryLabel
                  }
                >
                  Collections
                </Text>

                <Text
                  style={
                    styles.mainCardSecondaryValue
                  }
                >
                  {stats.collectionCount}
                </Text>
              </View>
            </View>
          </Card>

          {/* Quick Action */}
          <TouchableOpacity
            style={styles.collectButton}
            onPress={() =>
              router.push('/owner/collection/add')
            }
            activeOpacity={0.8}
          >
            <Text style={styles.collectIcon}>
              +
            </Text>

            <View style={styles.collectContent}>
              <Text style={styles.collectTitle}>
                Collect Milk
              </Text>

              <Text style={styles.collectSubtitle}>
                Record today's milk collection
              </Text>
            </View>

            <Text style={styles.collectArrow}>
              ›
            </Text>
          </TouchableOpacity>

          {/* Milk Type Summary */}
          <SectionTitle title="Milk Summary" />

          <View style={styles.row}>
            <SummaryCard
              icon="🐄"
              title="Cow Milk"
              litres={stats.cowLitres}
              amount={stats.cowAmount}
            />

            <SummaryCard
              icon="🐃"
              title="Buffalo Milk"
              litres={stats.buffaloLitres}
              amount={stats.buffaloAmount}
            />
          </View>

          {/* Session Summary */}
          <SectionTitle title="Session Summary" />

          <View style={styles.row}>
            <SessionCard
              icon="🌅"
              title="Morning"
              litres={stats.morningLitres}
              amount={stats.morningAmount}
            />

            <SessionCard
              icon="🌆"
              title="Evening"
              litres={stats.eveningLitres}
              amount={stats.eveningAmount}
            />
          </View>

          {/* Farmers */}
          <SectionTitle title="Farmers" />

          <Card style={styles.farmerCard}>
            <View style={styles.farmerIcon}>
              <Text style={styles.farmerIconText}>
                👨‍🌾
              </Text>
            </View>

            <View style={styles.farmerInfo}>
              <Text style={styles.farmerCount}>
                {stats.farmerCount}
              </Text>

              <Text style={styles.farmerLabel}>
                Active Farmers
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                router.push('/owner/farmers')
              }
              style={styles.viewButton}
            >
              <Text style={styles.viewButtonText}>
                View Farmers
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Recent Collections */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent Collections
            </Text>

            {recentCollections.length > 0 && (
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    '/owner/collection/history',
                  )
                }
              >
                <Text style={styles.viewAll}>
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {recentCollections.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>
                🥛
              </Text>

              <Text style={styles.emptyTitle}>
                No collections today
              </Text>

              <Text style={styles.emptyText}>
                Start recording milk collection
                for your farmers.
              </Text>
            </Card>
          ) : (
            <Card style={styles.recentCard}>
              {recentCollections.map(
                (item, index) => (
                  <RecentCollectionRow
                    key={item.id}
                    item={item}
                    last={
                      index ===
                      recentCollections.length - 1
                    }
                  />
                ),
              )}
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <Text style={styles.sectionTitle}>
      {title}
    </Text>
  );
}

function SummaryCard({
  icon,
  title,
  litres,
  amount,
}: {
  icon: string;
  title: string;
  litres: number;
  amount: number;
}) {
  return (
    <Card style={styles.summaryCard}>
      <Text style={styles.summaryIcon}>
        {icon}
      </Text>

      <Text style={styles.summaryTitle}>
        {title}
      </Text>

      <Text style={styles.summaryLitres}>
        {formatLitres(litres)}
      </Text>

      <Text style={styles.summaryAmount}>
        {formatAmount(amount)}
      </Text>
    </Card>
  );
}

function SessionCard({
  icon,
  title,
  litres,
  amount,
}: {
  icon: string;
  title: string;
  litres: number;
  amount: number;
}) {
  return (
    <Card style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionIcon}>
          {icon}
        </Text>

        <Text style={styles.sessionTitle}>
          {title}
        </Text>
      </View>

      <Text style={styles.sessionLitres}>
        {formatLitres(litres)}
      </Text>

      <Text style={styles.sessionAmount}>
        {formatAmount(amount)}
      </Text>
    </Card>
  );
}

function RecentCollectionRow({
  item,
  last,
}: {
  item: MilkCollection;
  last: boolean;
}) {
  return (
    <View
      style={[
        styles.recentRow,
        !last && styles.recentRowBorder,
      ]}
    >
      <View style={styles.recentAvatar}>
        <Text style={styles.recentAvatarText}>
          {item.farmerName
            .charAt(0)
            .toUpperCase()}
        </Text>
      </View>

      <View style={styles.recentInfo}>
        <Text style={styles.recentName}>
          {item.farmerName}
        </Text>

        <Text style={styles.recentMeta}>
          {item.animalType === 'cow'
            ? '🐄 Cow'
            : '🐃 Buffalo'}
          {'  •  '}
          {capitalize(item.session)}
        </Text>
      </View>

      <View style={styles.recentAmount}>
        <Text style={styles.recentQuantity}>
          {formatLitres(item.quantity)}
        </Text>

        <Text style={styles.recentPrice}>
          {formatAmount(item.amount)}
        </Text>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatLitres(value: number) {
  return `${value.toFixed(2)} L`;
}

function formatAmount(value: number) {
  return `₹${value.toFixed(0)}`;
}

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
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

  /* Main collection card */

  collectionCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },

  cardTitle: {
    ...typography.bodyMedium,
    color: colors.white,
  },

  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
    marginTop: spacing.sm,
  },

  litreLabel: {
    ...typography.body,
    color: colors.white,
    opacity: 0.85,
    marginTop: spacing.xs,
  },

  mainCardDivider: {
    height: 1,
    backgroundColor: colors.white,
    opacity: 0.2,
    marginVertical: spacing.lg,
  },

  mainCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  mainCardRight: {
    alignItems: 'flex-end',
  },

  mainCardSecondaryLabel: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
  },

  mainCardSecondaryValue: {
    ...typography.heading,
    color: colors.white,
    marginTop: spacing.xs,
  },

  /* Collect milk */

  collectButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  collectIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 40,
    fontSize: 26,
    fontWeight: '400',
  },

  collectContent: {
    flex: 1,
    marginLeft: spacing.md,
  },

  collectTitle: {
    ...typography.subheading,
    color: colors.text,
  },

  collectSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  collectArrow: {
    fontSize: 28,
    color: colors.textDisabled,
  },

  /* Sections */

  sectionTitle: {
    ...typography.subheading,
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },

  sectionHeaderTitle: {
    marginTop: 0,
    marginBottom: 0,
  },

  viewAll: {
    ...typography.bodyMedium,
    color: colors.primary,
  },

  /* Cow / Buffalo */

  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  summaryCard: {
    flex: 1,
    padding: spacing.lg,
  },

  summaryIcon: {
    fontSize: 28,
  },

  summaryTitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  summaryLitres: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },

  summaryAmount: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  /* Morning / Evening */

  sessionCard: {
    flex: 1,
    padding: spacing.lg,
  },

  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sessionIcon: {
    fontSize: 22,
  },

  sessionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginLeft: spacing.sm,
  },

  sessionLitres: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },

  sessionAmount: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  /* Farmers */

  farmerCard: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },

  farmerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  farmerIconText: {
    fontSize: 24,
  },

  farmerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  farmerCount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },

  farmerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  viewButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  viewButtonText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },

  /* Recent */

  recentCard: {
    paddingHorizontal: spacing.lg,
  },

  recentRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },

  recentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  recentAvatar: {
    width: 42,
    height: 42,
    borderRadius: radius.round,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  recentAvatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryDark,
  },

  recentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  recentName: {
    ...typography.bodyMedium,
    color: colors.text,
  },

  recentMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  recentAmount: {
    alignItems: 'flex-end',
  },

  recentQuantity: {
    ...typography.bodyMedium,
    color: colors.text,
  },

  recentPrice: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  /* Empty */

  emptyCard: {
    padding: spacing.xxl,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 38,
  },

  emptyTitle: {
    ...typography.subheading,
    color: colors.text,
    marginTop: spacing.sm,
  },

  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});