-- Enable RLS on the users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read their own data
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Create a policy that allows users to update their own data
CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- Create a policy that allows the trigger function to insert new users
-- This is needed for the handle_new_user function to work
CREATE POLICY "Allow trigger to create users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create a policy that allows public access to certain user fields
-- This is needed for viewing provider profiles
CREATE POLICY "Public can view limited user data"
ON public.users
FOR SELECT
USING (true)
WITH CHECK (
  is_provider = true OR
  id = auth.uid()
);
