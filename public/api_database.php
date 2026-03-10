<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
function getDBConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $host = '127.0.0.1';
            $dbname = 'mwu_library';
            $username = 'root';
            $password = '';
            
            $pdo = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database connection failed: ' . $e->getMessage()]);
            exit();
        }
    }
    
    return $pdo;
}

// OTP Functions
function generateOTP() {
    return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
}

function createOTP($email, $userId, $userName) {
    $pdo = getDBConnection();
    
    // Remove old OTPs for this email
    $stmt = $pdo->prepare("DELETE FROM otp_codes WHERE email = ?");
    $stmt->execute([$email]);
    
    $code = generateOTP();
    $createdAt = date('Y-m-d H:i:s');
    $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));
    
    $stmt = $pdo->prepare("
        INSERT INTO otp_codes (email, user_id, user_name, code, created_at, expires_at, verified)
        VALUES (?, ?, ?, ?, ?, ?, 0)
    ");
    $stmt->execute([$email, $userId, $userName, $code, $createdAt, $expiresAt]);
    
    return [
        'email' => $email,
        'user_id' => $userId,
        'user_name' => $userName,
        'code' => $code,
        'created_at' => $createdAt,
        'expires_at' => $expiresAt,
        'verified' => false
    ];
}

function verifyOTP($email, $code) {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT * FROM otp_codes 
        WHERE email = ? AND code = ? 
        ORDER BY created_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$email, $code]);
    $otp = $stmt->fetch();
    
    if (!$otp) {
        return ['success' => false, 'message' => 'Invalid OTP code'];
    }
    
    // Check if expired
    if (strtotime($otp['expires_at']) < time()) {
        return ['success' => false, 'message' => 'OTP has expired'];
    }
    
    // Mark as verified
    $stmt = $pdo->prepare("UPDATE otp_codes SET verified = 1 WHERE id = ?");
    $stmt->execute([$otp['id']]);
    
    return ['success' => true, 'message' => 'OTP verified successfully', 'otp' => $otp];
}

// Activity logging functions
function logSystemActivity($userId, $userEmail, $userName, $activity, $type = 'system', $details = '') {
    $pdo = getDBConnection();
    
    $activityId = 'SYS' . time() . rand(100, 999);
    $timestamp = date('Y-m-d H:i:s');
    $date = date('Y-m-d');
    $time = date('H:i:s');
    
    // Insert system activity
    $stmt = $pdo->prepare("
        INSERT INTO system_activities (id, user_id, user_email, user_name, activity, type, details, timestamp, date, time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$activityId, $userId, $userEmail, $userName, $activity, $type, $details, $timestamp, $date, $time]);
    
    // Create notification
    $notificationId = 'NOT' . time() . rand(100, 999);
    $priority = ($type === 'overdue') ? 'high' : 'normal';
    
    $stmt = $pdo->prepare("
        INSERT INTO notifications (id, activity_id, user_id, user_email, user_name, message, type, details, timestamp, is_read, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    ");
    $stmt->execute([$notificationId, $activityId, $userId, $userEmail, $userName, $activity, $type, $details, $timestamp, $priority]);
    
    return [
        'id' => $activityId,
        'user_id' => $userId,
        'user_email' => $userEmail,
        'user_name' => $userName,
        'activity' => $activity,
        'type' => $type,
        'details' => $details,
        'timestamp' => $timestamp,
        'date' => $date,
        'time' => $time
    ];
}

function logStudentActivity($userId, $userEmail, $userName, $activity, $type = 'general', $details = '') {
    $pdo = getDBConnection();
    
    $activityId = 'ACT' . time() . rand(100, 999);
    $timestamp = date('Y-m-d H:i:s');
    $date = date('Y-m-d');
    $time = date('H:i:s');
    
    // Insert activity
    $stmt = $pdo->prepare("
        INSERT INTO activities (id, user_id, user_email, user_name, activity, type, details, timestamp, date, time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$activityId, $userId, $userEmail, $userName, $activity, $type, $details, $timestamp, $date, $time]);
    
    // Create notification
    $notificationId = 'NOT' . time() . rand(100, 999);
    $priority = ($type === 'overdue') ? 'high' : 'normal';
    
    $stmt = $pdo->prepare("
        INSERT INTO notifications (id, activity_id, user_id, user_email, user_name, message, type, details, timestamp, is_read, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    ");
    $stmt->execute([$notificationId, $activityId, $userId, $userEmail, $userName, $activity, $type, $details, $timestamp, $priority]);
    
    return [
        'id' => $activityId,
        'user_id' => $userId,
        'user_email' => $userEmail,
        'user_name' => $userName,
        'activity' => $activity,
        'type' => $type,
        'details' => $details,
        'timestamp' => $timestamp,
        'date' => $date,
        'time' => $time
    ];
}

// Get category name by ID
function getCategoryName($categoryId) {
    $categories = [
        1 => 'Fiction',
        2 => 'Science', 
        3 => 'Technology',
        4 => 'History',
        5 => 'Biography',
        6 => 'Education',
        7 => 'Business',
        8 => 'Health'
    ];
    return $categories[$categoryId] ?? 'Unknown';
}

// Check if user is suspended
function isUserSuspended($userId) {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM penalties 
        WHERE user_id = ? AND status = 'unpaid'
    ");
    $stmt->execute([$userId]);
    $result = $stmt->fetch();
    
    return $result['count'] > 0;
}

// Calculate penalty amount
function calculatePenalty($overdueDays) {
    $penaltyPerDay = 50;
    $minimumPenalty = 200;
    
    $penalty = $overdueDays * $penaltyPerDay;
    return max($penalty, $minimumPenalty);
}

// Add penalty for overdue book
function addPenalty($userId, $userEmail, $userName, $borrowId, $bookTitle, $overdueDays) {
    $pdo = getDBConnection();
    
    $penaltyId = 'PEN' . time() . rand(100, 999);
    $penaltyAmount = calculatePenalty($overdueDays);
    $createdAt = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("
        INSERT INTO penalties (id, user_id, user_email, user_name, borrow_id, book_title, overdue_days, penalty_amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?)
    ");
    $stmt->execute([$penaltyId, $userId, $userEmail, $userName, $borrowId, $bookTitle, $overdueDays, $penaltyAmount, $createdAt]);
    
    // Log penalty activity
    logStudentActivity(
        $userId,
        $userEmail,
        $userName,
        "Penalty imposed: " . $penaltyAmount . " ETB for overdue book '{$bookTitle}' ({$overdueDays} days overdue)",
        'penalty',
        "Penalty ID: {$penaltyId}, Amount: " . $penaltyAmount . " ETB"
    );
    
    return [
        'id' => $penaltyId,
        'user_id' => $userId,
        'user_email' => $userEmail,
        'user_name' => $userName,
        'borrow_id' => $borrowId,
        'book_title' => $bookTitle,
        'overdue_days' => $overdueDays,
        'penalty_amount' => $penaltyAmount,
        'status' => 'unpaid',
        'created_at' => $createdAt
    ];
}

// Simple routing
$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Remove query string and clean path
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api_database.php', '', $path);
$path = str_replace('/api.php', '', $path);

// Get request body
$input = json_decode(file_get_contents('php://input'), true);

// Routes
switch ($path) {
    case '/register':
        if ($method === 'POST') {
            $name = $input['name'] ?? '';
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            $studentId = $input['student_id'] ?? '';
            $phone = $input['phone'] ?? '';
            $role = $input['role'] ?? 'student';
            
            // Validate required fields
            if (empty($name) || empty($email) || empty($password)) {
                http_response_code(400);
                echo json_encode(['message' => 'Name, email, and password are required']);
                break;
            }
            
            // Validate password length
            if (strlen($password) < 6) {
                http_response_code(400);
                echo json_encode(['message' => 'Password must be at least 6 characters long']);
                break;
            }
            
            // Validate student ID for students
            if ($role === 'student' && empty($studentId)) {
                http_response_code(400);
                echo json_encode(['message' => 'Student ID is required for student accounts']);
                break;
            }
            
            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['message' => 'Invalid email format']);
                break;
            }
            
            // Validate email domain
            if ($role === 'student' && !preg_match('/@student\.mwu\.edu\.et$/', $email)) {
                http_response_code(400);
                echo json_encode(['message' => 'Student email must end with @student.mwu.edu.et']);
                break;
            } elseif ($role !== 'student' && !preg_match('/@mwu\.edu\.et$/', $email)) {
                http_response_code(400);
                echo json_encode(['message' => 'Staff email must end with @mwu.edu.et']);
                break;
            }
            
            $pdo = getDBConnection();
            
            // Check if user already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['message' => 'User with this email already exists']);
                break;
            }
            
            // Hash password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $registeredAt = date('Y-m-d H:i:s');
            
            // Insert new user with pending status
            $stmt = $pdo->prepare("
                INSERT INTO users (email, password, name, role, student_id, phone, status, registered_at)
                VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
            ");
            $stmt->execute([$email, $hashedPassword, $name, $role, $studentId, $phone, $registeredAt]);
            $newId = $pdo->lastInsertId();
            
            // Log registration activity
            $activityMessage = $role === 'student' 
                ? "New student registered: {$name} (ID: {$studentId})"
                : "New {$role} registered: {$name}";
                
            logStudentActivity(
                $newId,
                $email,
                $name,
                $activityMessage,
                'register',
                "Phone: {$phone}, Email: {$email}, Role: {$role}"
            );
            
            // Create admin notification
            logSystemActivity(
                $newId,
                $email,
                $name,
                "🔔 NEW REGISTRATION: {$name} needs approval",
                'new_registration',
                "Student ID: {$studentId}, Phone: {$phone}, Email: {$email} - PENDING APPROVAL"
            );
            
            echo json_encode([
                'message' => 'Registration successful! Your account is pending admin approval. You will be notified once approved.',
                'user' => [
                    'id' => $newId,
                    'name' => $name,
                    'email' => $email,
                    'role' => $role,
                    'student_id' => $studentId,
                    'status' => 'pending'
                ]
            ]);
        }
        break;

        
    case '/login':
        if ($method === 'POST') {
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            $role = $input['role'] ?? '';
            
            $pdo = getDBConnection();
            
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                http_response_code(401);
                echo json_encode(['message' => 'User not found. Please register first if you are a new student.']);
                break;
            }
            
            // Check if account is pending approval
            if ($user['status'] === 'pending') {
                http_response_code(403);
                echo json_encode(['message' => 'Your account is pending admin approval. Please wait for approval before logging in.']);
                break;
            }
            
            // Check if account is rejected
            if ($user['status'] === 'rejected') {
                http_response_code(403);
                echo json_encode(['message' => 'Your account registration was rejected. Please contact the administrator.']);
                break;
            }
            
            // Verify password
            if (!password_verify($password, $user['password']) || $user['role'] !== $role) {
                http_response_code(401);
                echo json_encode(['message' => 'Invalid credentials or role mismatch']);
                break;
            }
            
            // Log login activity for students
            if ($role === 'student') {
                logStudentActivity(
                    $user['id'],
                    $email,
                    $user['name'],
                    "Student logged in: {$user['name']}",
                    'login',
                    "Login time: " . date('Y-m-d H:i:s')
                );
            }
            
            echo json_encode([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $email,
                    'role' => $user['role'],
                    'student_id' => $user['student_id']
                ],
                'token' => 'mwu-token-' . time() . '-' . $user['id']
            ]);
        }
        break;
        
    case '/verify-otp':
        if ($method === 'POST') {
            $email = $input['email'] ?? '';
            $code = $input['code'] ?? '';
            
            if (empty($email) || empty($code)) {
                http_response_code(400);
                echo json_encode(['message' => 'Email and OTP code are required']);
                break;
            }
            
            $result = verifyOTP($email, $code);
            
            if ($result['success']) {
                $pdo = getDBConnection();
                $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
                $stmt->execute([$email]);
                $user = $stmt->fetch();
                
                if ($user['role'] === 'student') {
                    logStudentActivity(
                        $user['id'],
                        $email,
                        $user['name'],
                        "Student logged in successfully: {$user['name']}",
                        'login',
                        "Login time: " . date('Y-m-d H:i:s')
                    );
                }
                
                echo json_encode([
                    'message' => 'Login successful',
                    'user' => [
                        'id' => $user['id'],
                        'name' => $user['name'],
                        'email' => $email,
                        'role' => $user['role'],
                        'student_id' => $user['student_id']
                    ],
                    'token' => 'mwu-token-' . time() . '-' . $user['id']
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['message' => $result['message']]);
            }
        }
        break;
        
    case '/borrow':
    case '/borrows':
        if ($method === 'POST') {
            $userId = $input['user_id'] ?? '';
            $bookId = $input['book_id'] ?? '';
            $userEmail = $input['user_email'] ?? '';
            $bookTitle = $input['book_title'] ?? '';
            $userName = $input['user_name'] ?? '';
            
            if (empty($userId) || empty($bookId)) {
                http_response_code(400);
                echo json_encode(['message' => 'User ID and Book ID are required']);
                break;
            }
            
            // Check if user is suspended
            if (isUserSuspended($userId)) {
                http_response_code(403);
                echo json_encode([
                    'message' => 'Account suspended due to unpaid penalties. Please pay outstanding fines to reactivate your account.',
                    'suspended' => true
                ]);
                break;
            }
            
            $pdo = getDBConnection();
            
            // Get book details if not provided
            if (empty($bookTitle)) {
                $stmt = $pdo->prepare("SELECT title FROM books WHERE id = ?");
                $stmt->execute([$bookId]);
                $book = $stmt->fetch();
                $bookTitle = $book['title'] ?? 'Unknown Book';
            }
            
            // Get user details if not provided
            if (empty($userEmail) || empty($userName)) {
                $stmt = $pdo->prepare("SELECT email, name FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $user = $stmt->fetch();
                $userEmail = $user['email'] ?? '';
                $userName = $user['name'] ?? '';
            }
            
            $borrowId = 'BRW' . time() . rand(100, 999);
            $borrowDate = date('Y-m-d H:i:s');
            $dueDate = date('Y-m-d H:i:s', strtotime('+14 days'));
            
            // Create borrow request with PENDING status
            $stmt = $pdo->prepare("
                INSERT INTO borrows (id, user_id, book_id, user_email, user_name, book_title, borrowed_at, due_date, status, is_overdue, requested_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?)
            ");
            $stmt->execute([$borrowId, $userId, $bookId, $userEmail, $userName, $bookTitle, $borrowDate, $dueDate, $borrowDate]);
            
            // Create notification for librarian
            logSystemActivity(
                $userId,
                $userEmail,
                $userName,
                "🔔 BORROW REQUEST: {$userName} wants to borrow '{$bookTitle}'",
                'borrow_request',
                "Student: {$userName} (ID: {$userId}), Book: {$bookTitle} - PENDING LIBRARIAN APPROVAL"
            );
            
            // Log student activity
            logStudentActivity(
                $userId,
                $userEmail,
                $userName,
                "Requested to borrow: {$bookTitle}",
                'borrow_request',
                "Book ID: {$bookId}, Request ID: {$borrowId}, Status: Pending Approval"
            );
            
            echo json_encode([
                'message' => 'Borrow request submitted! Waiting for librarian approval.',
                'borrow' => [
                    'id' => $borrowId,
                    'user_id' => $userId,
                    'book_id' => $bookId,
                    'user_email' => $userEmail,
                    'user_name' => $userName,
                    'book_title' => $bookTitle,
                    'borrowed_at' => $borrowDate,
                    'due_date' => $dueDate,
                    'status' => 'pending',
                    'is_overdue' => false,
                    'requested_at' => $borrowDate
                ]
            ]);
        } else if ($method === 'GET') {
            $pdo = getDBConnection();
            
            $stmt = $pdo->query("SELECT * FROM borrows ORDER BY borrowed_at DESC");
            $borrows = $stmt->fetchAll();
            
            // Update overdue status
            $currentTime = time();
            foreach ($borrows as &$borrow) {
                if ($borrow['status'] === 'borrowed') {
                    $dueDate = strtotime($borrow['due_date']);
                    $isOverdue = $currentTime > $dueDate;
                    $borrow['is_overdue'] = $isOverdue;
                    
                    if ($isOverdue) {
                        $borrow['status'] = 'overdue';
                        $stmt = $pdo->prepare("UPDATE borrows SET status = 'overdue', is_overdue = 1 WHERE id = ?");
                        $stmt->execute([$borrow['id']]);
                    }
                }
            }
            
            echo json_encode($borrows);
        }
        break;
        
    case '/borrows/approve':
        if ($method === 'POST') {
            $borrowId = $input['borrow_id'] ?? '';
            $action = $input['action'] ?? '';
            $librarianEmail = $input['librarian_email'] ?? '';
            $librarianName = $input['librarian_name'] ?? 'Librarian';
            
            if (empty($borrowId) || empty($action)) {
                http_response_code(400);
                echo json_encode(['message' => 'Borrow ID and action are required']);
                break;
            }
            
            $pdo = getDBConnection();
            
            $stmt = $pdo->prepare("SELECT * FROM borrows WHERE id = ?");
            $stmt->execute([$borrowId]);
            $borrow = $stmt->fetch();
            
            if (!$borrow) {
                http_response_code(404);
                echo json_encode(['message' => 'Borrow request not found']);
                break;
            }
            
            if ($action === 'approve') {
                $approvedAt = date('Y-m-d H:i:s');
                
                $stmt = $pdo->prepare("
                    UPDATE borrows 
                    SET status = 'borrowed', approved_by = ?, approved_at = ?
                    WHERE id = ?
                ");
                $stmt->execute([$librarianEmail, $approvedAt, $borrowId]);
                
                // Update book availability
                $stmt = $pdo->prepare("
                    UPDATE books 
                    SET available_quantity = available_quantity - 1 
                    WHERE id = ? AND available_quantity > 0
                ");
                $stmt->execute([$borrow['book_id']]);
                
                // Log activity
                logStudentActivity(
                    $borrow['user_id'],
                    $borrow['user_email'],
                    $borrow['user_name'],
                    "Borrow request APPROVED by {$librarianName}: {$borrow['book_title']}",
                    'borrow_approved',
                    "Book ID: {$borrow['book_id']}, Due: {$borrow['due_date']}"
                );
                
                $borrow['status'] = 'borrowed';
                $borrow['approved_by'] = $librarianEmail;
                $borrow['approved_at'] = $approvedAt;
                
                echo json_encode([
                    'message' => 'Borrow request approved successfully',
                    'borrow' => $borrow
                ]);
            } elseif ($action === 'reject') {
                $approvedAt = date('Y-m-d H:i:s');
                
                $stmt = $pdo->prepare("
                    UPDATE borrows 
                    SET status = 'rejected', approved_by = ?, approved_at = ?
                    WHERE id = ?
                ");
                $stmt->execute([$librarianEmail, $approvedAt, $borrowId]);
                
                // Log activity
                logStudentActivity(
                    $borrow['user_id'],
                    $borrow['user_email'],
                    $borrow['user_name'],
                    "Borrow request REJECTED by {$librarianName}: {$borrow['book_title']}",
                    'borrow_rejected',
                    "Book ID: {$borrow['book_id']}, Reason: Librarian decision"
                );
                
                $borrow['status'] = 'rejected';
                $borrow['approved_by'] = $librarianEmail;
                $borrow['approved_at'] = $approvedAt;
                
                echo json_encode([
                    'message' => 'Borrow request rejected',
                    'borrow' => $borrow
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['message' => 'Invalid action. Use approve or reject']);
            }
        }
        break;

        
    case '/renew':
        if ($method === 'POST') {
            $borrowId = $input['borrow_id'] ?? '';
            $userId = $input['user_id'] ?? '';
            
            if (empty($borrowId)) {
                http_response_code(400);
                echo json_encode(['message' => 'Borrow ID is required']);
                break;
            }
            
            // Check if user is suspended
            if (isUserSuspended($userId)) {
                http_response_code(403);
                echo json_encode([
                    'message' => 'Cannot renew books while account is suspended due to unpaid penalties.',
                    'suspended' => true
                ]);
                break;
            }
            
            $pdo = getDBConnection();
            
            $stmt = $pdo->prepare("SELECT * FROM borrows WHERE id = ? AND status = 'borrowed'");
            $stmt->execute([$borrowId]);
            $borrow = $stmt->fetch();
            
            if (!$borrow) {
         