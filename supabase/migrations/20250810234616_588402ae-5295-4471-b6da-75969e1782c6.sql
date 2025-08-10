-- Update allowed admin emails to include the user's real email
UPDATE public.site_settings 
SET allowed_admin_emails = ARRAY['hephzibaholaolu3@gmail.com', 'admin@vinevid.com']
WHERE id = 1;