-- Enable RLS
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.zones enable row level security;

-- Profiles
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));
create policy "insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "update own profile or admin" on public.profiles
  for update using (auth.uid() = id or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- Zones: public readable
create policy "zones are public" on public.zones for select using (true);

-- Restaurants
create policy "read restaurants" on public.restaurants for select using (true);
create policy "manage own restaurant" on public.restaurants
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Menu items
create policy "read menu items" on public.menu_items for select using (true);
create policy "manage menu items of own restaurant" on public.menu_items
  for all using (
    exists (
      select 1 from public.restaurants r where r.id = restaurant_id and r.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.restaurants r where r.id = restaurant_id and r.user_id = auth.uid()
    )
  );

-- Orders
create policy "read orders by role" on public.orders for select using (
  customer_id = auth.uid()
  or rider_id = auth.uid()
  or exists (
    select 1 from public.restaurants r where r.id = restaurant_id and r.user_id = auth.uid()
  )
  or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "customers insert own orders" on public.orders
  for insert with check (customer_id = auth.uid());

create policy "update order status by restaurant or rider or admin" on public.orders
  for update using (
    exists (select 1 from public.restaurants r where r.id = restaurant_id and r.user_id = auth.uid())
    or rider_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


