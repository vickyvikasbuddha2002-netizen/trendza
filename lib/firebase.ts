import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Fast Refresh re-runs this module, and initializeApp throws on a second
// call with the same name.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

// The SDK retries failed uploads for two minutes by default. When something
// is actually wrong — bucket missing, rules denying, no signal — that reads
// to the user as a spinner that never finishes. Fail fast enough to show a
// real message, but slow enough to survive a patchy mobile connection.
storage.maxUploadRetryTime = 20_000;
storage.maxOperationRetryTime = 15_000;
