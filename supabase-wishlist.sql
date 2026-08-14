-- ═══════════════════════════════════════════════════════════════════
--  Trendza Wishlist — run once in the Supabase SQL Editor
--
--  Same security shape as wishes: the anon key may INSERT and may read
--  ONE row by id, but can never list, edit or delete. Reads go through
--  security-definer functions so a public key cannot enumerate the table.
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.wishlists (
  id           text primary key,
  from_name    text        not null,
  to_name      text        not null,
  from_gender  text        not null default 'f',
  wishes       jsonb       not null,
  views        bigint      not null default 0,
  -- Set when the list was created from someone else's list. This single
  -- column is the viral coefficient: rows with a parent, over links opened.
  parent_id    text,
  created_at   timestamptz not null default now()
);

create index if not exists wishlists_parent_idx
  on public.wishlists (parent_id) where parent_id is not null;

-- ── Counter ───────────────────────────────────────────────────────
-- The landing page totals gain a fourth number. Added here rather than in
-- the original setup file so this stays the single script to run.

alter table public.stats add column if not exists wishlists bigint not null default 0;

-- Replaces the three-field version from supabase-setup.sql.
create or replace function public.bump_stat(p_field text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.stats
     set visits     = visits     + (case when p_field = 'visits'     then 1 else 0 end),
         wishes     = wishes     + (case when p_field = 'wishes'     then 1 else 0 end),
         agreements = agreements + (case when p_field = 'agreements' then 1 else 0 end),
         wishlists  = wishlists  + (case when p_field = 'wishlists'  then 1 else 0 end)
   where id = 'global'
     and p_field in ('visits', 'wishes', 'agreements', 'wishlists');
end;
$$;

grant execute on function public.bump_stat(text) to anon, authenticated;

alter table public.wishlists enable row level security;

-- Deliberately no SELECT policy. Reads happen through get_wishlist below.
drop policy if exists "anyone may create a wishlist" on public.wishlists;
create policy "anyone may create a wishlist"
  on public.wishlists for insert to anon, authenticated
  with check (
    length(from_name) between 1 and 20
    and length(to_name) between 1 and 20
    and from_gender in ('f', 'm')
    and jsonb_typeof(wishes) = 'array'
    and jsonb_array_length(wishes) between 1 and 6
    and views = 0
  );

create or replace function public.get_wishlist(p_id text)
returns setof public.wishlists
language sql
security definer
set search_path = public
as $$
  select * from public.wishlists where id = p_id;
$$;

-- Counts an open. Separate from the read so the server-rendered page and
-- the OG crawler do not both inflate it.
create or replace function public.bump_wishlist_view(p_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.wishlists set views = views + 1 where id = p_id;
$$;

-- The four numbers that decide whether the loop works.
create or replace function public.wishlist_stats()
returns table (created bigint, opened bigint, from_loop bigint)
language sql
security definer
set search_path = public
as $$
  select
    count(*)::bigint,
    coalesce(sum(views), 0)::bigint,
    count(*) filter (where parent_id is not null)::bigint
  from public.wishlists;
$$;

grant execute on function public.get_wishlist(text)        to anon, authenticated;
grant execute on function public.bump_wishlist_view(text)  to anon, authenticated;
grant execute on function public.wishlist_stats()          to anon, authenticated;
