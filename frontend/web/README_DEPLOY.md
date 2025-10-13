# Portulu Deploy Guide

## Environment Variables

Set the following in Vercel (frontend) and Render (if using server-side keys):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `JWT_SECRET` (optional if using custom tokens elsewhere)
- `ALLOWED_ORIGINS` (comma-separated)

## Supabase Setup

1. Create project in Supabase and obtain URL + anon/service keys.
2. Run SQL in `supabase/schema.sql`, `supabase/policies.sql`, and migrations under `supabase/migrations/` in the SQL editor.
3. Create initial profiles and restaurants as needed.

## Frontend (Vercel)

- Root: `frontend/web`
- Build command: `npm run build`
- Output: Next.js (no custom output dir)
- Node version: 18+

## Realtime

- Supabase Realtime enabled for the `orders` table in the dashboard.

## Render (optional backend services)

- App is Next API Routes; no separate backend needed. If you later add a Node server for Socket.io, deploy on Render and set `API_URL` accordingly.
