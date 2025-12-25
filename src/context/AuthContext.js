import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api } from '../api/client';
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
  token: null,
  initializing: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Storage helpers: use SecureStore where available; fall back to localStorage on web
  const storage = {
    getItem: async (key) => {
      try {
        const available = await SecureStore.isAvailableAsync();
        if (available) return await SecureStore.getItemAsync(key);
      } catch {}
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try { return window.localStorage.getItem(key); } catch {}
      }
      return null;
    },
    setItem: async (key, value) => {
      try {
        const available = await SecureStore.isAvailableAsync();
        if (available) { await SecureStore.setItemAsync(key, value); return; }
      } catch {}
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try { window.localStorage.setItem(key, value); } catch {}
      }
    },
    deleteItem: async (key) => {
      try {
        const available = await SecureStore.isAvailableAsync();
        if (available) { await SecureStore.deleteItemAsync(key); return; }
      } catch {}
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try { window.localStorage.removeItem(key); } catch {}
      }
    },
  };

  // If Firebase configured, use Firebase auth listener; else use JWT token path
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      if (auth) {
        unsub = onAuthStateChanged(auth, (u) => {
          setUser(u);
          if (initializing) setInitializing(false);
        });
      } else {
        const saved = await storage.getItem('auth_token');
        if (saved) {
          setToken(saved);
          try {
            const me = await api.me(saved);
            setUser({
              id: me.id,
              email: me.email,
              displayName: me.display_name,
              photoURL: me.photo_url,
            });
          } catch (e) {
            await SecureStore.deleteItemAsync('auth_token');
            setToken(null);
          }
        }
        setInitializing(false);
      }
    })();
    return () => { unsub && unsub(); };
  }, [initializing]);

  const signIn = async (email, password) => {
    if (auth) {
      await signInWithEmailAndPassword(auth, email, password);
      return;
    }
    const { token: tkn, user: u } = await api.signIn(email, password);
    await storage.setItem('auth_token', tkn);
    setToken(tkn);
    setUser({ id: u.id, email: u.email, displayName: u.display_name, photoURL: u.photo_url });
  };

  const signUp = async (email, password, displayName) => {
    if (auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) await updateProfile(cred.user, { displayName });
      return;
    }
    const { token: tkn, user: u } = await api.signUp(email, password, displayName);
    await storage.setItem('auth_token', tkn);
    setToken(tkn);
    setUser({ id: u.id, email: u.email, displayName: u.display_name, photoURL: u.photo_url });
  };

  const signOutFn = async () => {
    if (auth) {
      await signOut(auth);
      return;
    }
    await storage.deleteItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (updates) => {
    if (auth?.currentUser) {
      await updateProfile(auth.currentUser, updates);
      return;
    }
    if (!token) throw new Error('Not authenticated');
    const me = await api.updateProfile(token, {
      displayName: updates.displayName,
      photoURL: updates.photoURL,
    });
    setUser({ id: me.id, email: me.email, displayName: me.display_name, photoURL: me.photo_url });
  };

  return (
    <AuthContext.Provider value={{ user, token, initializing, signIn, signUp, signOut: signOutFn, updateUserProfile, hasFirebaseConfig }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
