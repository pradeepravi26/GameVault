# GameVault

GameVault is a web app for browsing games, writing reviews, and managing collections.

## Tech Stack

- Frontend: Next.js
- Backend: Hono
- Database: MySQL
- UI: shadcn/ui

## Local Development

### Prerequisites

- `pnpm`
- Docker
- `just`

### Install dependencies

From the repo root:

```bash
pnpm install
```

### Start the database

```bash
just db-up
just db-seed
```

This starts local MySQL in Docker and loads:

- `packages/db/sql/schema.sql`
- `packages/db/sql/advanced.sql`
- `packages/db/sql/metadata_seed.sql`

### Demo data (local, optional)

After `just db-seed`, you can load SQL demo data (same style as the other seed files: plain MySQL, `CALL add_or_update_rating`, etc.):

```bash
just seed-demo
```

This applies `packages/db/sql/demo_seed.sql` via Docker (same credentials as `just db-seed`). It is **not** run automatically and is intended for local development only (not GCP).

It adds ten accounts (fictional display names; all use password **`password123`**, scrypt hash matches `apps/api` auth):

- `morgan_ellis`, `riley_chen`, `jordan_brooks`, `casey_nguyen`, `taylor_reed`, `avery_patel`, `quinn_murphy`, `skylar_foster`, `reese_okonkwo`, `cameron_dsouza`

Also:

- One review per game in `games` (score + text), rotating authors across those accounts
- Two collections per account (Backlog + Favorites) with sample `collection_games` rows
- Sample `collection_likes` between those accounts

Re-running `just seed-demo` deletes prior rows tied to those usernames, then re-inserts.

**Note:** Seeding reviews calls `add_or_update_rating` once per game; the full catalog (~845 games) may take a short while.

The API reads simple `KEY=value` lines from the **repo root** `.env` file (if present) before connecting, so `DB_HOST`, `DB_PORT`, etc. can match the database you seeded. If the catalog still shows **N/A** for scores or **no collections**, confirm the API is using the same MySQL instance as Docker (`just db-up` → port `3306`) and re-run `just seed-demo` after pulling the latest `demo_seed.sql` (older versions could stop after one review due to a MySQL handler quirk).

### Start the backend

```bash
just api
```

The backend runs on `http://localhost:3001`.

### Start the frontend

In a second terminal:

```bash
just web
```

The frontend runs on `http://localhost:3000`.

### Useful checks

Backend typecheck:

```bash
just typecheck-api
```

Database package typecheck:

```bash
just typecheck-db
```

Shared contracts typecheck:

```bash
just typecheck-contracts
```

### Default local database settings

The app expects local MySQL values like:

```env
DB_ENV=local
DB_USER=root
DB_PASSWORD=root
DB_NAME=game_vault
DB_HOST=127.0.0.1
DB_PORT=3306
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```
