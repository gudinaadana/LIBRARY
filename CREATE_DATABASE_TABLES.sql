-- MWU Library Management System - Database Tables
-- Run this SQL script in phpMyAdmin or MySQL command line

USE mwu_library;

-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS otp_codes;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS system_activities;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS penalties;
DROP TABLE IF EXISTS borrows;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('student', 'librarian', 'admin') NOT NULL,
    student_id VARCHAR(50),
    phone VARCHAR(20),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
    approved_by VARCHAR(255),
    approved_at DATETIME,
    password_reset_at DATETIME,
    password_reset_by VARCHAR(255),
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Books Table
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) NOT NULL,
    category_id INT NOT NULL,
    category_name VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1,
    available_quantity INT NOT NULL DEFAULT 1,
    description TEXT,
    publication_year INT,
    publisher VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title(255)),
    INDEX idx_author (author),
    INDEX idx_isbn (isbn),
    INDEX idx_category (category_id),
    INDEX idx_available (available_quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Borrows Table
CREATE TABLE borrows (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    book_title VARCHAR(500) NOT NULL,
    borrowed_at DATETIME NOT NULL,
    due_date DATETIME NOT NULL,
    returned_at DATETIME,
    status ENUM('pending', 'approved', 'rejected', 'borrowed', 'overdue', 'return_pending', 'returned', 'returned_with_penalty') NOT NULL DEFAULT 'pending',
    is_overdue BOOLEAN DEFAULT FALSE,
    overdue_days INT DEFAULT 0,
    requested_at DATETIME,
    approved_by VARCHAR(255),
    approved_at DATETIME,
    return_requested_at DATETIME,
    return_approved_by VARCHAR(255),
    return_approved_at DATETIME,
    return_rejected_by VARCHAR(255),
    return_rejected_at DATETIME,
    penalty_id VARCHAR(50),
    penalty_amount DECIMAL(10,2),
    renewed BOOLEAN DEFAULT FALSE,
    renewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_book (book_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Penalties Table
CREATE TABLE penalties (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    borrow_id VARCHAR(50) NOT NULL,
    book_title VARCHAR(500) NOT NULL,
    overdue_days INT NOT NULL,
    penalty_amount DECIMAL(10,2) NOT NULL,
    status ENUM('unpaid', 'paid', 'waived', 'payment_pending') NOT NULL DEFAULT 'unpaid',
    payment_method VARCHAR(50),
    payment_notes TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    payment_requested_at DATETIME,
    payment_approved_by VARCHAR(255),
    payment_approved_at DATETIME,
    payment_rejected_by VARCHAR(255),
    payment_rejected_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_borrow (borrow_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Activities Table (Student Activities)
CREATE TABLE activities (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    activity TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp DATETIME NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_date (date),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. System Activities Table
CREATE TABLE system_activities (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    activity TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp DATETIME NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_date (date),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Notifications Table (Librarian Notifications)
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    activity_id VARCHAR(50),
    user_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp DATETIME NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority ENUM('normal', 'high') DEFAULT 'normal',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. OTP Codes Table
CREATE TABLE otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_code (code),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Users
INSERT INTO users (id, email, password, name, role, student_id, phone, status, registered_at) VALUES
(1, 'sisay.tadesse@mwu.edu.et', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Sisay Tadesse', 'admin', NULL, NULL, 'approved', NOW()),
(2, 'mulugeta.bekele@mwu.edu.et', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ato Mulugeta Bekele', 'librarian', NULL, NULL, 'approved', NOW()),
(3, 'hanan.mohammed@student.mwu.edu.et', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hanan Mohammed', 'student', 'STU001', '+251911234567', 'approved', NOW());

-- Note: Default password for all users is 'password123'
-- Password hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Insert Sample Books
INSERT INTO books (id, title, author, isbn, category_id, category_name, quantity, available_quantity, description, publication_year, publisher) VALUES
(1, 'The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 1, 'Fiction', 5, 5, 'A classic American novel', 1925, 'Scribner'),
(2, 'Clean Code', 'Robert C. Martin', '978-0-13-235088-4', 3, 'Technology', 3, 3, 'A Handbook of Agile Software Craftsmanship', 2008, 'Prentice Hall'),
(3, 'Introduction to Algorithms', 'Thomas H. Cormen', '978-0-262-03384-8', 3, 'Technology', 4, 4, 'Comprehensive algorithms textbook', 2009, 'MIT Press'),
(4, 'A Brief History of Time', 'Stephen Hawking', '978-0-553-38016-3', 2, 'Science', 2, 2, 'From the Big Bang to Black Holes', 1988, 'Bantam Books'),
(5, 'Sapiens', 'Yuval Noah Harari', '978-0-06-231609-7', 4, 'History', 3, 3, 'A Brief History of Humankind', 2011, 'Harper');

-- Success Message
SELECT 'Database tables created successfully!' AS Status;
SELECT 'Default users inserted (password: password123)' AS Info;
SELECT 'Sample books inserted' AS Info;
