import {
  createUserWithEmailAndPassword,
  getReactNativePersistence,
  initializeAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { firebaseApp } from '../firebase/config';

export const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export async function registerUser(
  email: string,
  password: string,
) {
  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    return result.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function loginUser(
  email: string,
  password: string,
) {
  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    return result.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function logoutUser() {
  await signOut(auth);
}

export function getAuthErrorMessage(error: any): string {
  switch (error?.code) {
    // Login
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please check your details and try again.';

    // Registration
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please login instead.';

    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';

    case 'auth/invalid-email':
      return 'Please enter a valid email address.';

    // General
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';

    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';

    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact the dairy administrator.';

    case 'auth/operation-not-allowed':
      return 'This authentication method is currently unavailable.';

    default:
      console.error('Unhandled Firebase Auth error:', error);

      return 'Something went wrong. Please try again.';
  }
}