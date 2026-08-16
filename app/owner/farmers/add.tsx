import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../../../src/context/AuthContext';
import { createFarmer } from '../../../src/services/farmerService';

import {
  Button,
  Input,
  ScreenHeader,
} from '../../../src/components/ui';

export default function AddFarmer() {
  const { profile } = useAuth();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');

  const [cow, setCow] = useState(false);
  const [buffalo, setBuffalo] = useState(false);

  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!profile?.dairyId) {
      Alert.alert(
        'Error',
        'Dairy information is not available. Please login again.',
      );
      return;
    }

    if (!name.trim()) {
      Alert.alert(
        'Required',
        'Please enter farmer name.',
      );
      return;
    }

    if (!mobile.trim()) {
      Alert.alert(
        'Required',
        'Please enter mobile number.',
      );
      return;
    }

    if (!cow && !buffalo) {
      Alert.alert(
        'Milk type required',
        'Please select Cow, Buffalo, or both.',
      );
      return;
    }

    try {
      setLoading(true);

      await createFarmer({
        dairyId: profile.dairyId,
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        milkTypes: {
          cow,
          buffalo,
        },
      });

      Alert.alert(
        'Farmer added',
        'Farmer has been added successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace('/owner/(tabs)/farmers'),
          },
        ],
      );
    } catch (error) {
      console.error(
        'Failed to create farmer:',
        error,
      );

      Alert.alert(
        'Failed',
        'Unable to add farmer. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Add Farmer"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Farmer Name"
          placeholder="Enter farmer name"
          value={name}
          onChangeText={setName}
          required
        />

        <Input
          label="Mobile Number"
          placeholder="Enter mobile number"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          maxLength={10}
          required
        />

        <Input
          label="Address"
          placeholder="Enter address"
          value={address}
          onChangeText={setAddress}
          multiline
          style={styles.addressInput}
        />

        <Text style={styles.sectionTitle}>
          Milk Type
        </Text>

        <View style={styles.option}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>
              🐄 Cow
            </Text>

            <Text style={styles.optionDescription}>
              Farmer supplies cow milk
            </Text>
          </View>

          <Switch
            value={cow}
            onValueChange={setCow}
          />
        </View>

        <View style={styles.option}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>
              🐃 Buffalo
            </Text>

            <Text style={styles.optionDescription}>
              Farmer supplies buffalo milk
            </Text>
          </View>

          <Switch
            value={buffalo}
            onValueChange={setBuffalo}
          />
        </View>

        {cow && buffalo && (
          <Text style={styles.bothText}>
            This farmer supplies both cow and buffalo milk.
          </Text>
        )}

        <Button
          title="Save Farmer"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.button}
        />
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

  addressInput: {
    height: 90,
    textAlignVertical: 'top',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,

    padding: 15,
    marginBottom: 10,
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  optionDescription: {
    color: '#777',
    marginTop: 4,
  },

  bothText: {
    color: '#2E7D32',
    marginTop: 5,
    marginBottom: 5,
  },

  button: {
    marginTop: 20,
  },
});