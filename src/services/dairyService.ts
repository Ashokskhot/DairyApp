import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../firebase/firestore';

export async function createDairy(data: {
  name: string;
  ownerId: string;
}) {
  const dairyRef = await addDoc(collection(db, 'dairies'), {
    name: data.name,
    ownerId: data.ownerId,
    createdAt: serverTimestamp(),
  });

  return dairyRef.id;
}