-- Check if categories table exists, if not create it
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read categories
CREATE POLICY IF NOT EXISTS "Anyone can view categories" 
ON categories FOR SELECT 
USING (true);

-- Check if categories table is empty, if so seed it with data
INSERT INTO categories (name, icon, description)
SELECT * FROM (
  VALUES 
    ('Plumbing', '🚿', 'Plumbing installation, repair, and maintenance services'),
    ('Electrical', '⚡', 'Electrical installation, repair, and maintenance services'),
    ('Carpentry', '🔨', 'Carpentry and woodworking services'),
    ('Painting', '🎨', 'Interior and exterior painting services'),
    ('Cleaning', '🧹', 'Residential and commercial cleaning services'),
    ('Landscaping', '🌱', 'Lawn care, gardening, and landscaping services'),
    ('HVAC', '❄️', 'Heating, ventilation, and air conditioning services'),
    ('Roofing', '🏠', 'Roof installation, repair, and maintenance services'),
    ('Flooring', '🧱', 'Flooring installation and repair services'),
    ('Moving', '📦', 'Residential and commercial moving services')
) AS new_values (name, icon, description)
WHERE NOT EXISTS (
  SELECT 1 FROM categories LIMIT 1
);
