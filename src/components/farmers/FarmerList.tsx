import { router } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function FarmersTab() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Farmers
          </Text>

          <Text style={styles.subtitle}>
            Manage your farmers
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push('/owner/farmers/add')
          }
        >
          <Text style={styles.addText}>
            + Add
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.openButton}
        onPress={() =>
          router.push('/owner/farmers')
        }
      >
        <Text style={styles.openText}>
          View Farmers
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
    padding: 20,
    paddingTop: 60,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    color: '#777',
    marginTop: 4,
  },

  addButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  addText: {
    color: '#fff',
    fontWeight: '700',
  },

  openButton: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginTop: 25,
  },

  openText: {
    fontSize: 16,
    fontWeight: '600',
  },
});