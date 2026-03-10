# Database Migration Guide
## MWU Library System - JSON to MySQL Migration

This guide explains how to migrate your MWU Library System from JSON file storage to MySQL database without changing any functionality.

## Current Status
- **Database Name**: `mwu_library` (already configured in `.env`)
- **Current Storage**: JSON files in `public/` folder
- **Migration Goal**: Use MySQL database while keeping all features working

## Database Tables Structure

### 1. users
- Stores all user accounts (students, librarians, admins)
- Replaces: `registered_users.json`

### 2. books
- Stores all book information
- Replaces: `books_storage.json`

### 3. borrows
- Stores all borrow records
- Replaces: `borrowed_books.json`

### 4. penalties
- Stores penalty records
- Replaces: `student_penalties.json`

### 5. activities
- Stores student activities
- Replaces: `student_activities.json`

### 6. system_activities
- Stores system/librarian activities
- Replaces: `system_activities.json`

### 7. notifications
- Stores librarian notifications
- Replaces: `librarian_notifications.json`

### 8. otp_codes
- Stores OTP verification codes
- Replaces: `otp_codes.json`

## Migration Steps

### Step 1: Create Database Tables
Run `CREATE_DATABASE_TABLES.sql` in phpMyAdmin or MySQL command line

### Step 2: Migrate Existing Data (Optional)
Run `MIGRATE_JSON_TO_DATABASE.php` to transfer existing JSON data to database

### Step 3: Update API to Use Database
Replace `public/api.php` with `public/api_database.php`

### Step 4: Test the System
- Login with existing credentials
- Test all features (borrow, return, penalties, etc.)
- Verify data is being saved to database

## Important Notes

1. **Backup First**: Keep your JSON files as backup
2. **Password Security**: Database version uses proper password hashing (bcrypt)
3. **No Functionality Changes**: All features work exactly the same
4. **Better Performance**: Database queries are faster than JSON file operations
5. **Data Integrity**: Database ensures data consistency with foreign keys

## Default Users (After Migration)

These users are automatically created in the database:

- **Admin**: sisay.tadesse@mwu.edu.et / password123
- **Librarian**: mulugeta.bekele@mwu.edu.et / password123  
- **Student**: hanan.mohammed@student.mwu.edu.et / password123

## Rollback Plan

If you need to go back to JSON files:
1. Rename `public/api_database.php` to something else
2. Restore original `public/api.php`
3. Your JSON files remain untouched

## Support

If you encounter any issues during migration, check:
1. XAMPP MySQL is running
2. Database `mwu_library` exists
3. `.env` file has correct database credentials
4. PHP PDO extension is enabled
