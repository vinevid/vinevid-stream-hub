-- Fix How To Content table RLS policies
ALTER TABLE public.how_to_content ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read how to content
CREATE POLICY "Anyone can read how to content" 
ON public.how_to_content 
FOR SELECT 
USING (true);

-- Allow admins to update how to content
CREATE POLICY "Admins can update how to content" 
ON public.how_to_content 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Connect comments to database instead of localStorage
-- Add video_id to comments table if needed
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS video_id TEXT;

-- Allow anyone to insert comments
CREATE POLICY "Anyone can insert comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read approved comments
CREATE POLICY "Anyone can read approved comments" 
ON public.comments 
FOR SELECT 
USING (status = 'approved');

-- Allow admins to read all comments
CREATE POLICY "Admins can read all comments" 
ON public.comments 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update comments
CREATE POLICY "Admins can update comments" 
ON public.comments 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete comments
CREATE POLICY "Admins can delete comments" 
ON public.comments 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));