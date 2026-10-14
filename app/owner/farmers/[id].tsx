import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button, ScreenHeader } from '../../../src/components/ui';
import { useAuth } from '../../../src/context/AuthContext';
import {
  getFarmerMilkCollections,
  type MilkCollection,
} from '../../../src/services/collectionService';
import { getFarmerById } from '../../../src/services/farmerService';

interface Farmer {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  milkTypes: {
    cow: boolean;
    buffalo: boolean;
  };
  active: boolean;
}

export default function FarmerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);

  const [collections, setCollections] = useState<MilkCollection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collectionsError, setCollectionsError] = useState(false);

  const loadFarmer = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setFarmer(null);
      return;
    }

    try {
      setLoading(true);

      const result = await getFarmerById(id);

      if (!result) {
        setFarmer(null);

        Alert.alert(
          'Farmer not found',
          'This farmer could not be found.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ],
        );

        return;
      }

      setFarmer(result as Farmer);
    } catch (error) {
      console.error('Failed to load farmer:', error);

      Alert.alert(
        'Error',
        'Unable to load farmer details.',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadCollections = useCallback(async () => {
    if (!id || !profile?.dairyId) {
      setCollections([]);
      setCollectionsLoading(false);
      return;
    }

    try {
      setCollectionsLoading(true);
      setCollectionsError(false);

      const result = await getFarmerMilkCollections(
        profile.dairyId,
        id,
      );

      setCollections(result);
    } catch (error) {
      console.error(
        'Failed to load farmer collections:',
        error,
      );

      setCollections([]);
      setCollectionsError(true);
    } finally {
      setCollectionsLoading(false);
    }
  }, [id, profile?.dairyId]);

  useEffect(() => {
    void loadFarmer();
    void loadCollections();
  }, [loadFarmer, loadCollections]);

  function getMilkType() {
    if (!farmer) {
      return '';
    }

    if (farmer.milkTypes.cow && farmer.milkTypes.buffalo) {
      return 'Cow + Buffalo';
    }

    if (farmer.milkTypes.cow) {
      return 'Cow';
    }

    if (farmer.milkTypes.buffalo) {
      return 'Buffalo';
    }

    return 'Not specified';
  }

  const totalMilk = collections.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const totalAmount = collections.reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!farmer) {
    return (
      <View style={styles.center}>
        <Text>Farmer not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Farmer Details"
        showBack
        onBackPress={() => router.back()}
        rightAction={
          <Text
            style={styles.editText}
            onPress={() => router.push(`/owner/farmers/${id}/edit`)}
          >
            Edit
          </Text>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {farmer.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>{farmer.name}</Text>
          <Text style={styles.mobile}>{farmer.mobile}</Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {farmer.active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Farmer Information */}
        <Text style={styles.sectionTitle}>
          Farmer Information
        </Text>

        <View style={styles.card}>
          <InfoRow
            label="Mobile"
            value={farmer.mobile}
          />

          <InfoRow
            label="Address"
            value={farmer.address || 'Not provided'}
          />

          <InfoRow
            label="Milk Type"
            value={getMilkType()}
            last
          />
        </View>

        {/* Milk Types */}
        <Text style={styles.sectionTitle}>Milk Types</Text>

        <View style={styles.milkRow}>
          {farmer.milkTypes.cow && (
            <View style={styles.milkCard}>
              <Text style={styles.milkIcon}>🐄</Text>
              <Text style={styles.milkTitle}>Cow</Text>
              <Text style={styles.milkSubtitle}>Cow milk</Text>
            </View>
          )}

          {farmer.milkTypes.buffalo && (
            <View style={styles.milkCard}>
              <Text style={styles.milkIcon}>🐃</Text>
              <Text style={styles.milkTitle}>Buffalo</Text>
              <Text style={styles.milkSubtitle}>Buffalo milk</Text>
            </View>
          )}
        </View>

        {/* Account Summary */}
        <Text style={styles.sectionTitle}>
          Account Summary
        </Text>

        <View style={styles.summaryGrid}>
          <SummaryCard
            title="Total Milk"
            value={`${totalMilk.toFixed(2)} L`}
          />

          <SummaryCard
            title="Total Amount"
            value={`₹${totalAmount.toFixed(2)}`}
          />

          <SummaryCard
            title="Paid"
            value="Not tracked"
          />

          <SummaryCard
            title="Balance"
            value="Not tracked"
          />
        </View>

        {/* Collection History */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>
            Collection History
          </Text>

          {!collectionsLoading && !collectionsError && (
            <Text style={styles.collectionCount}>
              {collections.length}{' '}
              {collections.length === 1 ? 'record' : 'records'}
            </Text>
          )}
        </View>

        {collectionsLoading ? (
          <View style={styles.emptyHistory}>
            <ActivityIndicator size="small" />
            <Text style={styles.historyText}>
              Loading collections...
            </Text>
          </View>
        ) : collectionsError ? (
          <View style={styles.emptyHistory}>
            <Text style={styles.historyTitle}>
              Unable to load collections
            </Text>

            <Text style={styles.historyText}>
              Please check your connection and try again.
            </Text>

            <Text
              style={styles.retryText}
              onPress={() => void loadCollections()}
            >
              Retry
            </Text>
          </View>
        ) : collections.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Text style={styles.historyIcon}>🥛</Text>

            <Text style={styles.historyTitle}>
              No collection yet
            </Text>

            <Text style={styles.historyText}>
              Milk collection records will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.collectionList}>
            {collections.map((item, index) => (
              <View
                key={
                  item.id ??
                  `${item.date}-${item.session}-${index}`
                }
                style={styles.collectionCard}
              >
                <View style={styles.collectionHeader}>
                  <View style={styles.collectionHeading}>
                    <Text style={styles.collectionDate}>
                      {item.date}
                    </Text>

                    <Text style={styles.collectionMeta}>
                      {item.session === 'morning'
                        ? 'Morning'
                        : 'Evening'}{' '}
                      ·{' '}
                      {item.animalType === 'cow'
                        ? 'Cow'
                        : 'Buffalo'}
                    </Text>
                  </View>

                  <Text style={styles.collectionAmount}>
                    ₹{Number(item.amount || 0).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.collectionDetails}>
                  <Text style={styles.collectionMeta}>
                    Quantity: {Number(item.quantity || 0).toFixed(2)} L
                  </Text>

                  <Text style={styles.collectionMeta}>
                    Rate: ₹{Number(item.rate || 0).toFixed(2)}/L
                  </Text>
                </View>

                <View style={styles.collectionDetails}>
                  <Text style={styles.collectionMeta}>
                    FAT: {Number(item.fat || 0).toFixed(1)}%
                  </Text>

                  <Text style={styles.collectionMeta}>
                    SNF: {Number(item.snf || 0).toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
        last && styles.infoRowLast,
      ]}
    >
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
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

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  editText: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 15,
  },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
  },

  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2E7D32',
  },

  name: {
    fontSize: 23,
    fontWeight: '700',
    marginTop: 12,
  },

  mobile: {
    color: '#777',
    marginTop: 5,
  },

  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },

  statusText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 13,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 18,
  },

  infoRow: {
    minHeight: 55,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'center',
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoLabel: {
    fontSize: 13,
    color: '#888',
  },

  infoValue: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: '500',
  },

  milkRow: {
    flexDirection: 'row',
    gap: 10,
  },

  milkCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
  },

  milkIcon: {
    fontSize: 32,
  },

  milkTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },

  milkSubtitle: {
    color: '#777',
    marginTop: 3,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  summaryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 17,
  },

  summaryTitle: {
    color: '#777',
    fontSize: 13,
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },

  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  collectionCount: {
    color: '#777',
    fontSize: 13,
    marginTop: 14,
  },

  emptyHistory: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
  },

  historyIcon: {
    fontSize: 40,
  },

  historyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },

  historyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
  },

  retryText: {
    color: '#2E7D32',
    fontWeight: '700',
    marginTop: 15,
    padding: 5,
  },

  collectionList: {
    gap: 12,
  },

  collectionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
  },

  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  collectionHeading: {
    flex: 1,
  },

  collectionDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },

  collectionMeta: {
    fontSize: 13,
    color: '#777',
    marginTop: 5,
  },

  collectionAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2E7D32',
  },

  collectionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
});