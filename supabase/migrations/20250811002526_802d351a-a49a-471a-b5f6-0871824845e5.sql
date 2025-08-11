-- Add parent_id to comments table for reply functionality
ALTER TABLE public.comments ADD COLUMN parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- Add admin_reply flag to identify admin responses
ALTER TABLE public.comments ADD COLUMN is_admin_reply BOOLEAN DEFAULT FALSE;

-- Create index for better performance when fetching replies
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_video_parent ON public.comments(video_id, parent_id);