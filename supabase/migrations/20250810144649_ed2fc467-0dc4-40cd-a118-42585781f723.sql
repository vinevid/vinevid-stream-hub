-- Enable necessary extensions
create extension if not exists pgcrypto;

-- 1) Roles (enum + table + helper)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- 2) Utility trigger for updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3) Site settings
create table if not exists public.site_settings (
  id int primary key default 1,
  site_name text not null default 'VineVid',
  tagline text default 'Fast. Free. Forever. VineVid.',
  theme_color text not null default '#FF6A00',
  dark_mode_default boolean not null default false,
  logo_url text,
  footer_links jsonb default '{"dmca":"/dmca","contact":"/contact","about":"/about"}',
  splash_tagline text default 'Fast. Free. Forever. VineVid.',
  allowed_admin_emails text[] default '{}',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Seed singleton row if not exists
insert into public.site_settings (id) values (1)
on conflict (id) do nothing;

create trigger trg_site_settings_updated
before update on public.site_settings
for each row execute function public.update_updated_at_column();

-- RLS: anyone can read settings; only admin can update
create policy "Site settings are viewable by everyone"
  on public.site_settings for select using (true);
create policy "Only admins can update site settings"
  on public.site_settings for update to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 4) Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create trigger trg_categories_updated
before update on public.categories
for each row execute function public.update_updated_at_column();

-- RLS
create policy "Categories selectable by all"
  on public.categories for select using (true);
create policy "Only admins manage categories"
  on public.categories for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Seed only Kdrama and Cdrama if table empty
insert into public.categories (name, position) 
select * from (values ('Kdrama', 1), ('Cdrama', 2)) as v(name, position)
where not exists (select 1 from public.categories);

-- 5) Videos
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  genre text,
  tags text[] default '{}',
  year int,
  category_id uuid not null references public.categories(id) on delete restrict,
  poster_url text,
  trending boolean not null default false,
  comments_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.videos enable row level security;

create trigger trg_videos_updated
before update on public.videos
for each row execute function public.update_updated_at_column();

-- Indexes
create index if not exists idx_videos_category on public.videos(category_id);
create index if not exists idx_videos_created_at on public.videos(created_at desc);
create index if not exists idx_videos_tags on public.videos using gin (tags);

-- RLS: read by everyone, manage by admin
create policy "Videos selectable by all" on public.videos for select using (true);
create policy "Only admins manage videos" on public.videos for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 6) Video Downloads (episodes / mirrors)
create table if not exists public.video_downloads (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  label text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.video_downloads enable row level security;

create trigger trg_video_downloads_updated
before update on public.video_downloads
for each row execute function public.update_updated_at_column();

create index if not exists idx_video_downloads_video on public.video_downloads(video_id);

create policy "Downloads selectable by all" on public.video_downloads for select using (true);
create policy "Only admins manage downloads" on public.video_downloads for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 7) Comments with moderation
DO $$ BEGIN
  CREATE TYPE public.comment_status AS ENUM ('pending','approved','spam');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  name text not null,
  content text not null,
  status public.comment_status not null default 'pending',
  created_at timestamptz not null default now(),
  ip_hash text
);

alter table public.comments enable row level security;

-- RLS:
-- Public can insert comments but they become pending; no updates/deletes
create policy "Anyone can insert comments"
  on public.comments for insert
  with check (true);

-- Public can only read approved comments
create policy "Public reads approved comments only"
  on public.comments for select
  using (status = 'approved');

-- Admins can manage all comments
create policy "Admins manage comments"
  on public.comments for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 8) How-to content (editable block)
create table if not exists public.how_to_content (
  id int primary key default 1,
  content text default '',
  updated_at timestamptz not null default now()
);

alter table public.how_to_content enable row level security;

insert into public.how_to_content (id, content) values (1, 'Step 1: Click your episode\nStep 2: Wait for secure link\nStep 3: Skip ad / countdown\nStep 4: Download starts')
on conflict (id) do nothing;

create trigger trg_how_to_updated
before update on public.how_to_content
for each row execute function public.update_updated_at_column();

create policy "How-to readable by all" on public.how_to_content for select using (true);
create policy "Only admins update how-to" on public.how_to_content for update to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 9) Storage buckets for posters and site assets
insert into storage.buckets (id, name, public) values ('posters', 'posters', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

-- Storage policies
-- Posters are publicly readable
create policy "Public read posters"
  on storage.objects for select
  using (bucket_id = 'posters');

-- Site assets are publicly readable
create policy "Public read site assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');

-- Admins can manage files in both buckets (folder structure: user id is not required; allow any path)
create policy "Admins manage posters"
  on storage.objects for all to authenticated
  using (bucket_id = 'posters' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'posters' and public.has_role(auth.uid(), 'admin'));

create policy "Admins manage site assets"
  on storage.objects for all to authenticated
  using (bucket_id = 'site-assets' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'site-assets' and public.has_role(auth.uid(), 'admin'));

-- 10) Helper function: promote current user to admin if their email is whitelisted in settings
create or replace function public.promote_if_allowed()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  allowed text[];
  uid uuid := auth.uid();
  uemail text := auth.email();
  is_admin boolean;
begin
  if uid is null then
    return false;
  end if;
  select allowed_admin_emails into allowed from public.site_settings where id = 1;
  if allowed is null then
    allowed := '{}';
  end if;
  select exists(select 1 from public.user_roles where user_id = uid and role = 'admin') into is_admin;
  if is_admin then
    return true;
  end if;
  if uemail = any(allowed) then
    insert into public.user_roles (user_id, role) values (uid, 'admin') on conflict do nothing;
    return true;
  end if;
  return false;
end;
$$;

-- Ensure RLS doesn't block the function
revoke all on function public.promote_if_allowed from public;
grant execute on function public.promote_if_allowed to authenticated;

-- Note: Remember to set allowed_admin_emails in site_settings to your admin email.
