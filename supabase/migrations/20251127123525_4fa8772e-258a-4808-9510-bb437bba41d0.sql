-- Create enums for type safety
create type public.role_t as enum ('admin', 'client');
create type public.gallery_status_t as enum ('Draft', 'Sent', 'Reviewed', 'Delivered');
create type public.salutation_t as enum ('Du', 'Sie');

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- User roles table (separate for security)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.role_t not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

alter table public.user_roles enable row level security;

-- Galleries table
create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  status public.gallery_status_t not null default 'Draft',
  package_target_count int not null,
  salutation_type public.salutation_t not null,
  final_delivery_link text,
  is_locked boolean not null default false,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique partial index on slug to prevent duplicates
create unique index galleries_slug_unique_idx on public.galleries(slug);

alter table public.galleries enable row level security;

-- Gallery access (M2M join)
create table public.gallery_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, gallery_id)
);

create index gallery_access_user_id_idx on public.gallery_access(user_id);
create index gallery_access_gallery_id_idx on public.gallery_access(gallery_id);

alter table public.gallery_access enable row level security;

-- Photos table
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  filename text not null,
  storage_url text not null,
  upload_order int not null,
  is_selected boolean not null default false,
  client_comment text,
  staging_requested boolean not null default false,
  staging_style text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(gallery_id, upload_order)
);

create index photos_gallery_id_idx on public.photos(gallery_id);

alter table public.photos enable row level security;

-- Gallery feedback table
create table public.gallery_feedback (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  author_user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.gallery_feedback enable row level security;

-- Staging references table
create table public.staging_references (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  uploader_user_id uuid not null references public.profiles(id) on delete cascade,
  file_url text not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.staging_references enable row level security;

-- Webhook logs table
create table public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid references public.galleries(id) on delete set null,
  type text not null,
  status text not null,
  response_body jsonb,
  created_at timestamptz not null default now()
);

alter table public.webhook_logs enable row level security;

-- System settings (singleton for admin)
create table public.system_settings (
  id uuid primary key default gen_random_uuid(),
  zapier_webhook_send text,
  zapier_webhook_deliver text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.system_settings enable row level security;

-- Insert singleton row for system_settings
insert into public.system_settings (id) values (gen_random_uuid());

-- Create updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at triggers
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_galleries_updated_at before update on public.galleries
  for each row execute function public.update_updated_at_column();

create trigger update_photos_updated_at before update on public.photos
  for each row execute function public.update_updated_at_column();

create trigger update_system_settings_updated_at before update on public.system_settings
  for each row execute function public.update_updated_at_column();

-- Helper function to check if user has a specific role
create or replace function public.has_role(_user_id uuid, _role public.role_t)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Helper function to get current user's role
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role::text 
     from public.user_roles 
     where user_id = auth.uid() 
     limit 1),
    'client'
  )
$$;

-- Generate unique slug function
create or replace function public.generate_unique_slug(p_name text)
returns text
language plpgsql
as $$
declare
  base_slug text;
  final_slug text;
  counter int := 2;
begin
  -- Create base slug: lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(trim(regexp_replace(p_name, '[^a-zA-Z0-9\s-]', '', 'g')));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  
  final_slug := base_slug;
  
  -- Check for collisions and append counter if needed
  while exists(select 1 from public.galleries where slug = final_slug) loop
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  end loop;
  
  return final_slug;
end;
$$;

-- Add clients to gallery function
create or replace function public.add_clients_to_gallery(
  p_gallery_id uuid,
  p_emails text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_user_id uuid;
  v_created jsonb := '[]'::jsonb;
  v_existing jsonb := '[]'::jsonb;
  v_temp_password text;
  v_auth_user_id uuid;
begin
  foreach v_email in array p_emails loop
    -- Normalize email
    v_email := lower(trim(v_email));
    
    -- Check if profile exists
    select id into v_user_id from public.profiles where email = v_email;
    
    if v_user_id is null then
      -- Generate random temp password
      v_temp_password := encode(gen_random_bytes(12), 'base64');
      
      -- Create auth user
      insert into auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
      values (
        v_email,
        crypt(v_temp_password, gen_salt('bf')),
        now(),
        jsonb_build_object('temp_password', true)
      )
      returning id into v_auth_user_id;
      
      -- Create profile
      insert into public.profiles (id, email)
      values (v_auth_user_id, v_email)
      returning id into v_user_id;
      
      -- Assign client role
      insert into public.user_roles (user_id, role)
      values (v_user_id, 'client');
      
      -- Add to created list with temp password
      v_created := v_created || jsonb_build_object(
        'email', v_email,
        'user_id', v_user_id,
        'temp_password', v_temp_password
      );
    else
      -- Add to existing list
      v_existing := v_existing || jsonb_build_object(
        'email', v_email,
        'user_id', v_user_id
      );
    end if;
    
    -- Add gallery access (insert ignore if already exists)
    insert into public.gallery_access (user_id, gallery_id)
    values (v_user_id, p_gallery_id)
    on conflict (user_id, gallery_id) do nothing;
  end loop;
  
  return jsonb_build_object(
    'created', v_created,
    'existing', v_existing
  );
end;
$$;

-- RLS Policies

-- Profiles: everyone can read, users can update their own
create policy "Anyone can read profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- User roles: only readable by authenticated users
create policy "Authenticated users can read roles"
  on public.user_roles for select
  to authenticated
  using (true);

create policy "Admins can manage all roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Galleries: admins see all, clients see assigned
create policy "Admins can manage all galleries"
  on public.galleries for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Clients can read assigned galleries"
  on public.galleries for select
  using (
    exists (
      select 1 from public.gallery_access ga
      where ga.gallery_id = galleries.id
        and ga.user_id = auth.uid()
    )
  );

-- Gallery access: admins manage, clients read own
create policy "Admins can manage all gallery access"
  on public.gallery_access for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Users can read their own access"
  on public.gallery_access for select
  using (user_id = auth.uid());

-- Photos: admins manage all, clients read/update selection fields when unlocked
create policy "Admins can manage all photos"
  on public.photos for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Clients can read photos in assigned galleries"
  on public.photos for select
  using (
    exists (
      select 1
      from public.gallery_access ga
      where ga.gallery_id = photos.gallery_id
        and ga.user_id = auth.uid()
    )
  );

create policy "Clients can update selection fields when unlocked"
  on public.photos for update
  using (
    exists (
      select 1
      from public.gallery_access ga
      join public.galleries g on g.id = photos.gallery_id
      where ga.gallery_id = photos.gallery_id
        and ga.user_id = auth.uid()
        and g.is_locked = false
    )
  );

-- Gallery feedback: admins see all, clients see/create in assigned galleries
create policy "Admins can manage all feedback"
  on public.gallery_feedback for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Clients can read feedback in assigned galleries"
  on public.gallery_feedback for select
  using (
    exists (
      select 1
      from public.gallery_access ga
      where ga.gallery_id = gallery_feedback.gallery_id
        and ga.user_id = auth.uid()
    )
  );

create policy "Clients can create feedback in assigned galleries"
  on public.gallery_feedback for insert
  with check (
    auth.uid() = author_user_id
    and exists (
      select 1
      from public.gallery_access ga
      where ga.gallery_id = gallery_feedback.gallery_id
        and ga.user_id = auth.uid()
    )
  );

-- Staging references: similar to feedback
create policy "Admins can manage all staging references"
  on public.staging_references for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Clients can read staging refs in assigned galleries"
  on public.staging_references for select
  using (
    exists (
      select 1
      from public.photos p
      join public.gallery_access ga on ga.gallery_id = p.gallery_id
      where p.id = staging_references.photo_id
        and ga.user_id = auth.uid()
    )
  );

create policy "Clients can create staging refs in assigned galleries"
  on public.staging_references for insert
  with check (
    auth.uid() = uploader_user_id
    and exists (
      select 1
      from public.photos p
      join public.gallery_access ga on ga.gallery_id = p.gallery_id
      where p.id = staging_references.photo_id
        and ga.user_id = auth.uid()
    )
  );

-- Webhook logs: admin only
create policy "Admins can manage webhook logs"
  on public.webhook_logs for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- System settings: admin only
create policy "Admins can manage system settings"
  on public.system_settings for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for proofs
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', false);

-- Storage policies: admins can do anything, clients can read files in assigned galleries
create policy "Admins can manage all files"
  on storage.objects for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Clients can read files in assigned galleries"
  on storage.objects for select
  using (
    bucket_id = 'proofs'
    and exists (
      select 1
      from public.galleries g
      join public.gallery_access ga on ga.gallery_id = g.id
      where ga.user_id = auth.uid()
        and (storage.foldername(name))[1] = g.slug
    )
  );