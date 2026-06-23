-- Seed script for Event Categories
-- Ensures previous categories are kept, and new ones like Sports are added.

INSERT INTO public.categories (name, type) VALUES
('Hackathon', 'technical'),
('Esports', 'esports'),
('Sports', 'sports'),
('Workshop', 'academic'),
('Seminar', 'academic'),
('Technical', 'technical'),
('Non-Technical', 'club'),
('Cultural', 'club'),
('Guest Lecture', 'academic')
ON CONFLICT (name) DO NOTHING;
