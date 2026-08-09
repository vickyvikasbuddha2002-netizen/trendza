-- ═══════════════════════════════════════════════════════════════════
--  Trendza — one-time Supabase setup
--
--  Paste the whole file into the Supabase SQL Editor and hit Run.
--  Safe to run more than once.
--
--  The security model in one line: the anon key can INSERT a wish and
--  can READ ONE by id, but can never list, edit or delete anything.
--
--  That distinction matters more here than anywhere else. The anon key
--  ships publicly in the browser bundle, so a plain `select` policy on
--  `wishes` would let anyone fetch /rest/v1/wishes?select=* and walk
--  every family photograph on the site. So the tables have NO select
--  policy at all, and reads go exclusively through security-definer
--  functions that demand an exact 12-character id.
-- ═══════════════════════════════════════════════════════════════════

-- ── Tables ────────────────────────────────────────────────────────

create table if not exists public.wishes (
  id          text primary key,
  to_name     text        not null,
  from_name   text        not null,
  message     text        not null,          -- AES-GCM ciphertext, base64
  photos      jsonb       not null default '[]'::jsonb,
  retention   text        not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz                    -- null = kept forever
);

create table if not exists public.agreements (
  id           text primary key,
  party_a      text        not null,
  party_b      text        not null,
  clauses      jsonb       not null,
  signature_a  text        not null,
  signature_b  text,                         -- null until countersigned
  created_at   timestamptz not null default now(),
  signed_at    timestamptz
);

create table if not exists public.stats (
  id          text primary key,
  visits      bigint not null default 0,
  wishes      bigint not null default 0,
  agreements  bigint not null default 0
);

insert into public.stats (id) values ('global') on conflict (id) do nothing;

-- Used by the nightly cleanup to find what has expired.
create index if not exists wishes_expires_at_idx
  on public.wishes (expires_at) where expires_at is not null;

-- ── Row level security ────────────────────────────────────────────

alter table public.wishes     enable row level security;
alter table public.agreements enable row level security;
alter table public.stats      enable row level security;

-- Deliberately absent: any SELECT policy on wishes or agreements.
-- Without one, PostgREST returns nothing for a direct table query, and
-- enumeration is impossible. Reads happen through the functions below.

drop policy if exists "anyone may create a wish" on public.wishes;
create policy "anyone may create a wish"
  on public.wishes for insert to anon, authenticated
  with check (
    length(to_name)   between 1 and 60
    and length(from_name) between 1 and 60
    -- Ciphertext, not typed characters. A 600-character Devanagari
    -- message is ~2440 characters once encrypted and base64-encoded.
    and length(message) <= 4000
    and jsonb_typeof(photos) = 'array'
    and jsonb_array_length(photos) <= 12
    and retention in ('24h', '7d', '30d', 'forever')
  );

drop policy if exists "anyone may create an agreement" on public.agreements;
create policy "anyone may create an agreement"
  on public.agreements for insert to anon, authenticated
  with check (
    length(party_a) between 1 and 60
    and length(party_b) between 1 and 60
    and jsonb_typeof(clauses) = 'array'
    and jsonb_array_length(clauses) between 1 and 12
    and length(signature_a) < 200000
    and signature_b is null
  );

-- The three totals on the landing page. A single row, nothing private.
drop policy if exists "anyone may read the totals" on public.stats;
create policy "anyone may read the totals"
  on public.stats for select to anon, authenticated using (true);

-- No update or delete policy anywhere. Wishes are immutable once sent,
-- and there are no accounts to prove ownership with.

-- ── Reads: by exact id only ───────────────────────────────────────

create or replace function public.get_wish(p_id text)
returns setof public.wishes
language sql
security definer
set search_path = public
as $$
  select * from public.wishes
  where id = p_id
    and (expires_at is null or expires_at > now());
$$;

create or replace function public.get_agreement(p_id text)
returns setof public.agreements
language sql
security definer
set search_path = public
as $$
  select * from public.agreements where id = p_id;
$$;

-- Distinguishes "never existed" from "expired", so the viewer can say
-- which one happened instead of showing a generic dead end.
create or replace function public.wish_status(p_id text)
returns table (status text, to_name text, from_name text)
language sql
security definer
set search_path = public
as $$
  select
    case when w.expires_at is not null and w.expires_at <= now()
         then 'expired' else 'ok' end,
    w.to_name,
    w.from_name
  from public.wishes w
  where w.id = p_id;
$$;

-- ── Writes that need more than an insert ──────────────────────────

-- The counter-signature. Refuses to overwrite one that already exists,
-- so a forwarded link cannot be used to sign over someone else.
create or replace function public.sign_agreement(p_id text, p_signature text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated int;
begin
  if p_signature is null or length(p_signature) >= 200000 then
    return false;
  end if;

  update public.agreements
     set signature_b = p_signature,
         signed_at   = now()
   where id = p_id
     and signature_b is null;

  get diagnostics updated = row_count;
  return updated > 0;
end;
$$;

-- Atomic, so simultaneous visitors cannot lose an increment the way a
-- read-modify-write would.
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
         agreements = agreements + (case when p_field = 'agreements' then 1 else 0 end)
   where id = 'global'
     and p_field in ('visits', 'wishes', 'agreements');
end;
$$;

grant execute on function public.get_wish(text)                to anon, authenticated;
grant execute on function public.get_agreement(text)           to anon, authenticated;
grant execute on function public.wish_status(text)             to anon, authenticated;
grant execute on function public.sign_agreement(text, text)    to anon, authenticated;
grant execute on function public.bump_stat(text)               to anon, authenticated;

-- ── Storage ───────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit)
values ('wishes', 'wishes', true, 4194304)
on conflict (id) do update set public = true, file_size_limit = 4194304;

-- Uploads are ciphertext, and the key never leaves the sender's browser,
-- so a stranger fetching one of these objects gets meaningless bytes.
-- Public read therefore costs nothing, and the content type cannot be
-- validated for the same reason.
drop policy if exists "anyone may upload wish photos" on storage.objects;
create policy "anyone may upload wish photos"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'wishes');

drop policy if exists "anyone may read wish photos" on storage.objects;
create policy "anyone may read wish photos"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'wishes');

-- No update or delete policy: uploaded photos cannot be overwritten or
-- removed with the public key. Deletion happens in the cleanup job,
-- which uses the service role.
