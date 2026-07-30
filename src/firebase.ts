import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// This file is a fallback template. If you already have src/firebase.ts in your project
// with proper configuration, keep that one instead and remove/replace this file.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
