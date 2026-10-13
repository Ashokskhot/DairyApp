import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../firebase/firestore';

export async function createUserProfile(
  userId: string,
  data: {
    name: string;
    email: string;
    role: 'owner' | 'farmer';
    dairyId?: string;
    farmerId?: string;
  },
) {
  await setDoc(doc(db, 'users', userId), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(userId: string) {
  const snapshot = await getDoc(
    doc(db, 'users', userId),
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
  },
) {
  await updateDoc(
    doc(db, 'users', userId),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
  );
}