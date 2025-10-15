-- Azure PostgreSQL initial schema (inspired by existing supabase schema)
create table if not exists users (
  id uuid primary key,
  email text unique not null,
  role text not null check (role in ('user','ristoratore','rider','admin')),
  created_at timestamptz not null default now()
);

create table if not exists restaurants (
  id uuid primary key,
  owner_id uuid not null references users(id),
  name text not null,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key,
  restaurant_id uuid not null references restaurants(id),
  name text not null,
  price_cents int not null check (price_cents > 0),
  available boolean not null default true
);

create table if not exists orders (
  id uuid primary key,
  user_id uuid not null references users(id),
  restaurant_id uuid not null references restaurants(id),
  status text not null check (status in ('created','confirmed','preparing','assigned','picked_up','delivered','cancelled')),
  total_cents int not null,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key,
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity int not null check (quantity > 0),
  price_cents int not null
);

create table if not exists payments (
  id text primary key,
  order_id uuid not null references orders(id),
  amount_cents int not null,
  method text not null check (method in ('stripe','paypal')),
  status text not null check (status in ('authorized','captured','failed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_restaurant on orders(restaurant_id);

