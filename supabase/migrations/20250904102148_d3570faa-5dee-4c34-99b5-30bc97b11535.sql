-- Remove admin emails from public site_settings and create secure admin config
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS allowed_admin_emails;

-- Create a secure admin configuration table
CREATE TABLE IF NOT EXISTS public.admin_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  allowed_emails TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS on admin_config - only admins can access
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_config access
CREATE POLICY "Only admins can access admin config" 
ON public.admin_config 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update the promote_if_allowed function to use the secure table
CREATE OR REPLACE FUNCTION public.promote_if_allowed()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
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
  
  -- Get allowed emails from secure admin_config table
  SELECT allowed_emails INTO allowed FROM public.admin_config WHERE id = 1;
  if allowed is null then
    allowed := '{}';
  end if;
  
  -- Check if user is already admin
  SELECT exists(SELECT 1 FROM public.user_roles WHERE user_id = uid AND role = 'admin') INTO is_admin;
  if is_admin then
    return true;
  end if;
  
  -- Promote if email is allowed
  if uemail = any(allowed) then
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
    return true;
  end if;
  
  return false;
end;
$function$;

-- Change comment default status to pending instead of approved
ALTER TABLE public.comments ALTER COLUMN status SET DEFAULT 'pending'::comment_status;

-- Insert initial admin config row (empty allowed emails for security)
INSERT INTO public.admin_config (id, allowed_emails) 
VALUES (1, '{}') 
ON CONFLICT (id) DO NOTHING;