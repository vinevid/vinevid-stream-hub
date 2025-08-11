-- Update How To content to change "Skip / countdown" to "wait for the countdown"
UPDATE public.how_to_content 
SET content = REPLACE(content, 'Skip / countdown', 'wait for the countdown')
WHERE id = 1;

-- Auto-approve all new comments by changing default status
ALTER TABLE public.comments ALTER COLUMN status SET DEFAULT 'approved';

-- Update existing pending comments to approved
UPDATE public.comments SET status = 'approved' WHERE status = 'pending';