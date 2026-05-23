import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCEfpDjHEjlFoIfyXrtBQGixbXBINOFZPw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "duplicate-detection-9e6c8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "duplicate-detection-9e6c8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "duplicate-detection-9e6c8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "91937799892",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:91937799892:web:8fbfa84bc683f845e60541",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PL3DF6PDJ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Offline persistence is disabled to prevent cross-device sync issues and stale cache
// enableIndexedDbPersistence(db).catch((err) => {
//   console.warn("Firebase offline persistence error:", err.code);
// });

// Analytics is only supported in browser environments
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, db, storage, analytics, auth };
