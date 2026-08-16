import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../../src/context/AuthContext';
import { getFarmers } from '../../../src/services/farmerService';
import {
  AnimalType,
  MilkSession,
  saveMilkCollection,
} from '../../../src/services/collectionService';
import {
  calculateMilkAmount,
  getCowRate,
} from '../../../src/services/rateService';
import { Input } from '../../../src/components/ui';

interface Farmer {
  id: string;
  name: string;
  mobile: string;
  milkTypes: {
    cow: boolean;
    buffalo: boolean;
  };
}

function getTodayDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function CollectMilkScreen() {
  const { profile } = useAuth();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [farmerId, setFarmerId] = useState('');

  const [animalType, setAnimalType] =
    useState<AnimalType>('cow');

  const [session, setSession] =
    useState<MilkSession>('morning');

  const [quantity, setQuantity] = useState('');
  const [fat, setFat] = useState('');
  const [snf, setSnf] = useState('');

  const [saving, setSaving] = useState(false);

  const selectedFarmer = useMemo(
    () =>
      farmers.find(
        (farmer) => farmer.id === farmerId,
      ),
    [farmers, farmerId],
  );

  /*
   * Search farmers by name or mobile number.
   */
  const filteredFarmers = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) {
      return [];
    }

    return farmers.filter(
      (farmer) =>
        farmer.name.toLowerCase().includes(search) ||
        farmer.mobile.includes(search),
    );
  }, [farmers, searchText]);

  /*
   * Calculate Cow rate from FAT + SNF.
   *
   * Example:
   * FAT = 3.5
   * SNF = 8.5
   * Rate = 36.00
   */
  const rate = useMemo(() => {
    if (animalType !== 'cow') {
      return null;
    }

    if (!fat.trim() || !snf.trim()) {
      return null;
    }

    const fatValue = Number(fat);
    const snfValue = Number(snf);

    if (
      Number.isNaN(fatValue) ||
      Number.isNaN(snfValue)
    ) {
      return null;
    }

    return getCowRate(fatValue, snfValue);
  }, [animalType, fat, snf]);

  /*
   * Calculate total amount.
   *
   * Keep the actual business calculation inside
   * rateService.ts.
   */
  const amount = useMemo(() => {
    if (animalType !== 'cow') {
      return null;
    }

    if (!quantity.trim() || rate === null) {
      return null;
    }

    const quantityValue = Number(quantity);

    if (
      Number.isNaN(quantityValue) ||
      quantityValue <= 0
    ) {
      return null;
    }

    const fatValue = Number(fat);
    const snfValue = Number(snf);

    return calculateMilkAmount(
      quantityValue,
      fatValue,
      snfValue,
    );
  }, [
    animalType,
    quantity,
    fat,
    snf,
    rate,
  ]);

  useEffect(() => {
    loadFarmers();
  }, [profile?.dairyId]);

  async function loadFarmers() {
    if (!profile?.dairyId) {
      setLoadingFarmers(false);
      return;
    }

    try {
      setLoadingFarmers(true);

      const result = await getFarmers(
        profile.dairyId,
      );

      setFarmers(result as Farmer[]);
    } catch (error) {
      console.error(
        'Failed to load farmers:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to load farmers.',
      );
    } finally {
      setLoadingFarmers(false);
    }
  }

  function handleSelectFarmer(
    farmer: Farmer,
  ) {
    setFarmerId(farmer.id);
    setSearchText(farmer.name);

    /*
     * Automatically select animal type when
     * farmer supplies only one type.
     */
    if (
      farmer.milkTypes.cow &&
      !farmer.milkTypes.buffalo
    ) {
      setAnimalType('cow');
    }

    if (
      farmer.milkTypes.buffalo &&
      !farmer.milkTypes.cow
    ) {
      setAnimalType('buffalo');
    }

    /*
     * If farmer supplies both, keep current
     * selection if valid. Otherwise default to Cow.
     */
    if (
      farmer.milkTypes.cow &&
      farmer.milkTypes.buffalo
    ) {
      if (
        animalType !== 'cow' &&
        animalType !== 'buffalo'
      ) {
        setAnimalType('cow');
      }
    }
  }

  function handleSearchChange(
    value: string,
  ) {
    setSearchText(value);

    /*
     * If user starts changing the selected farmer,
     * clear the previous selection.
     */
    if (
      selectedFarmer &&
      value !== selectedFarmer.name
    ) {
      setFarmerId('');
    }
  }

  function handleAnimalTypeChange(
    type: AnimalType,
  ) {
    if (!selectedFarmer) {
      return;
    }

    if (
      type === 'cow' &&
      !selectedFarmer.milkTypes.cow
    ) {
      return;
    }

    if (
      type === 'buffalo' &&
      !selectedFarmer.milkTypes.buffalo
    ) {
      return;
    }

    setAnimalType(type);

    /*
     * Clear rate-related values when switching
     * milk type because Buffalo calculation is
     * not available yet.
     */
    if (type === 'buffalo') {
      setFat('');
      setSnf('');
    }
  }

  async function handleSave() {
    if (!profile?.dairyId) {
      Alert.alert(
        'Error',
        'Dairy information is not available.',
      );
      return;
    }

    if (!farmerId || !selectedFarmer) {
      Alert.alert(
        'Required',
        'Please select a farmer.',
      );
      return;
    }

    if (!quantity.trim()) {
      Alert.alert(
        'Required',
        'Please enter milk quantity.',
      );
      return;
    }

    const quantityValue = Number(quantity);

    if (
      Number.isNaN(quantityValue) ||
      quantityValue <= 0
    ) {
      Alert.alert(
        'Invalid quantity',
        'Milk quantity must be greater than 0.',
      );
      return;
    }

    if (!fat.trim()) {
      Alert.alert(
        'Required',
        'Please enter FAT.',
      );
      return;
    }

    if (!snf.trim()) {
      Alert.alert(
        'Required',
        'Please enter SNF.',
      );
      return;
    }

    const fatValue = Number(fat);
    const snfValue = Number(snf);

    if (
      Number.isNaN(fatValue) ||
      Number.isNaN(snfValue)
    ) {
      Alert.alert(
        'Invalid value',
        'Please enter valid FAT and SNF values.',
      );
      return;
    }

    /*
     * Cow rate must exist in the chart.
     */
    if (
      animalType === 'cow' &&
      rate === null
    ) {
      Alert.alert(
        'Rate not found',
        'No rate is available for the entered FAT and SNF.',
      );
      return;
    }

    /*
     * Buffalo rate chart is not available yet.
     */
    if (animalType === 'buffalo') {
      Alert.alert(
        'Coming soon',
        'Buffalo milk rate calculation will be added next.',
      );
      return;
    }

    if (amount === null) {
      Alert.alert(
        'Unable to calculate',
        'Please check the quantity, FAT and SNF values.',
      );
      return;
    }

    try {
      setSaving(true);

      const today = getTodayDate();

      await saveMilkCollection({
        dairyId: profile.dairyId,
        farmerId: selectedFarmer.id,
        farmerName: selectedFarmer.name,
        animalType,
        date: today,
        session,
        quantity: quantityValue,
        fat: fatValue,
        snf: snfValue,
        rate: rate!,
        amount,
      });

      Alert.alert(
        'Collection saved',
        `${quantityValue} L collected from ${selectedFarmer.name}.`,
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace(
                '/owner/(tabs)/collection',
              ),
          },
        ],
      );
    } catch (error) {
      console.error(
        'Failed to save milk collection:',
        error,
      );

      Alert.alert(
        'Failed',
        'Unable to save milk collection. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ‹
            </Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            Collect Milk
          </Text>
        </View>

        {/* Farmer */}
        <Text style={styles.sectionTitle}>
          Farmer
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search farmer by name or mobile"
          value={searchText}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
        />

        {loadingFarmers && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />

            <Text style={styles.loadingText}>
              Loading farmers...
            </Text>
          </View>
        )}

        {!loadingFarmers &&
          searchText.trim() !== '' &&
          !selectedFarmer &&
          filteredFarmers.length === 0 && (
            <Text style={styles.noResultText}>
              No farmer found.
            </Text>
          )}

        {!selectedFarmer &&
          filteredFarmers.length > 0 && (
            <View style={styles.searchResults}>
              {filteredFarmers.map(
                (farmer) => (
                  <TouchableOpacity
                    key={farmer.id}
                    style={styles.farmerResult}
                    onPress={() =>
                      handleSelectFarmer(
                        farmer,
                      )
                    }
                  >
                    <View
                      style={styles.avatar}
                    >
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {farmer.name
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.farmerInfo
                      }
                    >
                      <Text
                        style={
                          styles.farmerName
                        }
                      >
                        {farmer.name}
                      </Text>

                      <Text
                        style={
                          styles.farmerMobile
                        }
                      >
                        {farmer.mobile}
                      </Text>
                    </View>

                    <Text
                      style={styles.arrow}
                    >
                      ›
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          )}

        {selectedFarmer && (
          <View
            style={styles.selectedFarmer}
          >
            <View style={styles.avatar}>
              <Text
                style={styles.avatarText}
              >
                {selectedFarmer.name
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <View
              style={styles.farmerInfo}
            >
              <Text
                style={styles.farmerName}
              >
                {selectedFarmer.name}
              </Text>

              <Text
                style={styles.farmerMobile}
              >
                {selectedFarmer.mobile}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setFarmerId('');
                setSearchText('');
              }}
            >
              <Text
                style={styles.changeText}
              >
                Change
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Milk Type */}
        {selectedFarmer && (
          <>
            <Text
              style={styles.sectionTitle}
            >
              Milk Type
            </Text>

            {selectedFarmer.milkTypes.cow &&
              selectedFarmer.milkTypes
                .buffalo && (
                <View
                  style={styles.segmentRow}
                >
                  <TouchableOpacity
                    style={[
                      styles.segment,
                      animalType ===
                        'cow' &&
                        styles.segmentSelected,
                    ]}
                    onPress={() =>
                      handleAnimalTypeChange(
                        'cow',
                      )
                    }
                  >
                    <Text
                      style={
                        styles.segmentIcon
                      }
                    >
                      🐄
                    </Text>

                    <Text
                      style={[
                        styles.segmentText,
                        animalType ===
                          'cow' &&
                          styles.segmentTextSelected,
                      ]}
                    >
                      Cow
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.segment,
                      animalType ===
                        'buffalo' &&
                        styles.segmentSelected,
                    ]}
                    onPress={() =>
                      handleAnimalTypeChange(
                        'buffalo',
                      )
                    }
                  >
                    <Text
                      style={
                        styles.segmentIcon
                      }
                    >
                      🐃
                    </Text>

                    <Text
                      style={[
                        styles.segmentText,
                        animalType ===
                          'buffalo' &&
                          styles.segmentTextSelected,
                      ]}
                    >
                      Buffalo
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            {selectedFarmer.milkTypes.cow &&
              !selectedFarmer.milkTypes
                .buffalo && (
                <View
                  style={styles.singleType}
                >
                  <Text
                    style={
                      styles.singleTypeIcon
                    }
                  >
                    🐄
                  </Text>

                  <Text
                    style={
                      styles.singleTypeText
                    }
                  >
                    Cow milk
                  </Text>
                </View>
              )}

            {selectedFarmer.milkTypes
              .buffalo &&
              !selectedFarmer.milkTypes
                .cow && (
                <View
                  style={styles.singleType}
                >
                  <Text
                    style={
                      styles.singleTypeIcon
                    }
                  >
                    🐃
                  </Text>

                  <Text
                    style={
                      styles.singleTypeText
                    }
                  >
                    Buffalo milk
                  </Text>
                </View>
              )}
          </>
        )}

        {/* Session */}
        {selectedFarmer && (
          <>
            <Text
              style={styles.sectionTitle}
            >
              Session
            </Text>

            <View
              style={styles.sessionRow}
            >
              <TouchableOpacity
                style={[
                  styles.sessionButton,
                  session ===
                    'morning' &&
                    styles.segmentSelected,
                ]}
                onPress={() =>
                  setSession('morning')
                }
              >
                <Text
                  style={styles.segmentIcon}
                >
                  🌅
                </Text>

                <Text
                  style={[
                    styles.sessionText,
                    session ===
                      'morning' &&
                      styles.segmentTextSelected,
                  ]}
                >
                  Morning
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sessionButton,
                  session ===
                    'evening' &&
                    styles.segmentSelected,
                ]}
                onPress={() =>
                  setSession('evening')
                }
              >
                <Text
                  style={styles.segmentIcon}
                >
                  🌙
                </Text>

                <Text
                  style={[
                    styles.sessionText,
                    session ===
                      'evening' &&
                      styles.segmentTextSelected,
                  ]}
                >
                  Evening
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Quantity */}
        {selectedFarmer && (
          <>
            <Text
              style={styles.sectionTitle}
            >
              Milk Quantity
            </Text>

            <Input
              label="Quantity (Litres)"
              placeholder="Enter quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              required
            />

            {/* FAT + SNF */}
            <View style={styles.inputRow}>
              <View
                style={styles.inputHalf}
              >
                <Input
                  label="FAT (%)"
                  placeholder="e.g. 3.5"
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="decimal-pad"
                  required
                />
              </View>

              <View
                style={styles.inputHalf}
              >
                <Input
                  label="SNF (%)"
                  placeholder="e.g. 8.5"
                  value={snf}
                  onChangeText={setSnf}
                  keyboardType="decimal-pad"
                  required
                />
              </View>
            </View>
          </>
        )}

        {/* Calculation */}
        {selectedFarmer && (
          <View
            style={styles.calculationCard}
          >
            <Text
              style={styles.calculationTitle}
            >
              Calculation
            </Text>

            <View
              style={styles.calculationRow}
            >
              <Text
                style={styles.calculationLabel}
              >
                Rate
              </Text>

              <Text
                style={styles.calculationValue}
              >
                {rate !== null
                  ? `₹${rate.toFixed(2)} / L`
                  : '--'}
              </Text>
            </View>

            <View
              style={styles.divider}
            />

            <View
              style={styles.calculationRow}
            >
              <Text
                style={styles.amountLabel}
              >
                Total Amount
              </Text>

              <Text
                style={styles.amountValue}
              >
                {amount !== null
                  ? `₹${amount.toFixed(2)}`
                  : '₹0.00'}
              </Text>
            </View>

            {animalType ===
              'cow' &&
              fat &&
              snf &&
              rate === null && (
                <Text
                  style={styles.rateWarning}
                >
                  No rate found for this
                  FAT/SNF combination.
                </Text>
              )}
          </View>
        )}

        {/* Save */}
        {selectedFarmer && (
          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
                styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text
                style={
                  styles.saveButtonText
                }
              >
                Save Collection
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },

  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  backButton: {
    width: 40,
    marginRight: 5,
  },

  backText: {
    fontSize: 36,
    lineHeight: 40,
    color: '#333',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 10,
  },

  searchInput: {
    height: 52,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  loadingText: {
    marginLeft: 8,
    color: '#777',
  },

  noResultText: {
    color: '#777',
    paddingVertical: 12,
  },

  searchResults: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },

  farmerResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  selectedFarmer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2E7D32',
  },

  farmerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  farmerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  farmerMobile: {
    color: '#777',
    marginTop: 3,
  },

  arrow: {
    fontSize: 28,
    color: '#aaa',
  },

  changeText: {
    color: '#2E7D32',
    fontWeight: '700',
  },

  segmentRow: {
    flexDirection: 'row',
    gap: 10,
  },

  segment: {
    flex: 1,
    minHeight: 70,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },

  segmentSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },

  segmentIcon: {
    fontSize: 24,
  },

  segmentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 3,
  },

  segmentTextSelected: {
    color: '#2E7D32',
  },

  singleType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 15,
  },

  singleTypeIcon: {
    fontSize: 25,
    marginRight: 10,
  },

  singleTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },

  sessionRow: {
    flexDirection: 'row',
    gap: 10,
  },

  sessionButton: {
    flex: 1,
    minHeight: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sessionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 3,
  },

  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },

  inputHalf: {
    flex: 1,
  },

  calculationCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginTop: 10,
  },

  calculationTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 15,
  },

  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  calculationLabel: {
    color: '#777',
    fontSize: 15,
  },

  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 14,
  },

  amountLabel: {
    fontSize: 17,
    fontWeight: '700',
  },

  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
  },

  rateWarning: {
    color: '#B45309',
    fontSize: 13,
    marginTop: 12,
  },

  saveButton: {
    height: 52,
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});