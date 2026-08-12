# Personal Finance App

A modern, full-stack personal finance application designed for tracking income and expenses, organizing spending by category, and setting monthly budgets. The application is multi-tenant, providing secure, isolated data for each user.

---

## 🚀 Features

### Current
- **User Authentication**: Secure user registration API, login, JWT session management, Google OAuth, and Two-Factor Authentication (2FA) with encryption.
- **Settings Page**: Manage user profile, security settings, and personal preferences.
- **Categorization**: Group spending into custom categories with colors and icons (CRUD implemented for backend and frontend).
- **Financial Reports**: PDF generation for financial reports using `date-fns` for accurate date handling.
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation decorators integrated across controllers and DTOs.
- **Database Schema**: Fully defined PostgreSQL schema using Drizzle ORM (Users, Categories, Transactions, Budgets, Refresh Tokens).
- **Core API Architecture**: Standardized error handling, global validation, logging, and response formatting.
- **Local Infrastructure**: Docker Compose setup for PostgreSQL and Redis.

### Planned
- **Transaction Management**: Record income and expenses with precise dates, notes, and categories.
- **Budgeting**: Define and track monthly limits globally or per category.
- **Frontend Dashboard**: Complete the comprehensive UI built with Next.js, Tailwind CSS v4, and Recharts.

---

## 🛠️ Tech Stack

**Frontend** ([`frontend/`](./frontend))
- Framework: **Next.js 15** (React 19)
- Styling: **Tailwind CSS v4**
- State & Data Fetching: **TanStack React Query v5**
- Forms & Validation: **React Hook Form** + **Zod**
- UI/Charts: **Lucide React** + **Recharts**

**Backend** ([`backend/`](./backend))
- Framework: **NestJS 11** (Node.js 20+)
- Language: **TypeScript**
- Database: **PostgreSQL 16**
- ORM: **Drizzle ORM**
- Validation: `class-validator` & `class-transformer`
- Security: Helmet, CORS, bcrypt

**Infrastructure**
- **Local**: Docker Compose (Postgres & Redis)
- **Production**: Frontend on **Vercel**, backend on **Render**, database on **Neon** (PostgreSQL)

---

## 📁 Repository Structure

```text
PF/
├── backend/                # NestJS REST API and database migrations
├── frontend/               # Next.js Client App
├── docker-compose.yml      # Local infrastructure (Postgres + Redis)
├── WIKI.md                 # Detailed project documentation and architecture
└── README.md               # This file
```

---

## 🏁 Getting Started (Development)

### 1. Start Infrastructure
Run the database and caching layers via Docker Compose:
```bash
docker compose up -d postgres redis
```

### 2. Run the Backend API
```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run start:dev
```
The API will be available at `http://localhost:3001/api/v1`.

### 3. Run the Frontend (Coming Soon)
```bash
cd frontend
npm install
npm run dev
```
The UI will be available at `http://localhost:3000` (or `5173`).

---

## 🌐 Deployment

The production environment is split across three managed services:

| Component | Platform | Description |
|-----------|----------|-------------|
| **Frontend** | [Vercel](https://vercel.com) | Next.js app — automatic builds and deploys from the `frontend/` directory |
| **Backend** | [Render](https://render.com) | NestJS API — hosted as a web service with environment variables for secrets and DB connection |
| **Database** | [Neon](https://neon.tech) | Serverless PostgreSQL — production database; connection string is provided to the Render backend |

**Notes**
- Local development uses Docker Compose for Postgres and Redis; production uses Neon instead of a self-hosted database.
- Set the backend `DATABASE_URL` on Render to your Neon connection string.
- Point the frontend API base URL (e.g. `NEXT_PUBLIC_API_URL`) at the Render backend URL.
- There is an issue about deployed app. It needs to be fixed.

---

## 📘 Documentation

For a more in-depth look at the architecture, design decisions, data model, and API conventions, please refer to the [Project Wiki (WIKI.md)](./WIKI.md).
