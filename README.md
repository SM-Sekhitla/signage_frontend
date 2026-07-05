# Signage Frontend

React/Vite frontend for the signage installer marketplace.

## Run With Docker

From the project root:

```bash
docker compose up --build frontend backend mongo
```

Frontend runs at `http://localhost:5173`.

Or run the frontend container by itself:

```bash
cd signage_frontend
docker compose up --build
```

## Run Locally

```bash
npm ci
cp .env.example .env
npm run dev
```

The API base URL is controlled by `VITE_API_URL`. For local backend development:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Build

```bash
npm run build
```

## Architecture Notes

- `src/contexts` contains API-backed React Query providers for users, profiles, bookings, specialties, installer specialties, availability, and portfolio items.
- `src/utils/api.ts` is the Axios client. It includes credentials and refreshes cookies through `/auth/refresh`.
- Some page-level flows still use `src/lib/localStorage.ts` as a compatibility data service. New work should prefer the API contexts and progressively replace direct localStorage reads/writes.
