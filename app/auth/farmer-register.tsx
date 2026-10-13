import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Button,
  Input,
  ScreenHeader,
} from '../../src/components/ui';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../src/theme';

import {
  registerUser,
} from '../../src/services/authService';

import {
  getFarmerByMobile,
} from '../../src/services/farmerService';

import {
  createUserProfile,
} from '../../src/services/userService';

export default function FarmerRegisterScreen() {
  const [mobile, setMobile] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function handleRegister() {
    const normalizedMobile =
      mobile.trim();

    const normalizedEmail =
      email.trim();

    if (!normalizedMobile) {
      Alert.alert(
        'Required',
        'Please enter your registered mobile number.',
      );
      return;
    }

    if (normalizedMobile.length !== 10) {
      Alert.alert(
        'Invalid mobile number',
        'Please enter a valid 10-digit mobile number.',
      );
      return;
    }

    if (!normalizedEmail) {
      Alert.alert(
        'Required',
        'Please enter your email address.',
      );
      return;
    }

    if (!password) {
      Alert.alert(
        'Required',
        'Please enter a password.',
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak password',
        'Password must contain at least 6 characters.',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password mismatch',
        'Passwords do not match.',
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * Step 1:
       * Find the farmer created by the dairy owner.
       */
      const farmer =
        await getFarmerByMobile(
          normalizedMobile,
        );

      if (!farmer) {
        Alert.alert(
          'Farmer not found',
          'No active farmer account was found with this mobile number. Please contact your dairy owner.',
        );

        return;
      }

      /*
       * Step 2:
       * Create Firebase Authentication account.
       */
      const firebaseUser =
        await registerUser(
          normalizedEmail,
          password,
        );

      /*
       * Step 3:
       * Create the application user profile.
       */
      await createUserProfile(
        firebaseUser.uid,
        {
          name: farmer.name,
          email: normalizedEmail,
          role: 'farmer',
          dairyId: farmer.dairyId,
          farmerId: farmer.id,
        },
      );

      Alert.alert(
        'Registration successful',
        'Your farmer account has been created successfully.',
        [
          {
            text: 'Continue',
            onPress: () => {
              router.replace('/');
            },
          },
        ],
      );
    } catch (error: any) {
      console.error(
        'Farmer registration error:',
        error,
      );

      Alert.alert(
        'Registration failed',
        error?.message ||
          'Unable to create your account. Please try again.',
      );
    } finally {
      setLoading(false);
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
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Farmer Registration"
          showBack
          onBack={() => router.back()}
        />

        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>
              👨‍🌾
            </Text>
          </View>

          <Text style={styles.title}>
            Create Your Account
          </Text>

          <Text style={styles.subtitle}>
            Use the mobile number registered
            with your dairy owner.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Registered Mobile Number"
            placeholder="Enter 10-digit mobile number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            maxLength={10}
            required
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            required
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            required
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={
              setConfirmPassword
            }
            secureTextEntry
            required
          />

          <Button
            title={
              loading
                ? 'Creating Account...'
                : 'Create Account'
            }
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
          />
        </View>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() =>
            router.push(
              '/auth/farmer-login',
            )
          }
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginTextBold}>
              Login
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },

  headerContent: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxxl,
  },

  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: radius.round,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  icon: {
    fontSize: 36,
  },

  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 310,
  },

  form: {
    width: '100%',
  },

  registerButton: {
    marginTop: spacing.md,
  },

  loginLink: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },

  loginText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  loginTextBold: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
});