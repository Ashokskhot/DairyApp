import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { db } from '../firebase/firestore';

export type AnimalType = 'cow' | 'buffalo';
export type MilkSession = 'morning' | 'evening';

export interface MilkCollection {
  id?: string;

  dairyId: string;
  farmerId: string;
  farmerName: string;

  animalType: AnimalType;

  date: string;
  session: MilkSession;

  quantity: number;
  fat: number;
  snf: number;
  rate: number;
  amount: number;

  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'milkCollections';

const milkCollectionRef = collection(
  db,
  COLLECTION_NAME,
);

/**
 * Save milk collection
 */
export async function saveMilkCollection(
  data: Omit<
    MilkCollection,
    'id' | 'createdAt' | 'updatedAt'
  >,
) {
  const docRef = await addDoc(
    milkCollectionRef,
    {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );

  return docRef.id;
}

/**
 * Get today's milk collections for a dairy
 */
export async function getTodayMilkCollections(
  dairyId: string,
): Promise<MilkCollection[]> {
  const today = getTodayDate();

  const q = query(
    milkCollectionRef,
    where('dairyId', '==', dairyId),
    where('date', '==', today),
    orderBy('createdAt', 'desc'),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  })) as MilkCollection[];
}

/**
 * Get all milk collections for a farmer
 */
export async function getFarmerMilkCollections(
  dairyId: string,
  farmerId: string,
): Promise<MilkCollection[]> {
  const q = query(
    milkCollectionRef,
    where('dairyId', '==', dairyId),
    where('farmerId', '==', farmerId),
    orderBy('date', 'desc'),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  })) as MilkCollection[];
}

/**
 * Get today's date in YYYY-MM-DD format.
 */
function getTodayDate(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    now.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export async function getMilkCollectionsByDateRange(
  dairyId: string,
  startDate: string,
  endDate: string,
): Promise<MilkCollection[]> {
  const q = query(
    milkCollectionRef,
    where('dairyId', '==', dairyId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc'),
    orderBy('createdAt', 'desc'),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  })) as MilkCollection[];
}

export async function getMilkCollectionHistory(
  dairyId: string,
  fromDate: string,
  toDate: string,
): Promise<MilkCollection[]> {
  const q = query(
    milkCollectionRef,
    where('dairyId', '==', dairyId),
    where('date', '>=', fromDate),
    where('date', '<=', toDate),
    orderBy('date', 'desc'),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  })) as MilkCollection[];
}