-- Clean up existing users and set up admin account properly
DELETE FROM auth.users;
DELETE FROM public.user_roles;

-- Insert admin user directly into auth.users with confirmed email
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@vinevid.com',
  crypt('vinevid#2025', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated'
);

-- Get the admin user ID and create admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'admin@vinevid.com';