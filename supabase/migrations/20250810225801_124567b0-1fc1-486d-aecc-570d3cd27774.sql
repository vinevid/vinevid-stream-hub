-- Fix RLS policies for admin access

-- Drop existing policies that might be blocking admin access
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.videos;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.videos;
DROP POLICY IF EXISTS "Enable read for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Enable read for all users" ON public.video_downloads;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.video_downloads;
DROP POLICY IF EXISTS "Enable read for all users" ON public.comments;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.comments;
DROP POLICY IF EXISTS "Enable read for all users" ON public.site_settings;
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.site_settings;

-- Create comprehensive policies for videos table
CREATE POLICY "Anyone can view videos" ON public.videos
FOR SELECT USING (true);

CREATE POLICY "Admins can insert videos" ON public.videos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update videos" ON public.videos
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete videos" ON public.videos
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create comprehensive policies for categories table
CREATE POLICY "Anyone can view categories" ON public.categories
FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories" ON public.categories
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update categories" ON public.categories
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete categories" ON public.categories
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create comprehensive policies for video_downloads table
CREATE POLICY "Anyone can view video downloads" ON public.video_downloads
FOR SELECT USING (true);

CREATE POLICY "Admins can insert video downloads" ON public.video_downloads
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update video downloads" ON public.video_downloads
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete video downloads" ON public.video_downloads
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create comprehensive policies for comments table
CREATE POLICY "Anyone can view approved comments" ON public.comments
FOR SELECT USING (status = 'approved' OR auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can insert comments" ON public.comments
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update comments" ON public.comments
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete comments" ON public.comments
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create comprehensive policies for site_settings table
CREATE POLICY "Anyone can view site settings" ON public.site_settings
FOR SELECT USING (true);

CREATE POLICY "Admins can update site settings" ON public.site_settings
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create storage policies for admin uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('posters', 'posters', true) ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admin uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read" ON storage.objects;

-- Create storage policies for poster uploads
CREATE POLICY "Anyone can view posters" ON storage.objects
FOR SELECT USING (bucket_id = 'posters');

CREATE POLICY "Admins can upload posters" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'posters' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update posters" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'posters' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete posters" ON storage.objects
FOR DELETE USING (
  bucket_id = 'posters' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);