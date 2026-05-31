# Finance App — Backend API

NestJS REST API for the personal finance application. It handles authentication, user data, and (as modules are added) transactions, categories, and budgets. The API is versioned under `/api/v1` and uses PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/).

## Tech stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js |
| Framework | [NestJS](https://nestjs.com/) 11 |
| Language | TypeScript |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Validation | `class-validator` + `class-transformer` |
| Config | `@nestjs/config` with Joi validation |
| Security | Helmet, CORS, bcrypt (password hashing) |

Optional infrastructure (configured but not required yet): Redis, Google OAuth.

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **PostgreSQL** — use [Docker Compose](../docker-compose.yml) at the repo root, or your own instance

## Quick start

### 1. Start PostgreSQL (and Redis)

From the **repository root**:

```bash
docker compose up -d postgres
```

Redis is optional today; start it when session or cache features need it:

```bash
docker compose up -d redis
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` if your database URL or secrets differ from the defaults.

### 3. Install dependencies and run migrations

```bash
npm install
npm run db:migrate
```

`db:migrate` applies SQL files in `drizzle/migrations/` via Drizzle Kit. Ensure `DATABASE_URL` in `.env` points at the database you started (default: `financeapp_dev` on `localhost:5432`).

### 4. Start the API

```bash
npm run start:dev
```

The server listens on the port from `PORT` (default **3001**). Base URL: `http://localhost:3001/api/v1`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing access tokens (login flow) |
| `REFRESH_TOKEN_SECRET` | Yes | Secret for refresh tokens |
| `FRONTEND_URL` | Yes | Allowed CORS origin (e.g. `http://localhost:5173`) |
| `PORT` | No | HTTP port (default `3001`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `REDIS_URL` | No | Redis URL for future session/cache use |

See [.env.example](./.env.example) for a full template. **Do not commit `.env`** — it contains secrets.

## API conventions

### Base path

All routes are prefixed with `/api/v1`.

### Successful responses

Successful JSON responses are wrapped by a global interceptor:

```json
{
  "data": { },
  "meta": {
    "timestamp": "2026-05-31T12:00:00.000Z"
  }
}
```

### Error responses

Errors return a consistent shape (no `data` wrapper):

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "requestId": "uuid-or-client-provided-id",
  "timestamp": "2026-05-31T12:00:00.000Z"
}
```

You may send `X-Request-Id` on requests; otherwise the server generates one and echoes it on the response.

### Validation

Request bodies are validated with `ValidationPipe` (whitelist + transform). Unknown properties on DTOs are stripped when whitelisting applies.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Create a new user account |

#### `POST /api/v1/auth/register`

**Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

| Field | Rules |
| --- | --- |
| `name` | 2–100 characters |
| `email` | Valid email |
| `password` | 8–72 characters |

**Success:** `201 Created` — `data` contains `id`, `name`, `email`, `createdAt` (password hash is never returned).

**Errors:** `409 Conflict` if the email is already registered.

## Database

### Schema

Drizzle schema lives in [`src/db/schema/index.ts`](./src/db/schema/index.ts). Core tables:

- **users** — accounts (email/password, optional Google ID, 2FA fields)
- **categories** — income/expense categories per user
- **transactions** — amounts in cents, linked to categories
- **budgets** — monthly limits per user/category
- **refresh_tokens** — hashed refresh tokens for auth sessions

### Scripts

| Command | Description |
| --- | --- |
| `npm run db:generate` | Generate a new migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push schema directly to the DB (dev only; skips migration files) |
| `npm run db:studio` | Open Drizzle Studio in the browser |

After changing `src/db/schema`, run `db:generate`, review the SQL under `drizzle/migrations/`, then `db:migrate`.

A standalone migrator is also available at [`src/db/migrate.ts`](./src/db/migrate.ts) (run via `ts-node` or compiled `dist`) if you need to apply migrations outside Drizzle Kit.

## Project structure

```
backend/
├── drizzle/
│   └── migrations/       # Generated SQL migrations
├── src/
│   ├── common/           # Filters, interceptors, middleware, decorators
│   ├── config/           # Typed configuration factory
│   ├── db/               # Drizzle module, schema, migrator
│   ├── modules/
│   │   └── auth/         # Registration (login/OAuth TBD)
│   ├── app.module.ts
│   └── main.ts           # Bootstrap: helmet, CORS, pipes, interceptors
├── test/                 # E2E tests
├── .env.example
└── drizzle.config.ts
```

### Cross-cutting behavior

- **RequestIdMiddleware** — assigns or forwards `X-Request-Id` on every request
- **LoggingInterceptor** — logs method, URL, and response time
- **TransformInterceptor** — wraps successful payloads in `{ data, meta }`
- **GlobalExceptionFilter** — normalizes HTTP and unexpected errors

Inject the database with the `DB_TOKEN` provider from `DbModule` (global).

## npm scripts

| Script | Description |
| --- | --- |
| `npm run start` | Start once (no watch) |
| `npm run start:dev` | Start with file watch |
| `npm run start:debug` | Start with debugger and watch |
| `npm run start:prod` | Run compiled `dist/main.js` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run lint` | ESLint with auto-fix |
| `npm run format` | Prettier on `src/` and `test/` |
| `npm run test` | Unit tests (Jest) |
| `npm run test:e2e` | End-to-end tests |
| `npm run test:cov` | Coverage report |

## Testing

```bash
# unit
npm run test

# e2e (requires DB/env as appropriate for your test setup)
npm run test:e2e
```

## Production notes

1. Set strong, unique values for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`.
2. Point `DATABASE_URL` at your production PostgreSQL instance.
3. Set `FRONTEND_URL` to your deployed frontend origin (CORS).
4. Build and run:

   ```bash
   npm run build
   npm run start:prod
   ```

5. Run migrations as part of deploy: `npm run db:migrate`.

Helmet is enabled globally. CORS allows credentials from `FRONTEND_URL` only.

## Related

- **Frontend** — sibling app at [`../frontend`](../frontend) (default dev URL `http://localhost:5173`)
- **Docker** — [`../docker-compose.yml`](../docker-compose.yml) for local Postgres and Redis

## License

Private — UNLICENSED (see [package.json](./package.json)).
