-- 1. Add 'section' column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS section varchar(5);

-- 2. Update the Auth trigger to handle 'section' and 'department_id'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    email, 
    roll_number, 
    mobile, 
    role, 
    department_id, 
    section
  )
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Student'),
    new.email,
    new.raw_user_meta_data->>'roll_number',
    new.raw_user_meta_data->>'mobile',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role),
    nullif(new.raw_user_meta_data->>'department_id', '')::uuid,
    new.raw_user_meta_data->>'section'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
