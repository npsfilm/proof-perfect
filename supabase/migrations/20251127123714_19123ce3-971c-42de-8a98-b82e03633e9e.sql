-- Create trigger to auto-create profile and assign client role on signup

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert profile
  insert into public.profiles (id, email)
  values (new.id, new.email);
  
  -- Assign default client role
  insert into public.user_roles (user_id, role)
  values (new.id, 'client');
  
  return new;
end;
$$;

-- Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();