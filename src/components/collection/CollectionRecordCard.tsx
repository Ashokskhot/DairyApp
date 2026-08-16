import { StyleSheet, Text, View } from 'react-native';

import { MilkCollection } from '../../services/collectionService';

interface CollectionRecordCardProps {
  item: MilkCollection;
}

export default function CollectionRecordCard({
  item,
}: CollectionRecordCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.farmerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.farmerName
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.nameContainer}>
            <Text style={styles.farmerName}>
              {item.farmerName}
            </Text>

            <Text style={styles.meta}>
              {item.animalType === 'cow'
                ? '🐄 Cow'
                : '🐃 Buffalo'}{' '}
              •{' '}
              {item.session === 'morning'
                ? 'Morning'
                : 'Evening'}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            ₹{item.amount.toFixed(2)}
          </Text>

          <Text style={styles.rate}>
            ₹{item.rate.toFixed(2)}/L
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <Detail
          label="Quantity"
          value={`${item.quantity.toFixed(2)} L`}
        />

        <Detail
          label="FAT"
          value={`${item.fat.toFixed(1)}%`}
        />

        <Detail
          label="SNF"
          value={`${item.snf.toFixed(1)}%`}
        />
      </View>

      {item.date && (
        <Text style={styles.date}>
          {formatDate(item.date)}
        </Text>
      )}
    </View>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-');

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 10,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  farmerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2E7D32',
  },

  nameContainer: {
    flex: 1,
    marginLeft: 12,
  },

  farmerName: {
    fontSize: 16,
    fontWeight: '700',
  },

  meta: {
    color: '#777',
    fontSize: 13,
    marginTop: 4,
  },

  amountContainer: {
    alignItems: 'flex-end',
  },

  amount: {
    fontSize: 17,
    fontWeight: '700',
  },

  rate: {
    color: '#777',
    fontSize: 12,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 14,
  },

  detailsRow: {
    flexDirection: 'row',
  },

  detail: {
    flex: 1,
  },

  detailLabel: {
    color: '#888',
    fontSize: 12,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },

  date: {
    color: '#888',
    fontSize: 12,
    marginTop: 12,
  },
});