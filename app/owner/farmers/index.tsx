import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import { useAuth } from '../../../src/context/AuthContext';
import { getFarmers } from '../../../src/services/farmerService';

import { Button, Loading, ScreenHeader } from '../../../src/components/ui';
import { FarmerCard } from '../../../src/components/farmers';

import {
  colors,
  spacing,
  typography,
} from '../../../src/theme';

interface Farmer {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  milkTypes: {
    cow: boolean;
    buffalo: boolean;
  };
}

export default function FarmersScreen() {
  const { profile } = useAuth();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadFarmers() {
    if (!profile?.dairyId) {
      setLoading(false);
      return;
    }

    try {
      const result = await getFarmers(
        profile.dairyId,
      );

      setFarmers(result as Farmer[]);
    } catch (error) {
      console.error(
        'Failed to load farmers:',
        error,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadFarmers();
    }, [profile?.dairyId]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadFarmers();
  }

  function handleAddFarmer() {
    router.push('/owner/farmers/add');
  }

  function handleFarmerPress(farmerId: string) {
    router.push(`/owner/farmers/${farmerId}`);
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Farmers"
        subtitle={`${farmers.length} farmer${
          farmers.length !== 1 ? 's' : ''
        }`}
        rightAction={
          <Button
            title="+ Add"
            onPress={handleAddFarmer}
            size="small"
          />
        }
      />

      {farmers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>
            👨‍🌾
          </Text>

          <Text style={styles.emptyTitle}>
            No farmers yet
          </Text>

          <Text style={styles.emptyText}>
            Add your first farmer to start
            recording milk collection.
          </Text>

          <Button
            title="+ Add Farmer"
            onPress={handleAddFarmer}
            size="large"
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={farmers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FarmerCard
              name={item.name}
              mobile={item.mobile}
              milkTypes={item.milkTypes}
              onPress={() =>
                handleFarmerPress(item.id)
              }
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },

  title: {
    ...typography.title,
    color: colors.text,
  },

  count: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  list: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxxl,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },

  emptyIcon: {
    fontSize: 55,
  },

  emptyTitle: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.md,
  },

  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: spacing.sm,
  },

  emptyButton: {
    marginTop: spacing.xl,
  },
});