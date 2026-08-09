-- Public buckets serve known object URLs without a broad SELECT policy.
-- Removing it prevents anonymous clients from listing every stored filename.
drop policy if exists "public reads menu images" on storage.objects;
