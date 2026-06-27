-- V12__add_sample_packages.sql

-- Insert 8 distinct sample packages based in Sri Lanka
-- Using hardcoded agent_id = 5 as requested by the user

INSERT INTO packages (
    package_id, agent_id, package_name, destination, start_place, end_place, duration, category, district, price_from, price_to, description, is_active, trending, application_status, created_at, updated_at
) VALUES
('PKG-SL01', 5, 'Sigiriya & Dambulla Heritage', 'Sigiriya', 'Colombo', 'Sigiriya', '3 Days 2 Nights', 'CULTURE', 'Matale', 300.0, 600.0, 'Explore the ancient rock fortress of Sigiriya and the stunning Dambulla Cave Temple.', true, true, 'Approved', NOW(), NOW()),
('PKG-SL02', 5, 'Mirissa Beach Retreat', 'Mirissa', 'Colombo Airport', 'Mirissa', '4 Days 3 Nights', 'BEACH', 'Matara', 400.0, 800.0, 'Relax on the golden sands of Mirissa, enjoy whale watching and vibrant beach life.', true, true, 'Approved', NOW(), NOW()),
('PKG-SL03', 5, 'Ella Train & Mountains', 'Ella', 'Kandy', 'Ella', '3 Days 2 Nights', 'MOUNTAIN', 'Badulla', 250.0, 500.0, 'Take the world-famous scenic train ride from Kandy to Ella and hike Little Adam''s Peak.', true, true, 'Approved', NOW(), NOW()),
('PKG-SL04', 5, 'Yala Wildlife Safari', 'Yala National Park', 'Hambantota', 'Yala', '2 Days 1 Night', 'WILDLIFE', 'Hambantota', 350.0, 700.0, 'Embark on an exciting jeep safari in Yala National Park to spot leopards and elephants.', true, true, 'Approved', NOW(), NOW()),
('PKG-SL05', 5, 'Colombo City Explorer', 'Colombo', 'Colombo Airport', 'Colombo', '2 Days 1 Night', 'CITY', 'Colombo', 150.0, 350.0, 'Discover the bustling capital city, historic colonial architecture, and vibrant street food.', true, false, 'Approved', NOW(), NOW()),
('PKG-SL06', 5, 'Kandy Cultural Experience', 'Kandy', 'Colombo', 'Kandy', '3 Days 2 Nights', 'CULTURE', 'Kandy', 280.0, 550.0, 'Visit the Temple of the Sacred Tooth Relic and experience traditional Kandyan dancing.', true, false, 'Approved', NOW(), NOW()),
('PKG-SL07', 5, 'Trincomalee Coastal Escape', 'Trincomalee', 'Colombo', 'Trincomalee', '5 Days 4 Nights', 'BEACH', 'Trincomalee', 450.0, 900.0, 'Enjoy the pristine white sand beaches of Nilaveli and snorkel at Pigeon Island.', true, false, 'Approved', NOW(), NOW()),
('PKG-SL08', 5, 'Nuwara Eliya Tea Trails', 'Nuwara Eliya', 'Kandy', 'Nuwara Eliya', '3 Days 2 Nights', 'MOUNTAIN', 'Nuwara Eliya', 320.0, 650.0, 'Experience the "Little England" of Sri Lanka, visit lush tea plantations and waterfalls.', true, true, 'Approved', NOW(), NOW())
ON CONFLICT (package_id) DO UPDATE SET 
    package_name = EXCLUDED.package_name,
    destination = EXCLUDED.destination,
    category = EXCLUDED.category,
    description = EXCLUDED.description;
