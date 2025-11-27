-- Fix security warnings by setting search_path on functions

-- Update the update_updated_at_column function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Update the generate_unique_slug function
create or replace function public.generate_unique_slug(p_name text)
returns text
language plpgsql
security definer
set search_path = public
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