import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../../src/context/AuthContext';
import {
  getTodayMilkCollections,
  MilkCollection,
} from '../../../src/services/collectionService';

import {
  Button,
  ScreenHeader,
} from '../../../src/components/ui';

import CollectionRecordCard from '../../../src/components/collection/CollectionRecordCard';

import { colors, spacing, typography } from '../../../src/theme';

type SessionTab = 'all' | 'morning' | 'evening';
type AnimalTab = 'cow' | 'buffalo';

export default function CollectionScreen() {
  const { profile } = useAuth();

  const [collections, setCollections] = useState<
    MilkCollection[]
  >([]);

  const [sessionTab, setSessionTab] =
    useState<SessionTab>('all');

  const [animalTab, setAnimalTab] =
    useState<AnimalTab>('cow');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dairyId = profile?.dairyId;

  const loadCollections = useCallback(async () => {
    if (!dairyId) {
      setCollections([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const result =
        await getTodayMilkCollections(dairyId);

      setCollections(result);
    } catch (error) {
      console.error(
        'Failed to load milk collections:',
        error,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dairyId]);

  useFocusEffect(
    useCallback(() => {
      loadCollections();
    }, [loadCollections]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadCollections();
  }

  
  /*
   * Today's complete summary.
   *
   * This is NOT affected by Morning / Evening filter.
   */
  const todaySummary = useMemo(() => {
    return calculateSummary(collections);
  }, [collections]);

  /**
   * Filter records according to selected
   * Morning / Evening tab.
   */
  const sessionCollections = useMemo(() => {
    if (sessionTab === 'all') {
      return collections;
    }

    return collections.filter(
      (item) => item.session === sessionTab,
    );
  }, [collections, sessionTab]);

  /**
   * Once Morning/Evening is selected, show
   * Cow / Buffalo separately.
   *
   * For "All", we still use the animal selection.
   */
  const visibleCollections = useMemo(() => {
    return sessionCollections.filter(
      (item) => item.animalType === animalTab,
    );
  }, [sessionCollections, animalTab]);

  const sessionSummary = useMemo(() => {
    return sessionCollections.reduce(
      (result, item) => {
        result.quantity += item.quantity;
        result.amount += item.amount;

        return result;
      },
      {
        quantity: 0,
        amount: 0,
      },
    );
  }, [sessionCollections]);

  const cowCount = sessionCollections.filter(
    (item) => item.animalType === 'cow',
  ).length;

  const buffaloCount = sessionCollections.filter(
    (item) => item.animalType === 'buffalo',
  ).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Milk Collection"
        rightAction={
          <Button
            title="+ Add"
            onPress={() => router.push('/owner/collection/add')}
            size="small"
          />
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Today's Summary */}
        {/* <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Today's Collection
          </Text>

          <Text style={styles.summaryAmount}>
            {summary.quantity.toFixed(2)} L
          </Text>

          <Text style={styles.summarySubtext}>
            Total Amount ₹
            {summary.amount.toFixed(2)}
          </Text>
        </View> */}

         {/* Today's Collection */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Today's Collection
          </Text>

          <View style={styles.summaryMainRow}>
            <View>
              <Text style={styles.summaryQuantity}>
                {todaySummary.quantity.toFixed(2)} L
              </Text>

              <Text style={styles.summaryLabel}>
                Total Milk
              </Text>
            </View>

            <View style={styles.summaryAmountBox}>
              <Text style={styles.summaryAmount}>
                ₹{todaySummary.amount.toFixed(2)}
              </Text>

              <Text style={styles.summaryLabel}>
                Total Amount
              </Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryStats}>
            <SummaryStat
              label="Records"
              value={String(collections.length)}
            />

            <SummaryStat
              label="Cow"
              value={`${todaySummary.cowQuantity.toFixed(2)} L`}
            />

            <SummaryStat
              label="Buffalo"
              value={`${todaySummary.buffaloQuantity.toFixed(2)} L`}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/owner/collection/history')}
          activeOpacity={0.8}
        >
          <View style={styles.historyContent}>
            <Text style={styles.historyIcon}>
              📋
            </Text>

            <View>
              <Text style={styles.historyTitle}>
                Collection History
              </Text>

              <Text style={styles.historySubtitle}>
                View previous milk collections
              </Text>
            </View>
          </View>

          <Text style={styles.historyArrow}>
            ›
          </Text>
        </TouchableOpacity>

        {/* Session Tabs */}
        <View style={styles.segmentContainer}>
          <SegmentButton
            title="All"
            selected={sessionTab === 'all'}
            onPress={() => setSessionTab('all')}
          />

          <SegmentButton
            title="Morning"
            selected={sessionTab === 'morning'}
            onPress={() =>
              setSessionTab('morning')
            }
          />

          <SegmentButton
            title="Evening"
            selected={sessionTab === 'evening'}
            onPress={() =>
              setSessionTab('evening')
            }
          />
        </View>

        {/* Selected Session Summary */}
        <View style={styles.sessionSummary}>
          <View>
            <Text style={styles.sessionTitle}>
              {sessionTab === 'all'
                ? "Today's Collection"
                : `${capitalize(sessionTab)} Collection`}
            </Text>

            <Text style={styles.sessionSubtitle}>
              {sessionCollections.length}{' '}
              record
              {sessionCollections.length !== 1
                ? 's'
                : ''}
            </Text>
          </View>

          <View style={styles.sessionAmountContainer}>
            <Text style={styles.sessionQuantity}>
              {sessionSummary.quantity.toFixed(2)} L
            </Text>

            <Text style={styles.sessionAmount}>
              ₹{sessionSummary.amount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Cow / Buffalo Tabs */}
        <View style={styles.animalTabs}>
          <AnimalTabButton
            icon="🐄"
            title="Cow"
            count={cowCount}
            selected={animalTab === 'cow'}
            onPress={() => setAnimalTab('cow')}
          />

          <AnimalTabButton
            icon="🐃"
            title="Buffalo"
            count={buffaloCount}
            selected={animalTab === 'buffalo'}
            onPress={() =>
              setAnimalTab('buffalo')
            }
          />
        </View>

        {/* Records */}
        <View style={styles.recordsHeader}>
          <Text style={styles.recordsTitle}>
            {capitalize(animalTab)} Milk
          </Text>

          <Text style={styles.recordsCount}>
            {visibleCollections.length}
          </Text>
        </View>

        {visibleCollections.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              {animalTab === 'cow'
                ? '🐄'
                : '🐃'}
            </Text>

            <Text style={styles.emptyTitle}>
              No {animalTab} milk collection
            </Text>

            <Text style={styles.emptyText}>
              No {animalTab} milk has been recorded
              for this selection today.
            </Text>

            <TouchableOpacity
              style={styles.collectButton}
              onPress={() =>
                router.push(
                  '/owner/collection/add',
                )
              }
            >
              <Text style={styles.collectButtonText}>
                + Collect Milk
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          visibleCollections.map((item) => (
            <CollectionRecordCard
              key={item.id}
              item={item}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function calculateSummary(
  records: MilkCollection[],
) {
  return records.reduce(
    (result, item) => {
      result.quantity += item.quantity;
      result.amount += item.amount;

      if (item.animalType === 'cow') {
        result.cowQuantity += item.quantity;
      }

      if (item.animalType === 'buffalo') {
        result.buffaloQuantity += item.quantity;
      }

      return result;
    },
    {
      quantity: 0,
      amount: 0,
      cowQuantity: 0,
      buffaloQuantity: 0,
    },
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryStatValue}>
        {value}
      </Text>

      <Text style={styles.summaryStatLabel}>
        {label}
      </Text>
    </View>
  );
}

function SegmentButton({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.segmentButton,
        selected && styles.segmentSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.segmentText,
          selected && styles.segmentTextSelected,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function AnimalTabButton({
  icon,
  title,
  count,
  selected,
  onPress,
}: {
  icon: string;
  title: string;
  count: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.animalTab,
        selected && styles.animalTabSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.animalIcon}>
        {icon}
      </Text>

      <Text
        style={[
          styles.animalTitle,
          selected && styles.animalTitleSelected,
        ]}
      >
        {title}
      </Text>

      <View
        style={[
          styles.countBadge,
          selected && styles.countBadgeSelected,
        ]}
      >
        <Text
          style={[
            styles.countText,
            selected && styles.countTextSelected,
          ]}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: spacing.lg,
  },

  summaryTitle: {
    color: colors.white,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },

  summarySubtext: {
    color: colors.primaryLight,
    fontSize: typography.body.fontSize,
    marginTop: 4,
  },

  summaryMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  summaryQuantity: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '700',
  },

  summaryAmountBox: {
    alignItems: 'flex-end',
  },

  summaryAmount: {
    color: colors.white,
    fontSize: 23,
    fontWeight: '700',
  },

  summaryLabel: {
    color: colors.primaryLight,
    fontSize: 12,
    marginTop: 3,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: colors.primaryLight,
    opacity: 0.35,
    marginVertical: spacing.md,
  },

  summaryStats: {
    flexDirection: 'row',
  },

  summaryStat: {
    flex: 1,
  },

  summaryStatValue: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  summaryStatLabel: {
    color: colors.primaryLight,
    fontSize: 11,
    marginTop: 3,
  },
  
  historyButton: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },

  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  historyIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },

  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },

  historySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },

  historyArrow: {
    fontSize: 28,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },

  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  segmentButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 9,
  },

  segmentSelected: {
    backgroundColor: colors.primary,
  },

  segmentText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },

  segmentTextSelected: {
    color: colors.white,
  },

  sessionSummary: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sessionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  sessionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },

  sessionAmountContainer: {
    alignItems: 'flex-end',
  },

  sessionQuantity: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

  sessionAmount: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },

  animalTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  animalTab: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  animalTabSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  animalIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },

  animalTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  animalTitleSelected: {
    color: colors.primary,
  },

  countBadge: {
    minWidth: 25,
    height: 25,
    paddingHorizontal: 6,
    borderRadius: 13,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  countBadgeSelected: {
    backgroundColor: colors.primary,
  },

  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  countTextSelected: {
    color: colors.white,
  },

  recordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },

  recordsTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

  recordsCount: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: spacing.xl,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },

  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 5,
  },

  collectButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    marginTop: spacing.lg,
  },

  collectButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});