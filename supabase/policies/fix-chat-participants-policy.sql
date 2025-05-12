-- First, let's drop the problematic policy that's causing the infinite recursion
DROP POLICY IF EXISTS "Users can view their own chat participants" ON chat_participants;

-- Now let's create a new policy that avoids the recursion
CREATE POLICY "Users can view their own chat participants" 
ON chat_participants
FOR SELECT 
USING (
  -- Simple direct check without recursion
  auth.uid() = user_id
);

-- Policy for inserting chat participants
DROP POLICY IF EXISTS "Users can insert their own chat participants" ON chat_participants;
CREATE POLICY "Users can insert their own chat participants" 
ON chat_participants
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
);

-- Policy for updating chat participants
DROP POLICY IF EXISTS "Users can update their own chat participants" ON chat_participants;
CREATE POLICY "Users can update their own chat participants" 
ON chat_participants
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);
