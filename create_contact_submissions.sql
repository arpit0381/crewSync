-- SQL Script to create the contact_submissions table and establish RLS policies

-- 1. Create the contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    subject varchar(255) NOT NULL,
    message text NOT NULL,
    category varchar(50) NOT NULL, -- e.g., 'collaboration', 'support', 'feedback', 'join', 'other'
    vibe varchar(50) NOT NULL, -- e.g., 'browsing', 'standard', 'urgent'
    status varchar(50) DEFAULT 'unread' NOT NULL, -- e.g., 'unread', 'read', 'resolved'
    admin_notes text DEFAULT '' NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any to prevent errors during migrations
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view all contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can delete contact submissions" ON public.contact_submissions;

-- 4. Create RLS Policies
-- Anyone (both registered users and anonymous guests) can submit a contact inquiry
CREATE POLICY "Anyone can insert contact submissions" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);

-- Only administrators can select/view the submissions
CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'department_admin', 'club_admin', 'tournament_admin')
        )
    );

-- Only administrators can update the submissions (e.g., mark as read/resolved, update admin notes)
CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'department_admin', 'club_admin', 'tournament_admin')
        )
    );

-- Only administrators can delete a submission
CREATE POLICY "Admins can delete contact submissions" ON public.contact_submissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'department_admin', 'club_admin', 'tournament_admin')
        )
    );
