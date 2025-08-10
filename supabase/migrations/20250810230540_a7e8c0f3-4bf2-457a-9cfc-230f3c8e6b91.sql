-- Create app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create or replace the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$function$;

-- Create or replace the promote_if_allowed function
CREATE OR REPLACE FUNCTION public.promote_if_allowed()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
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
$function$;