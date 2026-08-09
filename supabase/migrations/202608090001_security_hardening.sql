-- Defense in depth for the public Data API and the admin dashboard.
-- Safe to run after 202608080001_initial.sql.

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

revoke all on table
  public.profiles,
  public.categories,
  public.menu_items,
  public.set_items,
  public.tables,
  public.orders,
  public.order_items,
  public.restaurant_settings,
  public.promotions
from anon, authenticated;

grant select on table
  public.categories,
  public.menu_items,
  public.tables,
  public.restaurant_settings,
  public.promotions
to anon, authenticated;

grant select on table
  public.profiles,
  public.set_items,
  public.orders,
  public.order_items
to authenticated;

grant insert, update, delete on table
  public.categories,
  public.menu_items,
  public.set_items,
  public.tables,
  public.orders,
  public.order_items,
  public.promotions
to authenticated;

grant update on table public.restaurant_settings to authenticated;
grant usage, select on all sequences in schema public to authenticated;

drop policy if exists "public reads visible categories" on public.categories;
create policy "public reads visible categories"
on public.categories for select to anon, authenticated
using (is_visible and not is_archived);

drop policy if exists "public reads visible menu" on public.menu_items;
create policy "public reads visible menu"
on public.menu_items for select to anon, authenticated
using (not is_archived and (is_visible_public or is_visible_dine_in));

drop policy if exists "public reads active tables" on public.tables;
create policy "public reads active tables"
on public.tables for select to anon, authenticated
using (is_active and not is_archived);

drop policy if exists "public reads active settings" on public.restaurant_settings;
create policy "public reads active settings"
on public.restaurant_settings for select to anon, authenticated
using (true);

drop policy if exists "public reads active promotions" on public.promotions;
create policy "public reads active promotions"
on public.promotions for select to anon, authenticated
using (is_active and status = 'active' and not is_archived);

drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles"
on public.profiles for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories"
on public.categories for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "admins manage menu" on public.menu_items;
create policy "admins manage menu"
on public.menu_items for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "admins manage set items" on public.set_items;
create policy "admins manage set items"
on public.set_items for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "admins manage tables" on public.tables;
create policy "admins manage tables"
on public.tables for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "admins manage orders" on public.orders;
create policy "admins manage orders"
on public.orders for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "admins manage order items" on public.order_items;
create policy "admins manage order items"
on public.order_items for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "admins manage settings" on public.restaurant_settings;
create policy "admins manage settings"
on public.restaurant_settings for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "admins manage promotions" on public.promotions;
create policy "admins manage promotions"
on public.promotions for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

update storage.buckets
set public = true,
    file_size_limit = 8000000,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif'
    ]
where id = 'menu-images';

drop policy if exists "public reads menu images" on storage.objects;

drop policy if exists "admins upload menu images" on storage.objects;
create policy "admins upload menu images"
on storage.objects for insert to authenticated
with check (bucket_id = 'menu-images' and (select public.is_admin()));

drop policy if exists "admins update menu images" on storage.objects;
create policy "admins update menu images"
on storage.objects for update to authenticated
using (bucket_id = 'menu-images' and (select public.is_admin()))
with check (bucket_id = 'menu-images' and (select public.is_admin()));

drop policy if exists "admins delete menu images" on storage.objects;
create policy "admins delete menu images"
on storage.objects for delete to authenticated
using (bucket_id = 'menu-images' and (select public.is_admin()));
