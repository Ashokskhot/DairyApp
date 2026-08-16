import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAUkmgRKjAlMu62VWJI1PPK9oE-pMAeK-4",
  authDomain: "dairyapp-348fd.firebaseapp.com",
  projectId: "dairyapp-348fd",
  storageBucket: "dairyapp-348fd.firebasestorage.app",
  messagingSenderId: "512972161113",
  appId: "1:512972161113:web:9d850bf9c585b0b27b7148"
};

export const firebaseApp =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];