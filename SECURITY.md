# Security notes

- Admin access requires Supabase Auth plus an `admin` row in `public.profiles`.
- RLS is enabled on every exposed application table. Admin mutations use the signed-in user's Supabase session, so database policy remains the final authorization layer.
- Customer order creation uses the service role only in server route handlers. That key must remain server-only.
- Admin and order mutations reject cross-site requests, enforce JSON/file size limits, and use best-effort per-instance rate limits. For high traffic, add a shared edge rate limiter in front of the deployment.
- Admin image uploads accept only JPEG, PNG, WebP, or AVIF; the API checks MIME type, extension, size, and file signature. The bucket repeats MIME and size restrictions.
- Admin/API responses are `no-store` and `noindex`. Browser security headers and a Content Security Policy are configured in `next.config.ts`.

Report a suspected issue privately to the site owner. Do not include secrets, customer details, or active exploit payloads in a public issue.
