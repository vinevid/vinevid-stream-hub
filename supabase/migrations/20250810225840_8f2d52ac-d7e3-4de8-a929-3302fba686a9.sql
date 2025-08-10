-- Add admin email to allowed list for testing
UPDATE public.site_settings 
SET allowed_admin_emails = array['admin@vinevid.com', 'test@admin.com']
WHERE id = 1;

-- If no site_settings record exists, create one
INSERT INTO public.site_settings (id, site_name, tagline, theme_color, allowed_admin_emails) 
VALUES (1, 'VineVid', 'Fast. Free. Forever. VineVid.', '#FF6A00', array['admin@vinevid.com', 'test@admin.com'])
ON CONFLICT (id) DO UPDATE SET 
  allowed_admin_emails = array['admin@vinevid.com', 'test@admin.com'];