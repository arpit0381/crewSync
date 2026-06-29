-- 1. Add 'event_id' column to notifications table
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id) ON DELETE CASCADE;

-- 2. Create event_feedback table
CREATE TABLE IF NOT EXISTS public.event_feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(event_id, user_id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.event_feedback ENABLE ROW LEVEL SECURITY;

-- 4. Drop policies if they exist to prevent errors during migration runs
DROP POLICY IF EXISTS "Students can insert their own feedback" ON public.event_feedback;
DROP POLICY IF EXISTS "Students can read their own feedback" ON public.event_feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.event_feedback;

-- 5. Create RLS Policies
-- Students can insert feedback only for events they are registered in
CREATE POLICY "Students can insert their own feedback" ON public.event_feedback
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.registrations
      WHERE registrations.user_id = auth.uid() AND registrations.event_id = event_feedback.event_id
    )
  );

-- Students can view their own feedback submissions
CREATE POLICY "Students can read their own feedback" ON public.event_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all feedback records
CREATE POLICY "Admins can view all feedback" ON public.event_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'department_admin', 'club_admin', 'tournament_admin')
    )
  );
