// Fill these from your Firebase project settings
import Constants from 'expo-constants';

const extra = Constants?.expoConfig?.extra?.expoPublicFirebase || {};
const cfg = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || extra.apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || extra.authDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || extra.projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || extra.storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || extra.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || extra.appId,
};

export const hasFirebaseConfig = Boolean(cfg.apiKey && cfg.appId && cfg.projectId);
export const firebaseConfig = hasFirebaseConfig ? cfg : null;
