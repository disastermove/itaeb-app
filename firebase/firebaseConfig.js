import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqHuNWtU-HZkUqB8CwoUIPfcUlEQ1Qzos",
  authDomain: "itaeb-inventary.firebaseapp.com",
  projectId: "itaeb-inventary",
  storageBucket: "itaeb-inventary.firebasestorage.app",
  messagingSenderId: "754954494025",
  appId: "1:754954494025:web:30ae079b676c4fe9a21f98",
  measurementId: "G-V9DS3KFM4T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const storage = getStorage(app);
