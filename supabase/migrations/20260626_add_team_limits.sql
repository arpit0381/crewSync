-- Add min_members and max_members to teams table
ALTER TABLE public.teams
ADD COLUMN min_members INTEGER DEFAULT 1,
ADD COLUMN max_members INTEGER DEFAULT 1;

-- Update existing teams to match their respective events' limits if applicable
UPDATE public.teams t
SET 
  min_members = COALESCE(e.min_team_size, 1),
  max_members = COALESCE(e.max_team_size, 1)
FROM public.events e
WHERE t.event_id = e.id;
