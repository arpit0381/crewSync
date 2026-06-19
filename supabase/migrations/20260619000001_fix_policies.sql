-- Add missing policies for tickets and registrations

-- Allow users to insert tickets for their own registrations
create policy "Allow users to create tickets" on tickets for insert with check (
  registration_id in (select id from registrations where user_id = auth.uid())
);

-- Allow admins to read all registrations
create policy "Allow admins to read all registrations" on registrations for select using (
  auth.uid() in (select id from public.profiles where role in ('super_admin', 'department_admin', 'club_admin', 'tournament_admin'))
);

-- Allow admins to read all tickets
create policy "Allow admins to read all tickets" on tickets for select using (
  auth.uid() in (select id from public.profiles where role in ('super_admin', 'department_admin', 'club_admin', 'tournament_admin'))
);
