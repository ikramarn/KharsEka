import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { firebaseConfig, hasFirebaseConfig } from '../services/firebaseConfig';

let app = null;
let auth = null;
let _db = null;
let _storage = null;
if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  _db = getFirestore(app);
  _storage = getStorage(app);
}

export const db = _db;
export const storage = _storage;

const AuthContext = createContext({
  user: null,
  initializing: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!auth) {
      setInitializing(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return () => unsub();
  }, [initializing]);

  const signIn = async (email, password) => {
    if (!auth) throw new Error('Firebase is not configured');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email, password, displayName) => {
    if (!auth) throw new Error('Firebase is not configured');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
  };

  const signOutFn = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const updateUserProfile = async (updates) => {
    if (auth?.currentUser) {
      await updateProfile(auth.currentUser, updates);
    }
  };

  return (
    <AuthContext.Provider value={{ user, initializing, signIn, signUp, signOut: signOutFn, updateUserProfile, hasFirebaseConfig }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
