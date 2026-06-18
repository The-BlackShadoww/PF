# Personal Finance App — Project Wiki

A full-stack personal finance application for tracking income and expenses, organizing spending by category, and setting monthly budgets. Users get their own secure account; all financial data is scoped per user.

The project is in early development. The backend API and database schema are in place; the frontend is a placeholder. Authentication currently supports registration only—login, OAuth, and session management are planned next.

---

## What problem does it solve?

Managing personal money often means spreadsheets or apps that do not fit how you think about spending. This app focuses on a small, clear set of features:

- **Track transactions** — Record income and expenses with dates, notes, and categories.
- **Organize with categories** — Group spending (and income) into labeled categories with optional color and icon.
- **Set budgets** — Define monthly limits per category (or overall) and compare against actual spending.
- **Secure accounts** — Email/password sign-up with room for Google sign-in and two-factor authentication.

Amounts are stored in **cents** (integers) to avoid floating-point rounding issues.

---

## Architecture

```
┌─────────────┐     HTTPS / REST      ┌─────────────┐     SQL      ┌────────────┐
│   Frontend  │ ◄──────────────────► │   Backend   │ ◄──────────► │ PostgreSQL │
│  (planned)  │   /api/v1            │   NestJS    │              │     16     │
└─────────────┘                      └──────┬──────┘              └────────────┘
                                            │
                                            │ (optional, future)
                                            ▼
                                     ┌────────────┐
                                     │   Redis    │
                                     └────────────┘
```

| Part | Location | Role |
| --- | --- | --- |
| **Backend API** | [`backend/`](backend/) | NestJS REST API: auth, validation, business logic, database access |
| **Frontend** | [`frontend/`](frontend/) | Client UI (not yet implemented; dev URL planned at `http://localhost:5173`) |
| **Infrastructure** | [`docker-compose.yml`](docker-compose.yml) | Local PostgreSQL and Redis for development |

The API is versioned under **`/api/v1`**. Successful responses are wrapped as `{ data, meta }`; errors return a consistent JSON shape with `statusCode`, `message`, and `requestId`.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Backend runtime | Node.js 20+ |
| Backend framework | NestJS 11, TypeScript |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Validation | class-validator, class-transformer |
| Security | Helmet, CORS, bcrypt (password hashing) |
| Config | @nestjs/config with Joi validation |
| Optional (configured, not required yet) | Redis, Google OAuth |

---

## Data model

Core tables (defined in [`backend/src/db/schema/index.ts`](backend/src/db/schema/index.ts)):

| Table | Purpose |
| --- | --- |
| **users** | Accounts: name, email, password hash, optional Google ID, 2FA fields, timezone, soft delete |
| **categories** | Per-user income/expense labels with color, icon, sort order |
| **transactions** | Amount (cents), type (income/expense), date, note, linked category |
| **budgets** | Monthly limits per user, optionally per category (year + month + amount) |
| **refresh_tokens** | Hashed refresh tokens for future session-based auth |

Relationships: each user owns categories, transactions, and budgets. Transactions and budgets reference categories. Deleting a user cascades to their related rows.

---

## Current features vs. roadmap

### Implemented

- User registration (`POST /api/v1/auth/register`)
- PostgreSQL schema and Drizzle migrations
- Global request logging, error handling, response wrapping, and request IDs
- Docker Compose for local Postgres (and Redis)

### Planned / in schema but not yet exposed via API

- Login and JWT access/refresh token flow
- Google OAuth
- Two-factor authentication
- CRUD for categories, transactions, and budgets
- Dashboard and reporting in the frontend
- Redis-backed sessions or caching

---

## Repository layout

```
PF/
├── WIKI.md                 ← this file
├── docker-compose.yml      ← Postgres + Redis for local dev
├── backend/                ← NestJS API (see backend/README.md for setup)
│   ├── src/
│   │   ├── modules/auth/   ← registration
│   │   ├── db/schema/      ← Drizzle schema
│   │   └── common/         ← filters, interceptors, middleware
│   └── drizzle/migrations/ ← SQL migrations
└── frontend/               ← UI (placeholder)
```

For backend setup, environment variables, npm scripts, and API details, see [`backend/README.md`](backend/README.md).

---

## Quick start (development)

1. **Start the database** (from repo root):

   ```bash
   docker compose up -d postgres
   ```

2. **Configure and run the API**:

   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run db:migrate
   npm run start:dev
   ```

   API base URL: `http://localhost:3001/api/v1`

3. **Frontend** — not yet available; the sibling `frontend/` directory is reserved for the client app.

---

## API snapshot

| Method | Path | Status |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Available |

Registration body: `name` (2–100 chars), `email`, `password` (8–72 chars). Returns user `id`, `name`, `email`, `createdAt` (never the password hash). `409 Conflict` if the email is already registered.

---

## Conventions

- **Money**: always integer cents in the database and API payloads.
- **Soft deletes**: `deleted_at` on users, categories, and transactions where applicable.
- **Auth secrets**: `JWT_SECRET` and `REFRESH_TOKEN_SECRET` must be set; use strong values in production.
- **CORS**: only the origin in `FRONTEND_URL` is allowed, with credentials enabled.

---

## License

Private — UNLICENSED (see [`backend/package.json`](backend/package.json)).
