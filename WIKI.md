# Personal Finance App — Project Wiki

A full-stack personal finance application for tracking income and expenses, organizing spending by category, setting monthly budgets, and exporting financial reports. Users get their own secure account; all financial data is scoped per user.

The backend NestJS API, Next.js frontend, and PostgreSQL schema are all in active use. Authentication supports registration, login, JWT refresh cookies, Google OAuth, and two-factor authentication. Most core financial features are implemented end to end; the budgets UI and a few auth callback routes are still in progress.

---

## What problem does it solve?

Managing personal money often means spreadsheets or apps that do not fit how you think about spending. This app focuses on a small, clear set of features:

- **Track transactions** — Record income and expenses with dates, notes, and categories.
- **Organize with categories** — Group spending (and income) into labeled categories with optional color and icon.
- **Set budgets** — Define monthly limits per category (or overall) and compare against actual spending.
- **Understand trends** — Monthly, quarterly, and yearly summaries with category breakdowns on the dashboard.
- **Export reports** — Download CSV or PDF reports for any billing period.
- **Secure accounts** — Email/password sign-up, Google sign-in, JWT sessions, and optional TOTP two-factor authentication.

Amounts are stored in **integer cents** in PostgreSQL to avoid floating-point rounding issues. Most API request and response fields use **decimal dollars** (for example `49.99`); a few aggregate or internal fields still expose cents where noted in Swagger.

---

## Architecture

```
┌─────────────────┐   /api/v1 (same origin)   ┌─────────────────┐     SQL      ┌────────────┐
│  Next.js Client │ ◄───────────────────────► │  NestJS API     │ ◄──────────► │ PostgreSQL │
│  (Vercel / dev) │   rewrite → backend       │  (Render / dev) │              │     16     │
└────────┬────────┘                           └────────┬────────┘              └────────────┘
         │ middleware reads refresh_token cookie       │
         │ (first-party cookie via proxy)              │ rate limiting
         │                                             ▼
         │                                      ┌────────────┐
         │                                      │   Redis    │
         │                                      │ (optional) │
         └──────────────────────────────────────└────────────┘
```

| Part | Location | Role |
| --- | --- | --- |
| **Frontend** | [`frontend/`](frontend/) | Next.js 15 App Router UI — dashboard, transactions, reports, settings |
| **Backend API** | [`backend/`](backend/) | NestJS REST API under `/api/v1` — auth, CRUD, calculations, reports |
| **Infrastructure** | [`docker-compose.yml`](docker-compose.yml) | Local PostgreSQL 16 and Redis 7 |
| **Production** | Vercel + Render + Neon | Frontend on Vercel, API on Render, database on Neon |

The API is versioned under **`/api/v1`**. Successful JSON responses are wrapped as `{ data, meta }`; errors return `{ statusCode, message, requestId, timestamp }`. File downloads (CSV/PDF) bypass the JSON wrapper.

In production, the browser never calls Render directly. Vercel rewrites `/api/v1/*` to the backend so the `refresh_token` httpOnly cookie stays on the frontend origin and Next.js middleware can gate protected routes.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, React 19, Tailwind CSS v4, TanStack React Query v5, React Hook Form, Zod, Recharts, Lucide React |
| Backend runtime | Node.js 20+ |
| Backend framework | NestJS 11, TypeScript |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM |
| Validation | class-validator, class-transformer (API); Zod (frontend forms) |
| Security | Helmet, CORS, bcrypt, JWT access tokens, httpOnly refresh cookies, TOTP 2FA |
| Docs | Swagger/OpenAPI at `/api/docs` |
| Reports | fast-csv, @react-pdf/renderer |
| Config | @nestjs/config with Joi validation |
| Rate limiting | @nestjs/throttler with optional Redis-backed storage |

---

## Data model

Core tables (defined in [`backend/src/db/schema/index.ts`](backend/src/db/schema/index.ts)):

| Table | Purpose |
| --- | --- |
| **users** | Accounts: name, email, password hash, optional Google ID, avatar, 2FA fields, timezone, soft delete |
| **categories** | Per-user income/expense labels with color, icon, sort order, default flag |
| **transactions** | Amount (cents), type (income/expense), date, note, denormalized month/year, linked category |
| **budgets** | Monthly limits per user, optionally per category (year + month + amount in cents) |
| **account_config** | Per-user initial balance and low-balance threshold |
| **savings_sectors** | Named allocation buckets with percentage, color, icon, optional target amount |
| **refresh_tokens** | Hashed refresh tokens with token-family rotation, user agent, and IP fingerprint |

Relationships: each user owns categories, transactions, budgets, account config, and savings sectors. Transactions and budgets reference categories. Deleting a user cascades to related rows.

---

## Current features vs. roadmap

### Implemented

**Authentication & users**
- Registration, login, logout, token refresh, and `GET /auth/me`
- JWT access tokens (Bearer header) plus httpOnly `refresh_token` cookies with rotation
- Google OAuth (`GET /auth/google`, callback sets cookies and redirects to frontend)
- TOTP 2FA setup, enable, verify-at-login, and disable
- Profile update and password change

**Financial modules**
- Categories CRUD with default categories seeded on registration
- Transactions CRUD with pagination, filters, soft delete, and projected-balance preview
- Budget upsert and monthly budget-vs-actual status (API)
- Account setup, balance summary, and savings-sector CRUD
- Calculations: monthly, quarterly, yearly summaries and category breakdown
- Reports: CSV and PDF export for a billing-period range

**Frontend**
- Landing page, login, and register
- Protected app shell: dashboard, transactions, reports, settings (profile, security, preferences, categories, account)
- Next.js middleware session gate based on `refresh_token` cookie
- API client with automatic 401 refresh and centralized error handling

**Platform**
- Drizzle migrations, global validation/logging/errors, request IDs
- Swagger docs (development by default; `ENABLE_SWAGGER=true` in production)
- Docker Compose for Postgres and Redis
- Optional Redis for distributed rate limiting

### Planned / in progress

- **Budgets UI** — `/budgets` is a placeholder; backend `PUT /budgets` and `GET /budgets/status` are ready
- **2FA login page** — login redirects to `/2fa` when `requiresTwoFactor` is returned; that route is not implemented yet
- **Google OAuth callback page** — backend redirects to `/auth/oauth/callback?token=…`; frontend handler still needed
- Tests, observability, and production hardening

---

## Repository layout

```
PF/
├── README.md               ← quick start and deployment
├── WIKI.md                 ← this file
├── ARCHITECTURE.md         ← system design deep dive
├── DESIGN.md               ← Carbon-inspired UI notes
├── docker-compose.yml      ← Postgres + Redis for local dev
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           ← register, login, refresh, OAuth, 2FA
│   │   │   ├── users/          ← profile, change password
│   │   │   ├── categories/
│   │   │   ├── transactions/
│   │   │   ├── budgets/
│   │   │   ├── account/        ← setup, summary, savings sectors
│   │   │   ├── calculations/   ← summaries and breakdowns
│   │   │   └── reports/        ← CSV and PDF
│   │   ├── db/schema/          ← Drizzle schema
│   │   └── common/             ← guards, filters, interceptors, middleware
│   └── drizzle/migrations/
└── frontend/
    ├── src/app/                ← App Router pages and layouts
    ├── src/components/         ← UI components by feature
    └── src/lib/                ← API clients, hooks, utilities
```

For backend npm scripts and environment variables, see [`backend/README.md`](backend/README.md).

---

## Quick start (development)

1. **Start infrastructure** (from repo root):

   ```bash
   docker compose up -d postgres redis
   ```

2. **Run the API**:

   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run db:migrate
   npm run start:dev
   ```

   API base URL: `http://localhost:3001/api/v1`  
   Swagger UI: `http://localhost:3001/api/docs`

   Set `FRONTEND_URL=http://localhost:3000` in `backend/.env`.

3. **Run the frontend**:

   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

   UI: `http://localhost:3000`  
   Browser API calls use `/api/v1` and are rewritten to `http://localhost:3001/api/v1` via `frontend/next.config.ts`.

---

## Frontend routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Marketing landing page |
| `/login`, `/register` | Public (redirect if session cookie present) | Authentication |
| `/dashboard` | Protected | Monthly / quarterly / yearly analytics |
| `/transactions` | Protected | Transaction ledger and CRUD |
| `/budgets` | Protected | Placeholder — full UI pending |
| `/reports` | Protected | CSV/PDF export with preview |
| `/settings` | Protected | Profile, security, preferences, categories, account |

Protected routes require a `refresh_token` cookie; middleware redirects unauthenticated users to `/login?next=…`.

---

## API snapshot

All paths below are relative to `/api/v1`. Unless marked **Public**, endpoints require `Authorization: Bearer <accessToken>`.

### Auth

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/auth/register` | **Public** — create account; seeds default categories |
| `POST` | `/auth/login` | **Public** — returns `accessToken` or `requiresTwoFactor` + `tempToken` |
| `POST` | `/auth/refresh` | **Public** — reads `refresh_token` cookie; rotates refresh token |
| `POST` | `/auth/logout` | **Public** — clears refresh cookie |
| `GET` | `/auth/me` | Current user profile |
| `GET` | `/auth/google` | **Public** — browser redirect to Google OAuth |
| `GET` | `/auth/google/callback` | **Public** — OAuth callback; sets cookies |
| `POST` | `/auth/2fa/setup` | Generate TOTP secret and QR code |
| `POST` | `/auth/2fa/enable` | Enable 2FA after verifying first code |
| `POST` | `/auth/2fa/verify` | **Public** — complete login with `tempToken` + TOTP code |
| `POST` | `/auth/2fa/disable` | Disable 2FA with TOTP confirmation |

### Users

| Method | Path | Notes |
| --- | --- | --- |
| `PATCH` | `/users/profile` | Update name, avatar URL, timezone |
| `POST` | `/users/change-password` | Requires current password |

### Categories, transactions, budgets

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/categories` | List all categories |
| `POST` | `/categories` | Create category |
| `PATCH` | `/categories/:id` | Update category |
| `DELETE` | `/categories/:id` | Soft-delete (not allowed for defaults) |
| `POST` | `/transactions` | Create transaction (`amount` in dollars) |
| `GET` | `/transactions` | Paginated list with filters |
| `GET` | `/transactions/:id` | Single transaction |
| `PATCH` | `/transactions/:id` | Update transaction |
| `DELETE` | `/transactions/:id` | Soft-delete |
| `GET` | `/transactions/projected-balance` | Preview balance; `amount` query param in **cents** |
| `PUT` | `/budgets` | Upsert monthly budget |
| `GET` | `/budgets/status` | Budget vs actual for `year` and `month` |

### Account, calculations, reports

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/account/summary` | All-time balance and sector allocations |
| `PUT` | `/account/setup` | Initial balance and low-balance threshold |
| `GET/POST/PATCH/DELETE` | `/account/sectors` | Savings sector CRUD |
| `GET` | `/calculations/monthly` | Query: `year`, `month` |
| `GET` | `/calculations/quarterly` | Query: `year`, `quarter` |
| `GET` | `/calculations/yearly` | Query: `year` |
| `GET` | `/calculations/category-breakdown` | Query: `year`, `month` |
| `GET` | `/reports/csv` | File download; query: `startYear`, `startMonth`, `endYear`, `endMonth` |
| `GET` | `/reports/pdf` | File download; same query params |

For request/response schemas, field validation rules, and examples, use Swagger at `http://localhost:3001/api/docs` after starting the backend.

---

## Conventions

- **Money**: stored as integer cents in PostgreSQL (`amountCents`). Most API bodies and JSON responses use decimal dollars (`amount: 49.99`). Budget status and some breakdown fields may expose cents — check Swagger per endpoint.
- **Soft deletes**: `deleted_at` on users, categories, and transactions.
- **Multi-tenancy**: every query is scoped to the authenticated user's ID.
- **Auth secrets**: `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, and `TWO_FACTOR_ENCRYPTION_KEY` (64-char hex) must be set in production.
- **CORS**: only the origin in `FRONTEND_URL` is allowed, with credentials enabled.
- **Request IDs**: clients may send `X-Request-Id`; otherwise the server generates one.

---

## License

Private — UNLICENSED (see [`backend/package.json`](backend/package.json)).
