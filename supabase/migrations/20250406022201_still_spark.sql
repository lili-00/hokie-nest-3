/*
  # Update property access policies

  1. Changes
    - Allow public access to read properties
    - Keep existing policies for authenticated users
    - Remove authentication requirement for property viewing

  2. Security
    - Properties are publicly readable
    - Write operations still require authentication
*/

-- Drop the existing read policy
DROP POLICY IF EXISTS "Enable read access for all users" ON properties;

-- Create new public read policy
CREATE POLICY "Enable public read access for properties"
  ON properties
  FOR SELECT
  TO public
  USING (true);