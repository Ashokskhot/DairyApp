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

import { auth } from '../services/authService';
import { getUserProfile } from '../services/userService';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'farmer';
  dairyId?: string;
  createdAt?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        try {
          setUser(currentUser);

          if (!currentUser) {
            setProfile(null);
            return;
          }

          const userProfile = await getUserProfile(
            currentUser.uid,
          );

          setProfile(
            userProfile as UserProfile | null,
          );
        } catch (error) {
          console.error(
            'Failed to load user profile:',
            error,
          );

          setProfile(null);
        } finally {
          setLoading(false);
        }
      },
    );

    return unsubscribe;
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