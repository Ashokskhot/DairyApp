import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../../src/context/AuthContext';
import {
  AnimalType,
  getMilkCollectionHistory,
  MilkCollection,
} from '../../../src/services/collectionService';

import { ScreenHeader } from '../../../src/components/ui';
import CollectionRecordCard from '../../../src/components/collection/CollectionRecordCard';

type AnimalFilter = 'all' | AnimalType;

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStartOfMonth(): Date {
  const date = new Date();

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  );
}

function getToday(): Date {
  const date = new Date();

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

export default function CollectionHistoryScreen() {
  const { profile } = useAuth();

  const [fromDate, setFromDate] = useState<Date>(
    getStartOfMonth(),
  );

  const [toDate, setToDate] = useState<Date>(
    getToday(),
  );

  const [records, setRecords] = useState<MilkCollection[]>([]);

  const [animalFilter, setAnimalFilter] =
    useState<AnimalFilter>('all');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showFromPicker, setShowFromPicker] =
    useState(false);

  const [showToPicker, setShowToPicker] =
    useState(false);

  const dairyId = profile?.dairyId;

  const loadHistory = useCallback(
    async (
      showLoader = true,
    ) => {
      if (!dairyId) {
        setLoading(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        const result =
          await getMilkCollectionHistory(
            dairyId,
            formatDate(fromDate),
            formatDate(toDate),
          );

        setRecords(result);
      } catch (error) {
        console.error(
          'Failed to load collection history:',
          error,
        );

        Alert.alert(
          'Error',
          'Unable to load collection history.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dairyId, fromDate, toDate],
  );

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  function handleFromDateChange(
    event: any,
    selectedDate?: Date,
  ) {
    setShowFromPicker(false);

    if (!selectedDate) {
      return;
    }

    if (selectedDate > toDate) {
      Alert.alert(
        'Invalid date',
        'From date cannot be after the To date.',
      );
      return;
    }

    setFromDate(selectedDate);
  }

  function handleToDateChange(
    event: any,
    selectedDate?: Date,
  ) {
    setShowToPicker(false);

    if (!selectedDate) {
      return;
    }

    if (selectedDate < fromDate) {
      Alert.alert(
        'Invalid date',
        'To date cannot be before the From date.',
      );
      return;
    }

    setToDate(selectedDate);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadHistory(false);
  }

  const filteredRecords = useMemo(() => {
    if (animalFilter === 'all') {
      return records;
    }

    return records.filter(
      (item) =>
        item.animalType === animalFilter,
    );
  }, [records, animalFilter]);

  const summary = useMemo(() => {
    return filteredRecords.reduce(
      (result, item) => {
        result.totalLitres += item.quantity;
        result.totalAmount += item.amount;
        result.totalRecords += 1;

        return result;
      },
      {
        totalLitres: 0,
        totalAmount: 0,
        totalRecords: 0,
      },
    );
  }, [filteredRecords]);

  const groupedRecords = useMemo(() => {
    const grouped: Record<
      string,
      MilkCollection[]
    > = {};

    filteredRecords.forEach((item) => {
      if (!grouped[item.date]) {
        grouped[item.date] = [];
      }

      grouped[item.date].push(item);
    });

    return Object.entries(grouped);
  }, [filteredRecords]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Collection History"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Date Filters */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() =>
              setShowFromPicker(true)
            }
          >
            <Text style={styles.dateLabel}>
              From
            </Text>

            <Text style={styles.dateValue}>
              {formatDisplayDate(fromDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() =>
              setShowToPicker(true)
            }
          >
            <Text style={styles.dateLabel}>
              To
            </Text>

            <Text style={styles.dateValue}>
              {formatDisplayDate(toDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {showFromPicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            maximumDate={toDate}
            onChange={handleFromDateChange}
          />
        )}

        {showToPicker && (
          <DateTimePicker
            value={toDate}
            mode="date"
            display="default"
            minimumDate={fromDate}
            maximumDate={getToday()}
            onChange={handleToDateChange}
          />
        )}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Collection Summary
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>
                Total Milk
              </Text>

              <Text style={styles.summaryValue}>
                {summary.totalLitres.toFixed(2)} L
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>
                Total Amount
              </Text>

              <Text style={styles.summaryValue}>
                ₹{summary.totalAmount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>
                Records
              </Text>

              <Text style={styles.summaryValue}>
                {summary.totalRecords}
              </Text>
            </View>
          </View>
        </View>

        {/* Animal Filter */}
        <View style={styles.filterContainer}>
          {(
            [
              ['all', 'All'],
              ['cow', '🐄 Cow'],
              ['buffalo', '🐃 Buffalo'],
            ] as const
          ).map(([value, label]) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.filterButton,
                animalFilter === value &&
                  styles.filterButtonSelected,
              ]}
              onPress={() =>
                setAnimalFilter(value)
              }
            >
              <Text
                style={[
                  styles.filterText,
                  animalFilter === value &&
                    styles.filterTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Records */}
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        ) : groupedRecords.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              🥛
            </Text>

            <Text style={styles.emptyTitle}>
              No collection records
            </Text>

            <Text style={styles.emptyText}>
              No milk collection was found for
              the selected dates and filter.
            </Text>
          </View>
        ) : (
          groupedRecords.map(
            ([date, dateRecords]) => (
              <View
                key={date}
                style={styles.dateSection}
              >
                <Text style={styles.dateHeading}>
                  {new Date(
                    `${date}T00:00:00`,
                  ).toLocaleDateString(
                    'en-IN',
                    {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    },
                  )}
                </Text>

                {dateRecords.map((item) => (
                  <CollectionRecordCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </View>
            ),
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },

  dateButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  dateLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 5,
  },

  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },

  summaryCard: {
    backgroundColor: '#2E7D32',
    borderRadius: 18,
    padding: 20,
    marginBottom: 15,
  },

  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },

  summaryRow: {
    flexDirection: 'row',
  },

  summaryItem: {
    flex: 1,
  },

  summaryLabel: {
    color: '#DFF2E1',
    fontSize: 12,
  },

  summaryValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 5,
  },

  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },

  filterButtonSelected: {
    backgroundColor: '#E8F5E9',
  },

  filterText: {
    color: '#777',
    fontSize: 14,
    fontWeight: '600',
  },

  filterTextSelected: {
    color: '#2E7D32',
  },

  loading: {
    paddingVertical: 50,
    alignItems: 'center',
  },

  dateSection: {
    marginBottom: 10,
  },

  dateHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8,
    marginTop: 5,
  },

  empty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },

  emptyText: {
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
  },
});