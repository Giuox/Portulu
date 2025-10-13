alter table public.profiles add column if not exists rider_available boolean default false;

create policy if not exists "riders update own availability" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);


