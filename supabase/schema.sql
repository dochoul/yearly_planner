create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  "order"    integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.work_entries (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  year        integer not null,
  month       integer not null check (month between 1 and 12),
  color       text not null default 'blue'
                check (color in ('red', 'orange', 'green', 'blue', 'gray', 'dark')),
  text        text not null,
  date_type   text not null default 'single'
                check (date_type in ('single', 'range')),
  date_value  text,
  date_from   text,
  date_to     text,
  highlight   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_work_entries_year_month on public.work_entries(year, month);
create index idx_work_entries_category_id on public.work_entries(category_id);

alter table public.categories enable row level security;
alter table public.work_entries enable row level security;

create policy "allow all" on public.categories for all using (true) with check (true);
create policy "allow all" on public.work_entries for all using (true) with check (true);
