import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../firebase/firestore';

import { FarmerMilkTypes } from '../types/Farmer';

interface CreateFarmerData {
  dairyId: string;
  name: string;
  mobile: string;
  address?: string;
  milkTypes: FarmerMilkTypes;
}

export async function createFarmer(
  data: CreateFarmerData,
) {
  const farmerRef = await addDoc(
    collection(db, 'farmers'),
    {
      dairyId: data.dairyId,
      name: data.name.trim(),
      mobile: data.mobile.trim(),
      address: data.address?.trim() || '',
      milkTypes: data.milkTypes,
      active: true,
      createdAt: serverTimestamp(),
    },
  );

  return farmerRef.id;
}

export async function getFarmers(
  dairyId: string,
) {
  const q = query(
    collection(db, 'farmers'),
    where('dairyId', '==', dairyId),
    where('active', '==', true),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getFarmerById(
  farmerId: string,
) {
  const farmerRef = doc(db, 'farmers', farmerId);

  const snapshot = await getDoc(farmerRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function updateFarmer(
  farmerId: string,
  data: {
    name: string;
    mobile: string;
    address?: string;
    milkTypes: FarmerMilkTypes;
    active: boolean;
  },
) {
  const farmerRef = doc(db, 'farmers', farmerId);

  await updateDoc(farmerRef, {
    name: data.name.trim(),
    mobile: data.mobile.trim(),
    address: data.address?.trim() || '',
    milkTypes: data.milkTypes,
    active: data.active,
  });
}

export async function getFarmerByMobile(
  mobile: string,
) {
  const q = query(
    collection(db, 'farmers'),
    where('mobile', '==', mobile.trim()),
    where('active', '==', true),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const farmerDoc = snapshot.docs[0];

  return {
    id: farmerDoc.id,
    ...farmerDoc.data(),
  };
}