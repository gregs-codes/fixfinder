-- Add is_typing column to chat_participants table
ALTER TABLE chat_participants 
ADD COLUMN IF NOT EXISTS is_typing BOOLEAN DEFAULT FALSE;
