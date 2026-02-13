-- Create MWU Library Database
CREATE DATABASE IF NOT EXISTS mwu_library 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE mwu_library;

-- Show success message
SELECT 'Database mwu_library created successfully!' AS message;
