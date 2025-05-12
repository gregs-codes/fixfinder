-- Enable RLS on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Clear existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Anyone can view provider profiles" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "Allow trigger to create users" ON public.users;

-- Allow users to read their own data
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- Allow authenticated users to view provider profiles
CREATE POLICY "Anyone can view provider profiles"
ON public.users
FOR SELECT
USING (is_provider = true);

-- Allow authenticated users to insert their own record
CREATE POLICY "Users can insert their own record"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow service role to do anything
CREATE POLICY "Service role can do anything"
ON public.users
USING (true)
WITH CHECK (true);

-- Make sure the handle_new_user function exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    is_provider, 
    is_admin,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'is_provider')::boolean, false),
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
