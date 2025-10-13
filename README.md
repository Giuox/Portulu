# Portulu

Production-ready food delivery platform.

## Stack
- Frontend: Next.js 15 (App Router) + Tailwind CSS
- UI: minimal Tailwind, ready for shadcn UI
- Backend: Next API Routes
- Database/Realtime/Auth: Supabase (PostgreSQL + Realtime)
- Payments: Stripe/PayPal (phase 2)
- Deploy: Vercel (frontend)

## Monorepo Layout
```
backend/                # legacy prototype (Express/SQLite) – replaced by Next API
frontend/
  web/                  # Next.js production app
    src/app/            # App Router pages and API routes
    src/lib/            # Supabase client, realtime, csrf
    supabase/           # schema.sql, policies.sql, migrations
```

## Setup
1) Install deps
```bash
cd frontend/web
npm install
```
2) Environment
Set in Vercel/.env:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only)
- ALLOWED_ORIGINS (optional)
- JWT_SECRET (optional)

3) Supabase
- In Supabase SQL editor, run `supabase/schema.sql`, `supabase/policies.sql`, and files in `supabase/migrations/`.
- Enable Realtime on `orders` table.

4) Dev
```bash
npm run dev
```
Open http://localhost:3000

## Key APIs
- POST `/api/auth/register`, `/api/auth/login`
- GET `/api/zones`
- GET `/api/restaurants`, `/api/restaurants/:id/menu`
- GET/POST `/api/orders`, PATCH `/api/orders/:id/status`
- GET `/api/profile`
- PATCH `/api/rider/availability`
- Admin: GET `/api/admin/profiles`

All mutating requests require CSRF header (auto-added by client code) and bearer token when applicable.

## Frontend Flows
- Customer: login → select restaurant → cart → create order → tracking (Realtime)
- Restaurant: login → see orders in lanes → accept/prep/ready (Realtime)
- Rider: availability toggle → see ready orders → deliver → complete (Realtime)
- Admin: metrics + lists for orders/restaurants/users/riders

## Security
- RLS policies for all tables
- Zod validation on all mutation endpoints
- Middleware with rate limiting and security headers
- Double-submit CSRF for mutations

## Deploy
See `frontend/web/README_DEPLOY.md` for details.