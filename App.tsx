import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.content}>
          <Text style={styles.logo}>🐄</Text>

          <Text style={styles.title}>Dairy App</Text>

          <Text style={styles.subtitle}>
            Simple milk collection and dairy management
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who are you?</Text>

            <TouchableOpacity
              style={styles.roleCard}
              activeOpacity={0.8}
            >
              <View style={styles.roleIconContainer}>
                <Text style={styles.roleIcon}>👨‍🌾</Text>
              </View>

              <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>Dairy Owner</Text>

                <Text style={styles.roleDescription}>
                  Manage farmers, milk collection and payments
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleCard}
              activeOpacity={0.8}
            >
              <View style={styles.roleIconContainer}>
                <Text style={styles.roleIcon}>🧑‍🌾</Text>
              </View>

              <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>Farmer</Text>

                <Text style={styles.roleDescription}>
                  View your milk records, earnings and payments
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 40,
  },

  section: {
    width: '100%',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },

  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    padding: 16,

    marginBottom: 14,

    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  roleIconContainer: {
    width: 52,
    height: 52,

    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#F3F4F6',

    marginRight: 14,
  },

  roleIcon: {
    fontSize: 28,
  },

  roleContent: {
    flex: 1,
  },

  roleTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  roleDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },

  arrow: {
    fontSize: 28,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});