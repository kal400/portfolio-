# Kalab Awoke Portfolio

Hybrid professional/editorial portfolio for Kalab Awoke, built with React, Vite, and Supabase integration points.

## Run locally

```bash
npm install
npm run dev
```

The public portfolio is available at the root. Open `/#admin` to preview the private dashboard. Without Supabase environment variables, the dashboard runs in demo mode.

## Supabase setup

1. Create a Supabase project and an email/password user.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor.
3. Copy `.env.example` to `.env` and add the project URL and anon key.
4. Restart the Vite dev server.

## Production build

```bash
npm run build
```

Deploy the repository to Vercel and add the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables.
