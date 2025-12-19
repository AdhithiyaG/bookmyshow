# BookMyShow Fullstack (React + Node + MongoDB)

This is a minimal, production-ready scaffold of a BookMyShow-like system with:
- Frontend: React (Vite)
- Backend: Node.js (Express), MongoDB (Mongoose)
- Caching: Redis (with in-memory fallback)
- Concurrency-safe bookings: atomic seat holds and bookings using MongoDB transactions/conditional updates

## Structure

- server/ — Express API, MongoDB models, caching, concurrency-safe booking
- client/ — React web UI (Vite)
- docker-compose.yml — Local/dev orchestration (MongoDB, Redis, API, Web)

## Quick Start (Local)

Prerequisites:
- Node.js 18+
- MongoDB Atlas (recommended) or local MongoDB
- Redis (Upstash/Redis Cloud) or skip to use in-memory cache

### Backend

1. Create server/.env from example and update variables:
```
PORT=4000
MONGO_URL=mongodb://localhost:27017/bookmyshow
REDIS_URL=
CORS_ORIGIN=http://localhost:5173
HOLD_TTL_SECONDS=300
```
2. Install and run:
```bash
cd server
npm install
npm run dev
```
3. Seed sample data:
```bash
# with server running
curl -X POST http://localhost:4000/admin/seed
```

### Frontend

1. Create client/.env from example and update the API URL:
```
VITE_API_URL=http://localhost:4000
```
2. Install and run:
```bash
cd client
npm install
npm run dev
```

Open the browser at the printed URL (usually http://localhost:5173).

## Deployment

### Option A: Docker Compose (single VM or workstation)

1. Copy `.env.example` files to `.env` in server and client. For production, use MongoDB Atlas and Redis Cloud URLs.
2. From repo root:
```bash
docker compose up --build
```
This starts `mongo`, `redis`, `api` at 4000, `web` at 5173 (mapped to 80 in compose). Adjust ports as needed.

### Option B: Managed Hosting

- Backend (Render/Fly/Railway):
  - Build: `npm install`
  - Start: `npm run start`
  - Env Vars: `PORT`, `MONGO_URL` (Atlas SRV), `REDIS_URL`, `CORS_ORIGIN` (your frontend URL), `HOLD_TTL_SECONDS` (e.g., 300)
  - Ensure MongoDB Atlas (replica set) to support transactions.

- Frontend (Vercel/Netlify):
  - Build command: `npm run build`
  - Output dir: `dist`
  - Env Var: `VITE_API_URL` pointing to your deployed API URL

DNS and TLS are handled by the platforms. Verify CORS on the API allows your frontend origin.

## Concurrency & Caching

- Seat Hold: Atomically marks seats as HELD only if they were AVAILABLE. If any seat is already held/booked, the hold fails.
- Confirm Booking: Atomically converts seats from HELD to BOOKED for a valid, non-expired hold.
- MongoDB: Uses transactions where available (Atlas/default). Falls back to conditional updates per-operation if transactions are unavailable.
- Caching: Seat maps and show lists are cached in Redis. Invalidation occurs on hold/confirm/cancel to keep data fresh.

## API (Selected)

- `POST /admin/seed` — seed demo movies/theaters/shows/seats
- `GET /movies` — list movies
- `GET /movies/:movieId/theaters` — list theaters with shows
- `GET /movies/:movieId/theaters/:theaterId/shows` — list shows
- `GET /shows/:showId/seats` — seat map
- `POST /shows/:showId/hold` — body: `{ userId, seatLabels: ["A1","A2"] }`
- `POST /holds/:holdId/confirm` — confirm and issue booking
- `POST /holds/:holdId/cancel` — cancel an active hold

## Notes

- For transactions locally, MongoDB must run as a replica set. Atlas provides this by default. For local dev, you can run a single-node replica set.
- If `REDIS_URL` is absent, the cache falls back to an in-memory TTL cache (not shared across instances).
