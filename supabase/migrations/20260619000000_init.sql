-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create roles type
create type user_role as enum ('super_admin', 'department_admin', 'club_admin', 'tournament_admin', 'student');

-- Create event status type
create type event_status as enum ('draft', 'pending_approval', 'published', 'completed');

-- Create registration type
create type registration_type as enum ('individual', 'team');

-- Create certificate type
create type certificate_type as enum ('participation', 'winner', 'runner_up', 'volunteer', 'organizer');

-- Create tournament types
create type tournament_type as enum ('knockout', 'round_robin', 'league', 'group_stage');

-- 1. Departments Table
create table departments (
    id uuid default gen_random_uuid() primary key,
    name varchar(255) not null unique,
    code varchar(50) not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Clubs Table
create table clubs (
    id uuid default gen_random_uuid() primary key,
    name varchar(255) not null unique,
    description text,
    department_id uuid references departments(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. User Profiles Table (Linked to Supabase Auth.users)
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    name varchar(255) not null,
    roll_number varchar(100) unique,
    email varchar(255) not null unique,
    mobile varchar(20),
    role user_role default 'student'::user_role not null,
    department_id uuid references departments(id) on delete set null,
    club_id uuid references clubs(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Event Categories Table
create table categories (
    id uuid default gen_random_uuid() primary key,
    name varchar(255) not null unique,
    type varchar(50) not null check (type in ('academic', 'technical', 'department', 'club', 'sports', 'esports')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Events Table
create table events (
    id uuid default gen_random_uuid() primary key,
    title varchar(255) not null,
    description text not null,
    banner_url text,
    category_id uuid references categories(id) on delete restrict not null,
    department_id uuid references departments(id) on delete set null,
    club_id uuid references clubs(id) on delete set null,
    venue varchar(255) not null,
    event_date date not null,
    event_time time not null,
    capacity integer not null,
    reg_type registration_type default 'individual'::registration_type not null,
    min_team_size integer default 1,
    max_team_size integer default 1,
    status event_status default 'draft'::event_status not null,
    created_by uuid references profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Teams Table
create table teams (
    id uuid default gen_random_uuid() primary key,
    name varchar(255) not null,
    event_id uuid references events(id) on delete cascade not null,
    captain_id uuid references profiles(id) on delete restrict not null,
    invite_code varchar(50) not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(name, event_id)
);

-- 7. Team Members Table
create table team_members (
    id uuid default gen_random_uuid() primary key,
    team_id uuid references teams(id) on delete cascade not null,
    user_id uuid references profiles(id) on delete cascade not null,
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (team_id, user_id)
);

-- 8. Registrations Table
create table registrations (
    id uuid default gen_random_uuid() primary key,
    event_id uuid references events(id) on delete cascade not null,
    user_id uuid references profiles(id) on delete cascade not null,
    team_id uuid references teams(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (event_id, user_id)
);

-- 9. Tickets Table
create table tickets (
    id uuid default gen_random_uuid() primary key,
    ticket_code varchar(100) not null unique,
    registration_id uuid references registrations(id) on delete cascade not null unique,
    qr_code_url text,
    pdf_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Attendance Table
create table attendance (
    id uuid default gen_random_uuid() primary key,
    ticket_id uuid references tickets(id) on delete cascade not null unique,
    event_id uuid references events(id) on delete cascade not null,
    student_id uuid references profiles(id) on delete cascade not null,
    checked_in_at timestamp with time zone default timezone('utc'::text, now()) not null,
    checked_in_by uuid references profiles(id) on delete set null,
    unique (event_id, student_id)
);

-- 11. Certificate Templates
create table certificate_templates (
    id uuid default gen_random_uuid() primary key,
    event_id uuid references events(id) on delete cascade not null,
    template_url text not null,
    title_coords_json jsonb,
    name_coords_json jsonb,
    date_coords_json jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Certificates Table
create table certificates (
    id uuid default gen_random_uuid() primary key,
    template_id uuid references certificate_templates(id) on delete cascade not null,
    user_id uuid references profiles(id) on delete cascade not null,
    event_id uuid references events(id) on delete cascade not null,
    cert_type certificate_type not null,
    pdf_url text not null,
    generated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(event_id, user_id, cert_type)
);

-- 13. Sports Tournaments
create table sports_tournaments (
    id uuid default gen_random_uuid() primary key,
    event_id uuid references events(id) on delete cascade not null,
    type tournament_type not null,
    game_name varchar(100) not null,
    status varchar(50) default 'scheduled' check (status in ('scheduled', 'ongoing', 'completed')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. Esports Tournaments
create table esports_tournaments (
    id uuid default gen_random_uuid() primary key,
    event_id uuid references events(id) on delete cascade not null,
    game_name varchar(100) not null,
    room_id varchar(100),
    room_password varchar(100),
    status varchar(50) default 'scheduled' check (status in ('scheduled', 'ongoing', 'completed')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. Matches Table (For both Sports and Esports)
create table matches (
    id uuid default gen_random_uuid() primary key,
    event_id uuid references events(id) on delete cascade not null,
    sports_tournament_id uuid references sports_tournaments(id) on delete cascade,
    esports_tournament_id uuid references esports_tournaments(id) on delete cascade,
    round integer default 1 not null,
    match_number integer not null,
    team1_id uuid references teams(id) on delete set null,
    team2_id uuid references teams(id) on delete set null,
    team1_score varchar(50),
    team2_score varchar(50),
    winner_id uuid references teams(id) on delete set null,
    scheduled_time timestamp with time zone,
    status varchar(50) default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    check (sports_tournament_id is not null or esports_tournament_id is not null)
);

-- 16. Standings / Points Table (For League / Round Robin)
create table standings (
    id uuid default gen_random_uuid() primary key,
    tournament_id uuid references sports_tournaments(id) on delete cascade not null,
    team_id uuid references teams(id) on delete cascade not null,
    played integer default 0 not null,
    won integer default 0 not null,
    lost integer default 0 not null,
    drawn integer default 0 not null,
    points integer default 0 not null,
    net_run_rate_or_score numeric(10,3) default 0.000 not null,
    unique(tournament_id, team_id)
);

-- 17. Notifications Table
create table notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) on delete cascade not null,
    title varchar(255) not null,
    message text not null,
    type varchar(50) default 'system' not null,
    read_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 18. Audit Logs Table
create table audit_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) on delete set null,
    action varchar(255) not null,
    target_table varchar(100) not null,
    target_id uuid,
    changes_json jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 19. App Settings Table
create table settings (
    id uuid default gen_random_uuid() primary key,
    key varchar(100) unique not null,
    value text not null,
    description text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table departments enable row level security;
alter table clubs enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table events enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table registrations enable row level security;
alter table tickets enable row level security;
alter table attendance enable row level security;
alter table certificate_templates enable row level security;
alter table certificates enable row level security;
alter table sports_tournaments enable row level security;
alter table esports_tournaments enable row level security;
alter table matches enable row level security;
alter table standings enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table settings enable row level security;

-- TRIGGER FUNCTION TO SYNC AUTH USERS TO PROFILES
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, roll_number, mobile, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Student'),
    new.email,
    new.raw_user_meta_data->>'roll_number',
    new.raw_user_meta_data->>'mobile',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- BASIC RLS POLICIES

-- Profiles
create policy "Allow public read access to profiles" on profiles for select using (true);
create policy "Allow users to update own profile" on profiles for update using (auth.uid() = id);

-- Departments & Clubs
create policy "Allow public read access to departments" on departments for select using (true);
create policy "Allow public read access to clubs" on clubs for select using (true);

-- Events
create policy "Allow public read access to published events" on events for select using (status = 'published');
create policy "Allow write access to events for creators/admins" on events for all using (
  auth.uid() in (select id from profiles where role in ('super_admin', 'department_admin', 'club_admin'))
);

-- Registrations & Tickets
create policy "Allow users to read own registrations" on registrations for select using (auth.uid() = user_id);
create policy "Allow users to register" on registrations for insert with check (auth.uid() = user_id);
create policy "Allow users to view own tickets" on tickets for select using (
  registration_id in (select id from registrations where user_id = auth.uid())
);

-- Indexes for performance
create index idx_events_status on events(status);
create index idx_events_date on events(event_date);
create index idx_registrations_event_user on registrations(event_id, user_id);
create index idx_tickets_code on tickets(ticket_code);
create index idx_attendance_event on attendance(event_id);
create index idx_matches_event on matches(event_id);
create index idx_team_members_team on team_members(team_id);
create index idx_team_members_user on team_members(user_id);
