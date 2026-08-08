# Tuysqan — digital ordering ecosystem

Production-oriented Next.js application for Tuysqan in Makinsk, Kazakhstan. One menu powers the public delivery site, dine-in QR ordering, and the protected restaurant admin panel.

## What is included

- Public website: `/`, `/menu`, `/cart`, `/checkout`, `/about`
- Dine-in ordering: `/dine-in`, `/dine-in/cart`, `/dine-in/order/[id]`
- Protected admin: `/admin`, menu/category/order/table/promotion/settings/QR sections
- RU/KZ menu fields with Russian fallback when a Kazakh translation is unavailable
- Persistent browser cart, validated delivery checkout, and encoded `wa.me` message
- Supabase Auth, PostgreSQL, Storage, Row Level Security, and Realtime
- Full menu seed from the supplied 31-page menu PDF plus sushi graphics and structured sushi-set contents
- Draft promotions for supplied creatives whose year could not be verified
- Unit tests and Playwright ordering-flow tests

## Requirements

- Node.js 20+
- npm
- A Supabase project
- A Vercel project for deployment

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and provide the Supabase project URL, anon key, and service-role key. The service-role key is server-only and must never use a `NEXT_PUBLIC_` prefix.

3. Apply every file in `supabase/migrations` in filename order. If using the Supabase CLI, link the project and run `supabase db push`.

4. Seed the real Tuysqan menu:

   ```bash
   npm run seed
   ```

5. Start the site:

   ```bash
   npm run dev
   ```

The customer site works from the checked-in menu dataset before Supabase is configured, but submitting orders and using the admin panel intentionally require a configured database.

## Create the first administrator

There is no public signup.

1. In Supabase Dashboard, open Authentication → Users and create the user manually.
2. Copy the new user's UUID.
3. Run:

   ```sql
   insert into public.profiles (id, role, display_name)
   values ('USER_UUID', 'admin', 'Tuysqan administrator');
   ```

4. Sign in at `/admin/login`.

Authorization is enforced in middleware, server components, API handlers, and database RLS policies—not just by hiding admin links.

## Storage and dish photos

The migration creates a public `menu-images` bucket. Public visitors can read images; only authenticated admin profiles can upload, replace, or remove them. The admin menu editor previews uploads before the image URL is saved to a dish.

Extracted source imagery is kept in `public/menu-assets`, brand assets in `public/brand`, and verified promotional assets in `public/promos`. No stock or AI-generated dish images are used.

## Orders

Delivery checkout writes an order and immutable item snapshots to Supabase before opening WhatsApp. The destination is controlled by `restaurant_settings.whatsapp` and initially seeded as `77715947903`.

Dine-in orders are written directly to Supabase. Admin order boards receive inserts through Postgres Realtime. Customer status pages subscribe to an unguessable per-order Realtime channel and also load the initial state using the order's public token.

Readable order numbers:

- Delivery: `TQ-YYYYMMDD-XXX`
- Dine-in: `D-XXX`

## Restaurant settings

Use `/admin/settings` to edit the restaurant name, city, address, phone, WhatsApp number, Instagram URL, 2GIS URL, hours, delivery minimum/text, currency, default language, and order notification preference. The address is seeded from the verified 2GIS listing; opening hours remain blank because a complete schedule could not be verified.

## Tables and QR codes

Use `/admin/tables` to add, rename, hide, or archive table labels. `/admin/qr` generates a downloadable QR code for `/dine-in` or a table-specific link such as `/dine-in?table=table-7`. Guests may still change the preselected table.

For permanent printed QR codes, generate them only after `NEXT_PUBLIC_SITE_URL` is set to the final production domain.

## Promotions

Promotion dates shown only as “до 15 августа” or “до 31 августа” were imported as drafts with `needs_review = true`; no year was guessed. Review and activate them from `/admin/promotions`.

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The first Playwright run may require `npx playwright install chromium`.

## Deploy to Vercel

1. Import this repository into Vercel.
2. Add all variables from `.env.example` as project environment variables. Keep `SUPABASE_SERVICE_ROLE_KEY` encrypted and server-only.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin.
4. Deploy.
5. In Supabase Authentication URL Configuration, add the production origin and `/admin/login` redirect URL.
6. Re-generate printable QR codes from the production admin panel.

See `DEPLOYMENT.md` for the complete domain, Supabase Auth, DNS, HTTPS, migration, and release checklist. Security assumptions and operational limits are documented in `SECURITY.md`.

## Operational notes

- Change the WhatsApp destination from `/admin/settings`, not in source code.
- Prices are stored as integer KZT and formatted with `Intl.NumberFormat`.
- Existing orders keep name and price snapshots even after menu edits.
- “Нет в наличии” is a reversible availability toggle; archive is used instead of destructive menu deletion.
- The service-role key is used only inside server route handlers and the seed script.
