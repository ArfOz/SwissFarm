# 🇨🇭 SwissFarm

A TypeScript monorepo for the SwissFarm platform — a directory of Swiss farms with an admin panel and REST API.

## Structure

```
SwissFarm/
├── apps/
│   ├── backend/        # NestJS REST API (port 3300)
│   └── admin/          # Next.js 14 Admin Panel (port 3000)
├── packages/
│   ├── types/          # @swissfarm/types — shared TypeScript interfaces
│   └── config/         # @swissfarm/config — shared ESLint & Prettier config
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

> The **mobile app** lives in a separate repository and is not part of this monorepo.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Package manager | pnpm workspaces |
| Language | TypeScript |
| Backend | NestJS 10 |
| Database | PostgreSQL + Prisma 7 |
| Admin UI | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Maps | Leaflet + react-leaflet |

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

**Backend:**
```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:
```env
PORT=3300
ADMIN_URL=http://localhost:3000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/swissfarm?schema=public"
```

**Admin:**
```bash
cp apps/admin/.env.local.example apps/admin/.env.local
```

Edit `apps/admin/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3300
```

### 3. Set up the database

```bash
# Create and apply migrations
cd apps/backend
npx prisma migrate dev --name init

# Seed with sample data
pnpm db:seed
```

### 4. Start development servers

Open two terminals:

```bash
# Terminal 1 — Backend API
pnpm dev:backend

# Terminal 2 — Admin Panel
pnpm dev:admin
```

| Service | URL |
|---|---|
| Admin Panel | http://localhost:3000 |
| Backend API | http://localhost:3300 |

## API Endpoints

```
GET    /farms              List all farms (supports ?type= filter)
GET    /farms/:id          Get a single farm
POST   /farms              Create a farm
PATCH  /farms/:id          Update a farm
DELETE /farms/:id          Delete a farm
```

### Farm types

| Value | Label |
|---|---|
| `milk` | Milk Farm |
| `self-service` | Self-Service |
| `pick-your-own` | Pick Your Own |
| `kids` | Kids Farm |

### Farm object

```json
{
  "id": "clxxx...",
  "name": "Hofmatt Bio Bauernhof",
  "type": "milk",
  "products": ["milk", "cheese", "butter"],
  "location": { "lat": 47.3769, "lng": 8.5417 },
  "address": "Hofmattstrasse 12, 8001 Zürich",
  "canton": "ZH",
  "website": "https://hofmatt.ch",
  "openingHours": "Mon–Fri 07:00–18:00"
}
```

## Admin Panel Features

- **Dashboard** — overview stats
- **Farms list** — filterable table with inline edit & delete
- **Farm form** — create / edit modal with validation
- **Map** — interactive Leaflet map with color-coded markers by farm type

## Database Commands

```bash
cd apps/backend

pnpm db:migrate   # Run pending migrations
pnpm db:seed      # Seed sample data
pnpm db:studio    # Open Prisma Studio
```

## Root Scripts

```bash
pnpm dev:backend    # Start NestJS with hot reload
pnpm dev:admin      # Start Next.js dev server
pnpm build:backend  # Build backend
pnpm build:admin    # Build admin
pnpm format         # Prettier format all files
```

## Shared Packages

### `@swissfarm/types`

```ts
import { Farm, FarmType, FARM_TYPES } from '@swissfarm/types';
```

Exports the `Farm` interface and `FarmType` union type used across all apps.

### `@swissfarm/config`

Shared ESLint and Prettier configuration.

## Environment Variables Reference

### `apps/backend/.env`

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3300` | HTTP port |
| `ADMIN_URL` | `http://localhost:3000` | CORS allowed origin |
| `DATABASE_URL` | — | PostgreSQL connection string |

### `apps/admin/.env.local`

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3300` | Backend API base URL |
