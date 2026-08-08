# Production domain checklist

## 1. Database

Run every SQL migration in order. With the Supabase CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Without the CLI, paste these files into the Supabase SQL Editor in filename order:

1. `supabase/migrations/202608080001_initial.sql`
2. `supabase/migrations/202608090001_security_hardening.sql`

The hardening migration keeps public menu reads available, limits admin writes with RLS, and restricts menu uploads to supported image types and 8 MB.

## 2. Production environment

Set these variables in the hosting provider. Use the final HTTPS origin and no trailing slash:

```dotenv
NEXT_PUBLIC_SITE_URL=https://example.kz
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never give it a `NEXT_PUBLIC_` prefix, place it in frontend code, or commit it to Git.

## 3. Supabase Auth URLs

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `https://example.kz`
- Redirect URLs: `https://example.kz/admin/**`
- Keep `http://localhost:3000/admin/**` only for local development.

## 4. Domain and HTTPS

1. Add the custom domain in Vercel.
2. Apply the DNS records shown by Vercel at the domain registrar.
3. Wait for the domain and TLS certificate to become active.
4. Redeploy after changing `NEXT_PUBLIC_SITE_URL` because it is a public build-time variable.
5. Generate fresh printable QR codes in `/admin/qr`; they use the current origin.

## 5. Release verification

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

After deploy, verify `/`, `/menu`, `/checkout`, `/admin/login`, `/robots.txt`, `/sitemap.xml`, a table QR link, and a test order. Confirm that `/admin` and `/api` responses are not indexed or cached.
