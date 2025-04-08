/*
  # Create properties table

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `address` (text)
      - `price` (integer)
      - `bedrooms` (integer)
      - `bathrooms` (integer)
      - `square_feet` (integer)
      - `location` (text)
      - `landlord_id` (uuid, references auth.users)
      - `status` (text, enum: available, rented, maintenance)
      - `amenities` (text[])
      - `highlights` (text[])
      - `images` (text[])
      - `is_furnished` (boolean)
      - `transportation` (jsonb)
      - `landlord_name` (text)
      - `landlord_email` (text)
      - `landlord_phone` (text)
      - `reviews_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on properties table
    - Add policies for:
      - Landlords can insert their own properties
      - Landlords can update their own properties
      - All authenticated users can read available properties

  3. Triggers
    - Add trigger to automatically update updated_at timestamp
*/

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  price INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  square_feet INTEGER NOT NULL,
  location TEXT NOT NULL,
  landlord_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance')),
  amenities TEXT[] NOT NULL DEFAULT '{}',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  is_furnished BOOLEAN NOT NULL DEFAULT false,
  transportation JSONB NOT NULL DEFAULT '{}',
  landlord_name TEXT NOT NULL,
  landlord_email TEXT NOT NULL,
  landlord_phone TEXT NOT NULL DEFAULT '',
  reviews_count INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Landlords can insert their own properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update their own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Enable read access for all users"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create index for common queries
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_landlord_id ON properties(landlord_id);