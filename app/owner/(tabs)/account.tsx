import { router } from 'expo-router';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { logoutUser } from '../../../src/services/authService';
import { useAuth } from '../../../src/context/AuthContext';

export default function AccountScreen() {
  const { user } = useAuth();

  async function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();

              router.replace('/auth/role-selection');
            } catch (error) {
              console.error(
                'Logout error:',
                error,
              );

              Alert.alert(
                'Logout failed',
                'Unable to logout. Please try again.',
              );
            }
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Account
      </Text>

      <Text style={styles.subtitle}>
        Manage your dairy account
      </Text>

      {/* User information */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            Dairy Owner
          </Text>

          <Text style={styles.email}>
            {user?.email}
          </Text>
        </View>
      </View>

      {/* Account options */}
      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionIcon}>
          👤
        </Text>

        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>
            Profile
          </Text>

          <Text style={styles.optionSubtitle}>
            Manage your profile
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionIcon}>
          🏪
        </Text>

        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>
            Dairy Information
          </Text>

          <Text style={styles.optionSubtitle}>
            Manage dairy details
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutIcon}>
          🚪
        </Text>

        <Text style={styles.logoutText}>
          Logout
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

  title: {
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    color: '#777',
    marginTop: 5,
    marginBottom: 25,
  },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E7D32',
  },

  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },

  profileName: {
    fontSize: 17,
    fontWeight: '700',
  },

  email: {
    color: '#777',
    marginTop: 4,
  },

  option: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  optionIcon: {
    fontSize: 23,
    width: 40,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  optionSubtitle: {
    color: '#777',
    marginTop: 3,
  },

  arrow: {
    fontSize: 27,
    color: '#aaa',
  },

  logoutButton: {
    marginTop: 25,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E53935',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  logoutText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '700',
  },
});