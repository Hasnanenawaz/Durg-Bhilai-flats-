-- Durg Bhilai Flats & Flatmates — Supabase schema
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- The website talks to Supabase only from the server with the service role key,
-- so RLS is ON with no public policies: nobody can read the tables directly from a browser.

create extension if not exists "pgcrypto";

-- ── Users (guests, hosts and admins share one account) ──
create table if not exists public.users (
  id              uuid primary key default gen_random_uuid(),
  phone           text not null unique,            -- 10-digit Indian mobile, e.g. 9876543210
  name            text,
  email           text,
  whatsapp        text,
  active_mode     text not null default 'guest' check (active_mode in ('guest','host')),
  is_host         boolean not null default false,
  is_blocked      boolean not null default false,
  lead_status     text not null default 'new' check (lead_status in ('new','called','interested','not_interested','converted')),
  admin_notes     text,
  signup_city     text,
  signup_source   text,
  login_count     integer not null default 1,
  last_login_at   timestamptz default now(),
  created_at      timestamptz not null default now()
);

-- ── Properties (flats, PGs, rooms, flatmate-wanted posts) ──
create table if not exists public.properties (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  owner_id        uuid not null references public.users(id) on delete cascade,
  listing_type    text not null check (listing_type in ('flat','pg','room','flatmate')),
  title           text not null,
  description     text,
  bhk             text,
  furnishing      text,
  tenant_pref     text default 'any',
  rent            integer not null check (rent >= 0),
  deposit         integer default 0,
  maintenance     integer default 0,
  food_included   boolean default false,
  available_from  date,
  city            text not null,                    -- city slug, e.g. bhilai
  locality        text,
  address         text,
  landmark        text,
  pincode         text,
  lat             double precision,
  lng             double precision,
  amenities       jsonb not null default '[]',
  images          jsonb not null default '[]',      -- [{ url, path }]
  contact_name    text,
  contact_phone   text,
  whatsapp        text,
  status          text not null default 'pending' check (status in ('pending','approved','hidden','rented','rejected')),
  featured        boolean not null default false,
  verified        boolean not null default false,
  admin_hidden    boolean not null default false,   -- hidden by an admin; the owner can't relist it
  approved_at     timestamptz,
  views           integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists properties_search_idx on public.properties (status, city, listing_type, rent);
create index if not exists properties_owner_idx on public.properties (owner_id);
-- For databases created before admin_hidden existed:
alter table public.properties add column if not exists admin_hidden boolean not null default false;

-- ── Inquiries: logged every time a guest reveals an owner's number ──
create table if not exists public.inquiries (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid not null references public.properties(id) on delete cascade,
  guest_id        uuid not null references public.users(id) on delete cascade,
  owner_id        uuid not null references public.users(id) on delete cascade,
  guest_name      text,
  guest_phone     text,
  property_title  text,
  message         text,
  created_at      timestamptz not null default now()
);
create index if not exists inquiries_owner_idx on public.inquiries (owner_id, created_at desc);
create index if not exists inquiries_guest_idx on public.inquiries (guest_id, created_at desc);

-- ── Saved / shortlisted places ──
create table if not exists public.favorites (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  property_id     uuid not null references public.properties(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (user_id, property_id)
);

-- ── Reports on listings (fake, already rented, broker posing as owner…) ──
create table if not exists public.reports (
  id              uuid primary key default gen_random_uuid(),
  property_id     uuid references public.properties(id) on delete cascade,
  user_id         uuid references public.users(id) on delete set null,
  reason          text not null,
  details         text,
  resolved        boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ── Blog ──
create table if not exists public.blogs (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  excerpt         text,
  content         text not null default '',        -- Markdown
  cover_image     text,
  tags            jsonb not null default '[]',
  city            text,
  faq             jsonb not null default '[]',      -- [{ q, a }] → FAQPage schema
  status          text not null default 'draft' check (status in ('draft','published')),
  author          text default 'Durg Bhilai Flats Team',
  seo_title       text,
  seo_description text,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.users      enable row level security;
alter table public.properties enable row level security;
alter table public.inquiries  enable row level security;
alter table public.favorites  enable row level security;
alter table public.reports    enable row level security;
alter table public.blogs      enable row level security;

-- ── Public storage bucket for property and blog images ──
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;
