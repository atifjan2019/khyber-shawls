-- SQL script to update existing users for new authentication system
-- Run this ONLY if you have existing users without passwords

-- Option 1: Update role field to uppercase for existing users
UPDATE users SET role = 'USER' WHERE role = 'user';
UPDATE users SET role = 'ADMIN' WHERE role = 'admin';

-- Option 2: If you have users with NULL or empty passwords, you need to either:
-- A) Delete them (recommended if they're test accounts):
-- DELETE FROM users WHERE password IS NULL OR password = '';

-- B) Or set a temporary password and notify them to reset:
-- UPDATE users 
-- SET password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyVq/VfHgDGm' 
-- WHERE password IS NULL OR password = '';
-- Note: The above hash is for password "ChangeMe123" - users would need to reset

-- Option 3: Check which users need attention:
SELECT id, email, name, role, 
  CASE 
    WHEN password IS NULL THEN 'NULL PASSWORD'
    WHEN password = '' THEN 'EMPTY PASSWORD'
    WHEN role NOT IN ('USER', 'ADMIN') THEN 'INVALID ROLE'
    ELSE 'OK'
  END as status
FROM users;
