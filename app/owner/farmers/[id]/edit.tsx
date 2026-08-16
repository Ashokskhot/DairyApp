import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  getFarmerById,
  updateFarmer,
} from '../../../../src/services/farmerService';

import {
  Button,
  Input,
  ScreenHeader,
} from '../../../../src/components/ui';

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

export default function EditFarmerScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [farmer, setFarmer] =
    useState<Farmer | null>(null);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');

  const [cow, setCow] = useState(false);
  const [buffalo, setBuffalo] = useState(false);
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      const data = result as Farmer;

      setFarmer(data);

      setName(data.name || '');
      setMobile(data.mobile || '');
      setAddress(data.address || '');

      setCow(data.milkTypes?.cow ?? false);
      setBuffalo(
        data.milkTypes?.buffalo ?? false,
      );

      setActive(data.active ?? true);
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

  async function handleSave() {
    if (!id) {
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
      setSaving(true);

      await updateFarmer(id, {
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        milkTypes: {
          cow,
          buffalo,
        },
        active,
      });

      Alert.alert(
        'Farmer updated',
        'Farmer details have been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace(
                `/owner/farmers/${id}`,
              ),
          },
        ],
      );
    } catch (error) {
      console.error(
        'Failed to update farmer:',
        error,
      );

      Alert.alert(
        'Failed',
        'Unable to update farmer. Please try again.',
      );
    } finally {
      setSaving(false);
    }
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
        title="Edit Farmer"
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
            This farmer supplies both cow and
            buffalo milk.
          </Text>
        )}

        <Text style={styles.sectionTitle}>
          Farmer Status
        </Text>

        <View style={styles.option}>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>
              Active Farmer
            </Text>

            <Text style={styles.optionDescription}>
              {active
                ? 'Farmer can be used for milk collection'
                : 'Farmer is currently inactive'}
            </Text>
          </View>

          <Switch
            value={active}
            onValueChange={setActive}
          />
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
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

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingRight: 10,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  optionDescription: {
    color: '#777',
    marginTop: 4,
    lineHeight: 18,
  },

  bothText: {
    color: '#2E7D32',
    marginTop: 2,
    marginBottom: 5,
  },

  button: {
    marginTop: 20,
  },
});