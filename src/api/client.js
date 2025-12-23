import Constants from 'expo-constants';
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || Constants?.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8080';

async function request(path, { method = 'GET', body, token, headers } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    let err = 'Request failed';
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
    return request(`/listings?${sp.toString()}`);
  },
  getListing: (id) => request(`/listings/${id}`),
  createListing: (token, payload) => request('/listings', { method: 'POST', token, body: payload }),
  patchListing: (token, id, payload) => request(`/listings/${id}`, { method: 'PATCH', token, body: payload }),
  deleteListing: (token, id) => request(`/listings/${id}`, { method: 'DELETE', token }),
  // Favorites
  getFavorites: (token) => request('/favorites', { token }),
  addFavorite: (token, id) => request(`/favorites/${id}`, { method: 'POST', token }),
  removeFavorite: (token, id) => request(`/favorites/${id}`, { method: 'DELETE', token }),
};

export async function uploadImages(token, uris = []) {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';
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
  return res.json();
}
