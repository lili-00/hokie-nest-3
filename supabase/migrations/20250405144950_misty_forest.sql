/*
  # Insert mock data for properties and landlords

  1. Mock Data
    - Create landlord users with profiles
    - Insert properties with realistic:
      - Addresses near Virginia Tech Alexandria campus
      - Market-appropriate pricing
      - Common amenities
      - Transportation options
      - Property features
*/

-- Insert mock landlords
DO $$
DECLARE
  landlord1_id UUID := gen_random_uuid();
  landlord2_id UUID := gen_random_uuid();
  landlord3_id UUID := gen_random_uuid();
BEGIN
  -- Create landlord users
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
  VALUES 
    (landlord1_id, 'sarah.johnson@gmail.com', crypt('password123', gen_salt('bf')), now()),
    (landlord2_id, 'michael.smith@yahoo.com', crypt('password123', gen_salt('bf')), now()),
    (landlord3_id, 'david.wilson@hotmail.com', crypt('password123', gen_salt('bf')), now());

  -- Insert landlord profiles
  INSERT INTO profiles (id, role, full_name, phone)
  VALUES
    (landlord1_id, 'landlord', 'Sarah Johnson', '(703) 555-0101'),
    (landlord2_id, 'landlord', 'Michael Smith', '(703) 555-0102'),
    (landlord3_id, 'landlord', 'David Wilson', '(703) 555-0103');

  -- Insert properties
  INSERT INTO properties (
    title, description, address, price, bedrooms, bathrooms, square_feet,
    location, landlord_id, landlord_name, landlord_email, landlord_phone,
    amenities, highlights, images, is_furnished, transportation
  ) VALUES
    (
      'Modern 2BR Near VT Campus',
      'Beautifully renovated apartment perfect for students. Walking distance to Virginia Tech''s Alexandria campus. Features modern appliances and plenty of natural light.',
      '3001 Potomac Ave, Alexandria, VA 22301',
      2200,
      2,
      2,
      950,
      'Potomac Yard',
      landlord1_id,
      'Sarah Johnson',
      'sarah.johnson@gmail.com',
      '(703) 555-0101',
      ARRAY['In-unit Washer/Dryer', 'Central AC/Heat', 'Dishwasher', 'High-Speed Internet Ready', 'Stainless Steel Appliances'],
      ARRAY['5 minute walk to campus', 'Recently renovated', 'Energy efficient', 'Pet friendly'],
      ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80'],
      true,
      '{"metro": "7 min walk to Potomac Yard Metro", "bus": "VT Shuttle Stop nearby", "bike": "Capital Bikeshare station on-site"}'::jsonb
    ),
    (
      'Luxury Studio in Potomac Yard',
      'Compact but luxurious studio apartment ideal for grad students. Premium finishes and smart home features throughout.',
      '2999 Potomac Ave, Alexandria, VA 22301',
      1800,
      0,
      1,
      500,
      'Potomac Yard',
      landlord2_id,
      'Michael Smith',
      'michael.smith@yahoo.com',
      '(703) 555-0102',
      ARRAY['Smart Home Features', 'Built-in Desk', 'Walk-in Closet', 'Fitness Center Access', 'Package Lockers'],
      ARRAY['Floor-to-ceiling windows', 'Quartz countertops', 'Building security', 'Study rooms'],
      ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80'],
      true,
      '{"metro": "5 min walk to Potomac Yard Metro", "bus": "VT Shuttle available", "bike": "Bike storage available"}'::jsonb
    ),
    (
      'Spacious 3BR Townhouse',
      'Perfect for roommates! Three-story townhouse with garage parking and private backyard. Ideal for students looking to share.',
      '2950 Richmond Hwy, Alexandria, VA 22301',
      3500,
      3,
      2.5,
      1800,
      'Potomac Yard',
      landlord3_id,
      'David Wilson',
      'david.wilson@hotmail.com',
      '(703) 555-0103',
      ARRAY['Garage Parking', 'Private Backyard', 'In-unit Washer/Dryer', 'Basement', 'Smart Thermostat'],
      ARRAY['Great for sharing', 'Recently updated kitchen', 'Plenty of storage', 'Quiet neighborhood'],
      ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80'],
      false,
      '{"metro": "12 min walk to Potomac Yard Metro", "bus": "Bus stop 2 blocks away", "parking": "2-car garage included"}'::jsonb
    ),
    (
      'Cozy 1BR with Study Nook',
      'Charming one-bedroom apartment with dedicated study area. Perfect for focused academic work with great amenities.',
      '3025 Potomac Ave, Alexandria, VA 22301',
      1950,
      1,
      1,
      700,
      'Potomac Yard',
      landlord1_id,
      'Sarah Johnson',
      'sarah.johnson@gmail.com',
      '(703) 555-0101',
      ARRAY['Built-in Desk', 'High-Speed Internet', 'In-unit Washer/Dryer', 'Soundproof Windows', 'Bike Storage'],
      ARRAY['Dedicated study space', 'Great natural light', 'Community rooftop', 'Fast internet included'],
      ARRAY['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80'],
      true,
      '{"metro": "6 min walk to Potomac Yard Metro", "bus": "VT Shuttle Stop nearby", "bike": "Bike friendly building"}'::jsonb
    );
END $$;