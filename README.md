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
