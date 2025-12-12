-- Fix add_clients_to_gallery function to include admin authorization check
CREATE OR REPLACE FUNCTION public.add_clients_to_gallery(p_gallery_id uuid, p_emails text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_email text;
  v_user_id uuid;
  v_created jsonb := '[]'::jsonb;
  v_existing jsonb := '[]'::jsonb;
  v_temp_password text;
  v_auth_user_id uuid;
begin
  -- Security check: Only admins can add clients to galleries
  IF NOT has_role(auth.uid(), 'admin'::role_t) THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

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
$function$;