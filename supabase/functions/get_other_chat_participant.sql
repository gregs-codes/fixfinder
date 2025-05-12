-- Function to get the other participant in a chat
CREATE OR REPLACE FUNCTION get_other_chat_participant(p_chat_id UUID, p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  is_provider BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id,
    u.full_name,
    u.avatar_url,
    u.is_provider
  FROM 
    chat_participants cp
  JOIN 
    users u ON cp.user_id = u.id
  WHERE 
    cp.chat_id = p_chat_id
    AND cp.user_id != p_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_other_chat_participant TO authenticated;
