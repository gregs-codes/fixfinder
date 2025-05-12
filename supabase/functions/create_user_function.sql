-- Create a function to create a new user that bypasses RLS
CREATE OR REPLACE FUNCTION create_new_user(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT,
  user_is_provider BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the creator
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insert the new user
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
    user_id,
    user_email,
    user_full_name,
    user_is_provider,
    false,
    NOW(),
    NOW()
  )
  RETURNING to_jsonb(users.*) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN unique_violation THEN
    -- If there's a unique violation, the user already exists
    SELECT to_jsonb(users.*) INTO result
    FROM public.users
    WHERE id = user_id;
    
    RETURN result;
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_new_user TO authenticated;
