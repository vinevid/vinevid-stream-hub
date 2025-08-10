-- Clean up and recreate admin user properly
DELETE FROM auth.users WHERE email = 'admin@vinevid.com';
DELETE FROM public.user_roles;

-- We'll create the user through the API, but first let's set up a simple password for testing
-- Create a temporary admin user that we can sign up through the frontend
INSERT INTO public.site_settings (id, allowed_admin_emails) 
VALUES (1, ARRAY['admin@vinevid.com']) 
ON CONFLICT (id) DO UPDATE SET allowed_admin_emails = ARRAY['admin@vinevid.com'];