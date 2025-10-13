-- Portulu Supabase schema (PostgreSQL)
-- Users are managed via Supabase Auth; we store profiles with roles

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  phone text,
  role text not null check (role in ('customer','restaurant','rider','admin')),
  created_at timestamp with time zone default now()
);

create table if not exists public.restaurants (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text,
  rating numeric default 0,
  total_orders integer default 0,
  min_order numeric default 0,
  delivery_time text default '30-40 min',
  active boolean default true,
  zones text[]
);

create table if not exists public.menu_items (
  id bigserial primary key,
  restaurant_id bigint not null references public.restaurants(id) on delete cascade,
  name text not null,
  price numeric not null,
  category text,
  available boolean default true
);

create table if not exists public.zones (
  id bigserial primary key,
  name text unique not null,
  delivery_fee numeric not null
);

create table if not exists public.orders (
  id bigserial primary key,
  order_number text unique not null,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  restaurant_id bigint not null references public.restaurants(id) on delete restrict,
  rider_id uuid null references public.profiles(id) on delete set null,
  status text not null default 'new' check (status in ('new','preparing','ready','delivering','delivered','cancelled')),
  items jsonb not null,
  subtotal numeric not null,
  delivery_fee numeric default 0,
  total numeric not null,
  payment_method text,
  delivery_address text not null,
  delivery_zone text not null,
  customer_phone text not null,
  customer_name text not null,
  notes text,
  created_at timestamp with time zone default now()
);

-- Seed zones
insert into public.zones (name, delivery_fee) values
  ('Scicli Centro', 0),
  ('Sampieri', 3),
  ('Donnalucata', 3),
  ('Cava d''Aliga', 3.5),
  ('Playa Grande', 2.5)
on conflict do nothing;


