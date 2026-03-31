# backcross-admin-mvp

A minimal, production-like CRUD web app for backcross administration.
Built with **Next.js 14 App Router** (frontend + API routes) and **SQL Server**.

## Prerequisites

- Node.js 18+
- SQL Server (local or Docker)

## Quick Start

### 1. Set up SQL Server

Using Docker:
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Pass123" \
  -p 1433:1433 --name sql-backcross \
  mcr.microsoft.com/mssql/server:2022-latest
```

Create the database and run the schema + seed scripts:
```sql
-- Connect with sqlcmd, SSMS, or Azure Data Studio
CREATE DATABASE backcross_admin;
-- Then run db/schema.sql followed by db/seed.sql
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your SQL Server credentials:
```env
SQL_SERVER=localhost
SQL_DATABASE=backcross_admin
SQL_USER=sa
SQL_PASSWORD=YourStrong!Pass123
SQL_PORT=1433
SQL_ENCRYPT=false
SQL_TRUST_SERVER_CERT=true
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the app

```bash
npm run dev
```

Opens on `http://localhost:3000`. Next.js serves both the UI and all `/api/*` routes.

---

## Project Structure

```
backcross-admin-mvp/
├── db/
│   ├── schema.sql              SQL Server schema (all tables + FK constraints)
│   └── seed.sql                Seed data for local testing
├── src/
│   ├── app/
│   │   ├── api/                Next.js API route handlers
│   │   │   ├── project-requests/
│   │   │   ├── projects/
│   │   │   ├── sowing-lists/
│   │   │   ├── crossing-lists/
│   │   │   ├── transplant-lists/
│   │   │   └── selfing-lists/
│   │   ├── dashboard/page.tsx
│   │   ├── project-requests/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── layout.tsx
│   │   └── providers.tsx
│   ├── api/                    Frontend fetch wrappers (TanStack Query)
│   ├── components/             UI components + forms
│   ├── lib/                    DB pool, response helpers, schemas, projectId
│   └── types/                  TypeScript interfaces
├── .env.local                  DB credentials (gitignored)
├── .env.local.example
└── package.json
```

## Pages

| Page | URL |
|------|-----|
| Dashboard | `/dashboard` |
| Project Requests | `/project-requests` |
| Projects | `/projects` |
| Project Detail | `/projects/[id]` |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/project-requests` | List / Create |
| GET/PUT/DELETE | `/api/project-requests/[id]` | Get / Update / Delete |
| POST | `/api/project-requests/[id]/submit` | Draft → Submitted |
| POST | `/api/project-requests/[id]/convert` | Creates Project, sets Converted |
| GET | `/api/projects/counts` | Dashboard counts |
| GET/POST | `/api/projects` | List / Create |
| GET/PUT/DELETE | `/api/projects/[id]` | Get / Update / Delete |
| GET/POST | `/api/sowing-lists` | List by ?projectId / Create |
| GET/PUT/DELETE | `/api/sowing-lists/[id]` | Get (with items) / Update / Delete |
| POST | `/api/sowing-lists/[id]/items` | Add item |
| PUT/DELETE | `/api/sowing-lists/[id]/items/[itemId]` | Update / Delete item |
| *(same pattern for crossing-lists, transplant-lists, selfing-lists)* | | |

## projectId Format

Auto-generated on conversion: `NL_{requestType}_{4-digit-number}` — e.g. `NL_BC_0001`.
The counter is stored in the `Counter` table and incremented atomically per type per year.
