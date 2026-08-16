import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getFarmerById } from '../../../src/services/farmerService';
import { Button, ScreenHeader } from '../../../src/components/ui';

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
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [farmer, setFarmer] = useState<Farmer | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarmer();
  }, [id]);

  async function loadFarmer() {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const result = await getFarmerById(id);

      if (!result) {
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
      console.error(
        'Failed to load farmer:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to load farmer details.',
      );
    } finally {
      setLoading(false);
    }
  }

  function getMilkType() {
    if (!farmer) {
      return '';
    }

    if (
      farmer.milkTypes.cow &&
      farmer.milkTypes.buffalo
    ) {
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
            onPress={() => router.push(`/owner/farmers/${id}/edit`) }
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
              {farmer.name
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>
            {farmer.name}
          </Text>

          <Text style={styles.mobile}>
            {farmer.mobile}
          </Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {farmer.active
                ? 'Active'
                : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Basic Information */}
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
            value={
              farmer.address || 'Not provided'
            }
          />

          <InfoRow
            label="Milk Type"
            value={getMilkType()}
            last
          />
        </View>

        {/* Milk Types */}
        <Text style={styles.sectionTitle}>
          Milk Types
        </Text>

        <View style={styles.milkRow}>
          {farmer.milkTypes.cow && (
            <View style={styles.milkCard}>
              <Text style={styles.milkIcon}>
                🐄
              </Text>

              <Text style={styles.milkTitle}>
                Cow
              </Text>

              <Text style={styles.milkSubtitle}>
                Cow milk
              </Text>
            </View>
          )}

          {farmer.milkTypes.buffalo && (
            <View style={styles.milkCard}>
              <Text style={styles.milkIcon}>
                🐃
              </Text>

              <Text style={styles.milkTitle}>
                Buffalo
              </Text>

              <Text style={styles.milkSubtitle}>
                Buffalo milk
              </Text>
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
            value="0.00 L"
          />

          <SummaryCard
            title="Total Amount"
            value="₹0"
          />

          <SummaryCard
            title="Paid"
            value="₹0"
          />

          <SummaryCard
            title="Balance"
            value="₹0"
          />
        </View>

        {/* Collection History */}
        <Text style={styles.sectionTitle}>
          Collection History
        </Text>

        <View style={styles.emptyHistory}>
          <Text style={styles.historyIcon}>
            🥛
          </Text>

          <Text style={styles.historyTitle}>
            No collection yet
          </Text>

          <Text style={styles.historyText}>
            Milk collection records will appear
            here.
          </Text>
        </View>
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
      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
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
      <Text style={styles.summaryTitle}>
        {title}
      </Text>

      <Text style={styles.summaryValue}>
        {value}
      </Text>
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
    marginTop: 5,
  },
});