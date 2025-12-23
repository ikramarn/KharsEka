# Frontend (Expo) setup with microservices backend

## Configure API base URL
Set the API URL to your gateway endpoint.

Options:
- Local PC via port-forward (emulator or web): `http://localhost:8080`
- LAN IP (for physical phone on same Wi‑Fi): `http://<your-pc-lan-ip>:8080`
- Public tunnel (for physical phone off-network): e.g. ngrok/Cloudflared URL

Use one of:
- Env var when starting Expo:
  ```powershell
  $env:EXPO_PUBLIC_API_BASE_URL = "http://<ip-or-host>:8080"
  npx expo start --tunnel
  ```
- Or edit app.json `expo.extra.apiBaseUrl`.

## Run Expo
```powershell
npx expo start --tunnel
```
Scan the QR in Expo Go.

## Auth and Data
- Email/password sign up and sign in through `/auth` service.
- Create listing enforces 2–8 images; uploads via `/media/upload` then persists via `/listings`.
- Favorites retrieved from `/favorites` and hydrated with `/listings/:id`.