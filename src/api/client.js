
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function normalizeBase(base) {
  if (!base) return base;
  try {
    const u = new URL(base);
    // On Android emulator, localhost/127.0.0.1 should map to 10.0.2.2
    if (Platform.OS === 'android' && (u.hostname === 'localhost' || u.hostname === '127.0.0.1')) {
      u.hostname = '10.0.2.2';
      return u.toString();
    }
    return base;
  } catch {
    return base;
  }
}

function getApiBaseUrl() {
  // 1. Use env var if set
  if (process.env.EXPO_PUBLIC_API_BASE_URL) return normalizeBase(process.env.EXPO_PUBLIC_API_BASE_URL);
  // 2. Use app.json extra if set
  if (Constants?.expoConfig?.extra?.apiBaseUrl) return normalizeBase(Constants.expoConfig.extra.apiBaseUrl);

  // 3. Platform-specific logic
  if (Platform.OS === 'web') {
    // Use window.location.hostname for web
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${host}:8080`;
  }
  if (Platform.OS === 'android') {
    // Use 10.0.2.2 for emulator, else fallback to LAN IP
    return 'http://10.0.2.2:8080';
  }
  if (Platform.OS === 'ios') {
    // Use localhost for iOS simulator, else fallback to LAN IP
    return 'http://localhost:8080';
  }
  // Fallback
  return 'http://localhost:8080';
}

const BASE_URL = getApiBaseUrl();

async function request(path, { method = 'GET', body, token, headers } = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    let err = `Request failed: ${url}`;
    try { const data = await res.json(); err = data.error || JSON.stringify(data); } catch {}
    throw new Error(err);
  }
  if (res.headers.get('content-type')?.includes('application/json')) return res.json();
  return res.text();
}

export const api = {
  // Auth
  signUp: (email, password, displayName) => request('/auth/signup', { method: 'POST', body: { email, password, displayName } }),
  signIn: (email, password) => request('/auth/signin', { method: 'POST', body: { email, password } }),
  me: (token) => request('/auth/me', { token }),
  updateProfile: (token, payload) => request('/users/me', { method: 'PATCH', token, body: payload }),
  // Listings
  listListings: ({ category, q, page = 1, limit = 20 }) => {
    const sp = new URLSearchParams();
    if (category) sp.set('category', category);
    if (q) sp.set('q', q);
    sp.set('page', String(page)); sp.set('limit', String(limit));
    return request(`/listings/?${sp.toString()}`);
  },
  getListing: (id) => request(`/listings/${id}`),
  createListing: (token, payload) => request('/listings/', { method: 'POST', token, body: payload }),
  patchListing: (token, id, payload) => request(`/listings/${id}`, { method: 'PATCH', token, body: payload }),
  deleteListing: (token, id) => request(`/listings/${id}`, { method: 'DELETE', token }),
  // Favorites
  getFavorites: (token) => request('/favorites/', { token }),
  addFavorite: (token, id) => request(`/favorites/${id}`, { method: 'POST', token }),
  removeFavorite: (token, id) => request(`/favorites/${id}`, { method: 'DELETE', token }),
};

export async function uploadImages(token, uris = []) {
  const base = BASE_URL;
  const form = new FormData();
  uris.forEach((uri, i) => {
    const name = `photo_${i}.jpg`;
    form.append('file', { uri, name, type: 'image/jpeg' });
  });
  const res = await fetch(`${base}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  const out = await res.json();
  const urls = Array.isArray(out.urls) ? out.urls.map((u) => (u.startsWith('http') ? u : `${base}${u}`)) : [];
  return { urls };
}
