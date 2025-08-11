-- Add top drama selection fields to videos table
ALTER TABLE public.videos 
ADD COLUMN top_cdrama boolean NOT NULL DEFAULT false,
ADD COLUMN top_kdrama boolean NOT NULL DEFAULT false;