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
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../../src/context/AuthContext';
import {
  getTodayMilkCollections,
  MilkCollection,
} from '../../../src/services/collectionService';

import {
  colors,
  spacing,
  typography,
} from '../../../src/theme';

import { ScreenHeader } from '../../../src/components/ui';
import CollectionRecordCard from '../../../src/components/collection/CollectionRecordCard';

export default function CollectionIndexScreen() {
  const { profile } = useAuth();

  const [collections, setCollections] = useState<
    MilkCollection[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCollections = useCallback(async () => {
    if (!profile?.dairyId) {
      setCollections([]);
      setLoading(false);
      return;
    }

    try {
      const result = await getTodayMilkCollections(
        profile.dairyId,
      );

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
  }, [profile?.dairyId]);

  useFocusEffect(
    useCallback(() => {
      loadCollections();
    }, [loadCollections]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadCollections();
  }

  const morningCollections = collections.filter(
    (item) => item.session === 'morning',
  );

  const eveningCollections = collections.filter(
    (item) => item.session === 'evening',
  );

  const totalQuantity = collections.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const totalAmount = collections.reduce(
    (total, item) => total + item.amount,
    0,
  );

  function renderCollectionSection(
    title: string,
    records: MilkCollection[],
  ) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {title}
          </Text>

          <Text style={styles.sectionCount}>
            {records.length}
          </Text>
        </View>

        {records.length === 0 ? (
          <View style={styles.emptySession}>
            <Text style={styles.emptySessionText}>
              No collection recorded
            </Text>
          </View>
        ) : (
          records.map((item) => (
            <CollectionRecordCard
              key={item.id}
              item={item}
            />
          ))
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
          <TouchableOpacity
            style={styles.collectButton}
            activeOpacity={0.8}
            onPress={() =>
              router.push('/owner/collection/add')
            }
          >
            <Text style={styles.collectButtonText}>
              + Collect
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Today's Collection
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>
                Quantity
              </Text>

              <Text style={styles.summaryValue}>
                {totalQuantity.toFixed(2)} L
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>
                Amount
              </Text>

              <Text style={styles.summaryValue}>
                ₹{totalAmount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>
                Records
              </Text>

              <Text style={styles.summaryValue}>
                {collections.length}
              </Text>
            </View>
          </View>
        </View>

        {/* History */}
        <TouchableOpacity
          style={styles.historyButton}
          activeOpacity={0.8}
          onPress={() =>
            router.push('/owner/collection/history')
          }
        >
          <View style={styles.historyContent}>
            <Text style={styles.historyIcon}>
              📋
            </Text>

            <View style={styles.historyTextContainer}>
              <Text style={styles.historyTitle}>
                Collection History
              </Text>

              <Text style={styles.historySubtitle}>
                View previous milk collection records
              </Text>
            </View>

            <Text style={styles.historyArrow}>
              ›
            </Text>
          </View>
        </TouchableOpacity>

        {/* Morning */}
        {renderCollectionSection(
          'Morning Collection',
          morningCollections,
        )}

        {/* Evening */}
        {renderCollectionSection(
          'Evening Collection',
          eveningCollections,
        )}

        {/* Empty state */}
        {collections.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              🥛
            </Text>

            <Text style={styles.emptyTitle}>
              No collection today
            </Text>

            <Text style={styles.emptyText}>
              Start recording today's milk
              collection from your farmers.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.8}
              onPress={() =>
                router.push('/owner/collection/add')
              }
            >
              <Text style={styles.emptyButtonText}>
                + Collect Milk
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  collectButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },

  collectButtonText: {
    color: colors.white,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },

  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  summaryTitle: {
    color: colors.white,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginBottom: spacing.md,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryLabel: {
    color: colors.white,
    opacity: 0.8,
    fontSize: 12,
  },

  summaryValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.xs,
  },

  summaryDivider: {
    width: 1,
    height: 35,
    backgroundColor: colors.white,
    opacity: 0.25,
  },

  historyButton: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  historyIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },

  historyTextContainer: {
    flex: 1,
  },

  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  historySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  historyArrow: {
    fontSize: 28,
    color: colors.textSecondary,
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  sectionCount: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  emptySession: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },

  emptySessionText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },

  emptyIcon: {
    fontSize: 48,
  },

  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  emptyText: {
    marginTop: spacing.xs,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 20,
  },

  emptyButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 10,
  },

  emptyButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});