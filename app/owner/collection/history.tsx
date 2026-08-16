import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../../src/context/AuthContext';
import {
  getMilkCollectionHistory,
  MilkCollection,
} from '../../../src/services/collectionService';

// import ScreenHeader from '../../../src/components/ui/ScreenHeader';
import CollectionRecordCard from '../../../src/components/collection/CollectionRecordCard';
import { ScreenHeader } from '../../../src/components/ui';

export default function CollectionHistoryScreen() {
  const { profile } = useAuth();

  const [collections, setCollections] = useState<
    MilkCollection[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!profile?.dairyId) {
      setCollections([]);
      setLoading(false);
      return;
    }

    try {
      const result =
        await getMilkCollectionHistory(
          profile.dairyId,
        );

      setCollections(result);
    } catch (error) {
      console.error(
        'Failed to load collection history:',
        error,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.dairyId]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadHistory();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Collection History"
        showBack
      />

      {collections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>
            🥛
          </Text>

          <Text style={styles.emptyTitle}>
            No collection history
          </Text>

          <Text style={styles.emptyText}>
            Previous milk collection records
            will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <CollectionRecordCard
              item={item}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  list: {
    padding: 20,
    paddingBottom: 40,
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 35,
  },

  emptyIcon: {
    fontSize: 50,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '700',
    marginTop: 15,
  },

  emptyText: {
    textAlign: 'center',
    color: '#777',
    lineHeight: 21,
    marginTop: 8,
  },
});