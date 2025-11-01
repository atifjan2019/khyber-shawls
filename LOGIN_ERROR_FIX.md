# Login Error Fix Guide

## Problem
After implementing the new secure authentication system, you may encounter login errors. This is because:

1. **Existing users don't have encrypted passwords** - The old system allowed login without proper password verification
2. **Role format mismatch** - Database has lowercase roles ("user", "admin") but the new system expects uppercase ("USER", "ADMIN")
3. **Redirect errors being caught** - Next.js redirects throw errors that were being caught incorrectly

## Fixes Applied

### 1. Enhanced Error Handling in `actions.ts`
- ✅ Better validation for users without passwords
- ✅ Normalized role handling (converts lowercase to uppercase)
- ✅ Proper redirect error handling (redirects now work correctly)
- ✅ Clearer error messages for users

### 2. Code Changes Made

**Login Function:**
- Added check for empty/null passwords with helpful message
- Normalize role to uppercase before creating session
- Re-throw redirect errors (they're expected behavior, not actual errors)

**Register Function:**
- Explicitly cast role to uppercase format
- Re-throw redirect errors for proper navigation

## What You Need to Do

### Option 1: For Fresh Start (Recommended if no important existing users)

Delete users without passwords and let them re-register:

```sql
-- Check which users have issues
SELECT id, email, name, role, 
  CASE 
    WHEN password IS NULL THEN 'NULL PASSWORD'
    WHEN password = '' THEN 'EMPTY PASSWORD'
    ELSE 'OK'
  END as status
FROM users;

-- Delete users without passwords
DELETE FROM users WHERE password IS NULL OR password = '';

-- Update role format
UPDATE users SET role = 'USER' WHERE role = 'user';
UPDATE users SET role = 'ADMIN' WHERE role = 'admin';
```

### Option 2: Keep Existing Users

Update database to normalize data:

```sql
-- Update role format
UPDATE users SET role = 'USER' WHERE role = 'user';
UPDATE users SET role = 'ADMIN' WHERE role = 'admin';

-- Set temporary password for users without one
-- Password will be: ChangeMe123
UPDATE users 
SET password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyVq/VfHgDGm' 
WHERE password IS NULL OR password = '';
```

Then notify those users to reset their password.

### Option 3: Through Coolify Console

1. Go to your Coolify dashboard
2. Navigate to your MySQL database
3. Open the database console/phpMyAdmin
4. Run one of the SQL scripts above

## Testing After Fix

1. **Try registering a new user:**
   - Email: `test@example.com`
   - Password: `Test123456` (must have uppercase, lowercase, and numbers)
   - Should redirect and login successfully

2. **Try logging in:**
   - If user has no password: Get message "Please register or reset your password to continue"
   - If password is wrong: Get message "Invalid email or password"
   - If correct: Should redirect to dashboard/admin

## Current Status

✅ **Code Fixed and Ready**
- All TypeScript errors resolved
- Redirect handling fixed
- Role normalization implemented
- Better error messages

⏳ **Database Needs Update**
- Run one of the SQL scripts above to fix existing user data
- This is a one-time operation

## Commit and Deploy

Once you've updated the database, commit these fixes:

```bash
cd /Users/atifjan/Desktop/Khybershawls
git add -A
git commit -m "fix: Improve auth error handling, normalize roles, fix redirects"
git push origin main
```

## Verification Checklist

After deployment:
- [ ] New user registration works
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows proper error
- [ ] Users without passwords get helpful message
- [ ] Admin users redirect to `/admin/products`
- [ ] Regular users redirect to intended page
- [ ] No "An error occurred during login" generic errors

## Additional Notes

**Why the changes:**
- The new security system requires all users to have properly hashed passwords
- Roles must be uppercase to match TypeScript type definitions
- Next.js uses special "digest" errors for redirects, which should not be caught as failures

**If you still see errors:**
1. Check browser console for detailed error messages
2. Check Coolify logs for server-side errors
3. Verify JWT_SECRET is set in environment variables
4. Ensure database connection is working
