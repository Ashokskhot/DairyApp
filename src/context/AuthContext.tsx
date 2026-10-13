import {
  onAuthStateChanged,
  User,
} from 'firebase/auth';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  doc,
  onSnapshot,
} from 'firebase/firestore';

import { auth } from '../services/authService';
import { db } from '../firebase/firestore';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'farmer';
  dairyId?: string;
  farmerId?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext =
  createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
  });

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let unsubscribeProfile:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          console.log(
            'Auth state changed:',
            currentUser?.uid,
          );

          setUser(currentUser);

          // Remove previous profile listener
          if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = undefined;
          }

          // User logged out
          if (!currentUser) {
            setProfile(null);
            setLoading(false);
            return;
          }

          // User logged in
          const profileRef = doc(
            db,
            'users',
            currentUser.uid,
          );

          unsubscribeProfile =
            onSnapshot(
              profileRef,
              (snapshot) => {
                if (snapshot.exists()) {
                  const data =
                    snapshot.data();

                  setProfile({
                    id: snapshot.id,
                    ...data,
                  } as UserProfile);
                } else {
                  console.warn(
                    'User profile not found:',
                    currentUser.uid,
                  );

                  setProfile(null);
                }

                setLoading(false);
              },
              (error) => {
                console.error(
                  'Profile listener error:',
                  error,
                );

                setProfile(null);
                setLoading(false);
              },
            );
        },
      );

    return () => {
      unsubscribeAuth();

      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}