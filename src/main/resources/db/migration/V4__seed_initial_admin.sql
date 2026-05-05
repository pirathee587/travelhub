-- Seed initial Super Admin
INSERT INTO users (name, email, password, role, is_email_verified, status, is_active, created_at)
VALUES (
    'System Admin', 
    'saras69wathy+superadmin@gmail.com', 
    '$2a$10$8.UnVuG9HHGffUDAIk8qfOuVv35yZChjzVpS6.9m6I/VnU27Bv8m', -- password: admin
    'ADMIN', 
    true, 
    'ACTIVE', 
    true, 
    NOW()
)
ON CONFLICT (email) DO NOTHING;
