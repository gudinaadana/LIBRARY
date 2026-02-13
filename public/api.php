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

// Simple file-based storage
$usersFile = 'registered_users.json';
$borrowsFile = 'borrowed_books.json';
$activitiesFile = 'student_activities.json';
$systemActivitiesFile = 'system_activities.json';
$notificationsFile = 'librarian_notifications.json';
$penaltiesFile = 'student_penalties.json';
$booksFile = 'books_storage.json';
$otpFile = 'otp_codes.json';

// OTP Functions
function loadOTPs() {
    global $otpFile;
    if (file_exists($otpFile)) {
        return json_decode(file_get_contents($otpFile), true) ?: [];
    }
    return [];
}

function saveOTPs($otps) {
    global $otpFile;
    file_put_contents($otpFile, json_encode($otps, JSON_PRETTY_PRINT));
}

function generateOTP() {
    return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
}

function createOTP($email, $userId, $userName) {
    $otps = loadOTPs();
    
    // Remove old OTPs for this email
    $otps = array_filter($otps, function($otp) use ($email) {
        return $otp['email'] !== $email;
    });
    
    $code = generateOTP();
    $expiresAt = date('Y-m-d H:i:s', strtotime('+5 minutes'));
    
    $newOTP = [
        'email' => $email,
        'user_id' => $userId,
        'user_name' => $userName,
        'code' => $code,
        'created_at' => date('Y-m-d H:i:s'),
        'expires_at' => $expiresAt,
        'verified' => false
    ];
    
    $otps[] = $newOTP;
    saveOTPs(array_values($otps));
    
    return $newOTP;
}

function verifyOTP($email, $code) {
    $otps = loadOTPs();
    
    foreach ($otps as $key => $otp) {
        if ($otp['email'] === $email && $otp['code'] === $code) {
            // Check if expired
            if (strtotime($otp['expires_at']) < time()) {
                return ['success' => false, 'message' => 'OTP has expired'];
            }
            
            // Mark as verified
            $otps[$key]['verified'] = true;
            saveOTPs($otps);
            
            return ['success' => true, 'message' => 'OTP verified successfully', 'otp' => $otp];
        }
    }
    
    return ['success' => false, 'message' => 'Invalid OTP code'];
}

// Load system activities
function loadSystemActivities() {
    global $systemActivitiesFile;
    if (file_exists($systemActivitiesFile)) {
        return json_decode(file_get_contents($systemActivitiesFile), true) ?: [];
    }
    return [];
}

// Save system activities
function saveSystemActivities($activities) {
    global $systemActivitiesFile;
    file_put_contents($systemActivitiesFile, json_encode($activities, JSON_PRETTY_PRINT));
}

// Add system activity log (for book management, system operations)
function logSystemActivity($userId, $userEmail, $userName, $activity, $type = 'system', $details = '') {
    $activities = loadSystemActivities();
    $notifications = loadLibrarianNotifications();
    
    $activityId = 'SYS' . time() . rand(100, 999);
    $timestamp = date('Y-m-d H:i:s');
    
    // Create system activity record
    $activityRecord = [
        'id' => $activityId,
        'user_id' => $userId,
        'user_email' => $userEmail,
        'user_name' => $userName,
        'activity' => $activity,
        'type' => $type, // 'book_add', 'book_update', 'book_delete', 'system'
        'details' => $details,
        'timestamp' => $timestamp,
        'date' => date('Y-m-d'),
        'time' => date('H:i:s')
    ];
    
    // Create notification for librarian
    $notificationRecord = [
        'id' => 'NOT' . time() . rand(100, 999),
        'activity_id' => $activityId,
        'user_id' => $userId,
        'user_email' => $userEmail,
        'user_name' => $userName,
        'message' => $activity,
        'type' => $type,
        'details' => $details,
        'timestamp' => $timestamp,
        'is_read' => false,
        'priority' => 'normal'
    ];
    
    // Add to arrays
    $activities[] = $activityRecord;
    $notifications[] = $notificationRecord;
    
    // Save to files
    saveSystemActivities($activities);
    saveLibrarianNotifications($notifications);
    
    return $activityRecord;
}

// Load books from storage
function loadBooks() {
    global $booksFile;
    if (file_exists($booksFile)) {
        return json_decode(file_get_contents($booksFile), true) ?: [];
    }
    return [];
}

// Save books to storage
function saveBooks($books) {
    global $booksFile;
    file_put_contents($booksFile, json_encode($books, JSON_PRETTY_PRINT));
}

// Get category name by ID
function getCategoryName($categoryId) {
    $categories = [
        1 => 'Literature',
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

// Load registered users
function loadUsers() {
    global $usersFile;
    if (file_exists($usersFile)) {
        return json_decode(file_get_contents($usersFile), true) ?: [];
    }
    return [];
}

// Save registered users
function saveUsers($users) {
    global $usersFile;
    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
}

// Load borrowed books
function loadBorrows() {
    global $borrowsFile;
    if (file_exists($borrowsFile)) {
        $borrows = json_decode(file_get_contents($borrowsFile), true) ?: [];
        
        // Add some sample borrows if file is empty
        if (empty($borrows)) {
            $sampleBorrows = [
                [
                    'id' => 'BRW' . time() . '001',
                    'user_id' => 3,
                    'book_id' => 1,
                    'user_email' => 'hanan.mohammed@student.mwu.edu.et',
                    'book_title' => 'The Great Gatsby',
                    'borrowed_at' => date('Y-m-d H:i:s', strtotime('-5 days')),
                    'due_date' => date('Y-m-d H:i:s', strtotime('+9 days')),
                    'status' => 'borrowed',
                    'is_overdue' => false
                ],
                [
                    'id' => 'BRW' . time() . '002',
                    'user_id' => 3,
                    'book_id' => 2,
                    'user_email' => 'hanan.mohammed@student.mwu.edu.et',
                    'book_title' => 'Clean Code',
                    'borrowed_at' => date('Y-m-d H:i:s', strtotime('-20 days')),
                    'due_date' => date('Y-m-d H:i:s', strtotime('-6 days')),
                    'status' => 'overdue',
                    'is_overdue' => true
                ]
            ];
            saveBorrows($sampleBorrows);
            return $sampleBorrows;
        }
        
        return $borrows;
    }
    return [];
}

// Save borrowed books
function saveBorrows($borrows) {
    global $borrowsFile;
    file_put_contents($borrowsFile, json_encode($borrows, JSON_PRETTY_PRINT));
}

// Load student activities
function loadActivities() {
    global $activitiesFile;
    if (file_exists($activitiesFile)) {
        return json_decode(file_get_contents($activitiesFile), true) ?: [];
    }
    return [];
}

// Save student activities
function saveActivities($activities) {
    global $activitiesFile;
    file_put_contents($activitiesFile, json_encode($activities, JSON_PRETTY_PRINT));
}

// Load librarian notifications
function loadLibrarianNotifications() {
    global $notificationsFile;
    if (file_exists($notificationsFile)) {
        return json_decode(file_get_contents($notificationsFile), true) ?: [];
    }
    return [];
}

// Save librarian notifications
function saveLibrarianNotifications($notifications) {
    global $notificationsFile;
    file_put_contents($notificationsFile, json_encode($notifications, JSON_PRETTY_PRINT));
}

// Add activity log
function logStudentActivity($userId, $userEmail, $userName, $activity, $type = 'general', $details = '') {
    $activities = loadActivities();
    $notifications = loadLibrarianNotifications();
    
    $activityId = 'ACT' . time() . rand(100, 999);
    $timestamp = date('Y-m-d H:i:s');
    
    // Create activity record
    $activityRecord = [
        'id' => $activityId,
        'user_id' => $userId,
        'user_email' => $userEmail,
        'user_name' => $userName,
        'activity' => $activity,
        'type' => $type, // 'borrow', 'return', 'login', 'register', 'general'
        'details' => $details,
        'timestamp' => $timestamp,
        'date' => date('Y-m-d'),
        'time' => date('H:i:s')
    ];
    
    // Create notification for librarian
    $notificationRecord = [
        'id' => 'NOT' . time() . rand(100, 999),
        'activity_id' => $activityId,
        'user_id' => $userId,
        'user_email' => $userEmail,
        'user_name' => $userName,
        'message' => $activity,
        'type' => $type,
        'details' => $details,
        'timestamp' => $timestamp,
        'is_read' => false,
        'priority' => ($type === 'overdue') ? 'high' : 'normal'
    ];
    
    // Add to arrays
    $activities[] = $activityRecord;
    $notifications[] = $notificationRecord;
    
    // Save to files
    saveActivities($activities);
    saveLibrarianNotifications($notifications);
    
    return $activityRecord;
}

// Load student penalties
function loadPenalties() {
    global $penaltiesFile;
    if (file_exists($penaltiesFile)) {
        return json_decode(file_get_contents($penaltiesFile), true) ?: [];
    }
    return [];
}

// Save student penalties
function savePenalties($penalties) {
    global $penaltiesFile;
    file_put_contents($penaltiesFile, json_encode($penalties, JSON_PRETTY_PRINT));
}

// Check if user is suspended
function isUserSuspended($userId) {
    $penalties = loadPenalties();
    
    foreach ($penalties as $penalty) {
        if ($penalty['user_id'] == $userId && $penalty['status'] === 'unpaid') {
            return true;
        }
    }
    
    return false;
}

// Calculate penalty amount based on overdue days
function calculatePenalty($overdueDays) {
    // 50 ETB per day overdue, minimum 200 ETB
    $penaltyPerDay = 50;
    $minimumPenalty = 200;
    
    $penalty = $overdueDays * $penaltyPerDay;
    return max($penalty, $minimumPenalty);
}

// Add penalty for overdue book
function addPenalty($userId, $userEmail, $userName, $borrowId, $bookTitle, $overdueDays) {
    $penalties = loadPenalties();
    
    $penaltyId = 'PEN' . time() . rand(100, 999);
    $penaltyAmount = calculatePenalty($overdueDays);
    
    $penalty = [
        'id' => $penaltyId,
        'user_id' => $userId,
        'user_email' => $userEmail,
        'user_name' => $userName,
        'borrow_id' => $borrowId,
        'book_title' => $bookTitle,
        'overdue_days' => $overdueDays,
        'penalty_amount' => $penaltyAmount,
        'status' => 'unpaid', // 'unpaid', 'paid', 'waived'
        'created_at' => date('Y-m-d H:i:s'),
        'paid_at' => null,
        'payment_method' => null,
        'notes' => ''
    ];
    
    $penalties[] = $penalty;
    savePenalties($penalties);
    
    // Log penalty activity
    logStudentActivity(
        $userId,
        $userEmail,
        $userName,
        "Penalty imposed: " . $penaltyAmount . " ETB for overdue book '{$bookTitle}' ({$overdueDays} days overdue)",
        'penalty',
        "Penalty ID: {$penaltyId}, Amount: " . $penaltyAmount . " ETB"
    );
    
    return $penalty;
}

// Process penalty payment
function processPenaltyPayment($penaltyId, $paymentMethod = 'cash', $notes = '') {
    $penalties = loadPenalties();
    
    for ($i = 0; $i < count($penalties); $i++) {
        if ($penalties[$i]['id'] === $penaltyId) {
            if ($paymentMethod === 'waived') {
                $penalties[$i]['status'] = 'waived';
                $penalties[$i]['paid_at'] = date('Y-m-d H:i:s');
                $penalties[$i]['payment_method'] = 'waived';
                $penalties[$i]['notes'] = $notes;
            } else {
                $penalties[$i]['status'] = 'paid';
                $penalties[$i]['paid_at'] = date('Y-m-d H:i:s');
                $penalties[$i]['payment_method'] = $paymentMethod;
                $penalties[$i]['notes'] = $notes;
            }
            
            savePenalties($penalties);
            
            // Log payment activity
            $activityType = $paymentMethod === 'waived' ? 'waived' : 'payment';
            $activityMessage = $paymentMethod === 'waived' 
                ? "Penalty waived: " . $penalties[$i]['penalty_amount'] . " ETB for book '{$penalties[$i]['book_title']}'"
                : "Penalty paid: " . $penalties[$i]['penalty_amount'] . " ETB for book '{$penalties[$i]['book_title']}'";
            
            logStudentActivity(
                $penalties[$i]['user_id'],
                $penalties[$i]['user_email'],
                $penalties[$i]['user_name'],
                $activityMessage,
                $activityType,
                "Payment method: {$paymentMethod}, Penalty ID: {$penaltyId}"
            );
            
            return $penalties[$i];
        }
    }
    
    return null;
}

// Simple routing
$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Remove query string and clean path
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api.php', '', $path);

// Get request body
$input = json_decode(file_get_contents('php://input'), true);

// Default MWU credentials + registered users
function getAllUsers() {
    $defaultUsers = [
        'sisay.tadesse@mwu.edu.et' => [
            'password' => 'password123',
            'role' => 'admin',
            'name' => 'Dr. Sisay Tadesse',
            'id' => 1,
            'student_id' => null,
            'phone' => null
        ],
        'mulugeta.bekele@mwu.edu.et' => [
            'password' => 'password123',
            'role' => 'librarian',
            'name' => 'Ato Mulugeta Bekele',
            'id' => 2,
            'student_id' => null,
            'phone' => null
        ],
        'hanan.mohammed@student.mwu.edu.et' => [
            'password' => 'password123',
            'role' => 'student',
            'name' => 'Hanan Mohammed',
            'id' => 3,
            'student_id' => 'STU001',
            'phone' => '+251911234567'
        ]
    ];
    
    $registeredUsers = loadUsers();
    return array_merge($defaultUsers, $registeredUsers);
}

// Simple responses for testing
switch ($path) {
    case '/register':
        if ($method === 'POST') {
            $name = $input['name'] ?? '';
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            $confirmPassword = $input['confirm_password'] ?? '';
            $studentId = $input['student_id'] ?? '';
            $phone = $input['phone'] ?? '';
            $role = $input['role'] ?? 'student'; // Default to student
            
            // Validate required fields
            if (empty($name) || empty($email) || empty($password)) {
                http_response_code(400);
                echo json_encode(['message' => 'Name, email, and password are required']);
                break;
            }
            
            // Skip password confirmation check - allow any password
            // if ($password !== $confirmPassword) {
            //     http_response_code(400);
            //     echo json_encode(['message' => 'Passwords do not match']);
            //     break;
            // }
            
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
            
            // Validate email domain based on role
            if ($role === 'student' && !preg_match('/@student\.mwu\.edu\.et$/', $email)) {
                http_response_code(400);
                echo json_encode(['message' => 'Student email must end with @student.mwu.edu.et']);
                break;
            } elseif ($role !== 'student' && !preg_match('/@mwu\.edu\.et$/', $email)) {
                http_response_code(400);
                echo json_encode(['message' => 'Staff email must end with @mwu.edu.et']);
                break;
            }
            
            // Check if user already exists
            $allUsers = getAllUsers();
            if (isset($allUsers[$email])) {
                http_response_code(400);
                echo json_encode(['message' => 'User with this email already exists']);
                break;
            }
            
            // Load existing registered users
            $registeredUsers = loadUsers();
            
            // Generate new user ID
            $newId = count($allUsers) + 1;
            
            // Create new user with pending approval status
            $newUser = [
                'password' => $password, // In real app, hash this password
                'role' => $role,
                'name' => $name,
                'id' => $newId,
                'student_id' => $studentId,
                'phone' => $phone,
                'registered_at' => date('Y-m-d H:i:s'),
                'status' => 'pending', // pending, approved, rejected
                'approved_by' => null,
                'approved_at' => null
            ];
            
            // Add to registered users
            $registeredUsers[$email] = $newUser;
            
            // Save to file
            saveUsers($registeredUsers);
            
            // Log registration activity
            $activityMessage = $role === 'student' 
                ? "New student registered: {$newUser['name']} (ID: {$newUser['student_id']})"
                : "New {$role} registered: {$newUser['name']}";
                
            logStudentActivity(
                $newUser['id'],
                $email,
                $newUser['name'],
                $activityMessage,
                'register',
                "Phone: {$newUser['phone']}, Email: {$email}, Role: {$role}"
            );
            
            // Create admin notification for new registration
            logSystemActivity(
                $newUser['id'],
                $email,
                $newUser['name'],
                "🔔 NEW REGISTRATION: {$newUser['name']} needs approval",
                'new_registration',
                "Student ID: {$newUser['student_id']}, Phone: {$newUser['phone']}, Email: {$email} - PENDING APPROVAL"
            );
            
            echo json_encode([
                'message' => 'Registration successful! Your account is pending admin approval. You will be notified once approved.',
                'user' => [
                    'id' => $newUser['id'],
                    'name' => $newUser['name'],
                    'email' => $email,
                    'role' => $newUser['role'],
                    'student_id' => $newUser['student_id'],
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
            
            // Get all users (default + registered)
            $allUsers = getAllUsers();
            
            if (isset($allUsers[$email])) {
                $user = $allUsers[$email];
                
                // Check if account is pending approval
                if (isset($user['status']) && $user['status'] === 'pending') {
                    http_response_code(403);
                    echo json_encode(['message' => 'Your account is pending admin approval. Please wait for approval before logging in.']);
                    break;
                }
                
                // Check if account is rejected
                if (isset($user['status']) && $user['status'] === 'rejected') {
                    http_response_code(403);
                    echo json_encode(['message' => 'Your account registration was rejected. Please contact the administrator.']);
                    break;
                }
                
                if ($user['password'] === $password && $user['role'] === $role) {
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
                } else {
                    http_response_code(401);
                    echo json_encode(['message' => 'Invalid credentials or role mismatch']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['message' => 'User not found. Please register first if you are a new student.']);
            }
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
                // Get user data
                $allUsers = getAllUsers();
                $user = $allUsers[$email];
                
                // Log successful login
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
            
            // Check if user is suspended due to unpaid penalties
            if (isUserSuspended($userId)) {
                http_response_code(403);
                echo json_encode([
                    'message' => 'Account suspended due to unpaid penalties. Please pay outstanding fines to reactivate your account.',
                    'suspended' => true
                ]);
                break;
            }
            
            $borrows = loadBorrows();
            $borrowId = 'BRW' . time() . rand(100, 999);
            
            // Calculate due date (14 days from now)
            $borrowDate = date('Y-m-d H:i:s');
            $dueDate = date('Y-m-d H:i:s', strtotime('+14 days'));
            
            // Get book details if not provided
            if (empty($bookTitle)) {
                $books = loadBooks();
                $bookTitles = [];
                foreach ($books as $book) {
                    $bookTitles[$book['id']] = $book['title'];
                }
                $bookTitle = $bookTitles[$bookId] ?? 'Unknown Book';
            }
            
            // Get user details if not provided
            if (empty($userEmail) || empty($userName)) {
                $users = getAllUsers();
                foreach ($users as $email => $userData) {
                    if ($userData['id'] == $userId) {
                        $userEmail = $email;
                        $userName = $userData['name'];
                        break;
                    }
                }
            }
            
            // Create borrow request with PENDING status (needs librarian approval)
            $newBorrow = [
                'id' => $borrowId,
                'user_id' => $userId,
                'book_id' => $bookId,
                'user_email' => $userEmail,
                'user_name' => $userName,
                'book_title' => $bookTitle,
                'borrowed_at' => $borrowDate,
                'due_date' => $dueDate,
                'status' => 'pending', // pending, approved, rejected, borrowed, returned
                'is_overdue' => false,
                'requested_at' => $borrowDate,
                'approved_by' => null,
                'approved_at' => null
            ];
            
            $borrows[] = $newBorrow;
            saveBorrows($borrows);
            
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
                'borrow' => $newBorrow
            ]);
        } else if ($method === 'GET') {
            $borrows = loadBorrows();
            $currentTime = time();
            
            // Update overdue status
            for ($i = 0; $i < count($borrows); $i++) {
                if ($borrows[$i]['status'] === 'borrowed') {
                    $dueDate = strtotime($borrows[$i]['due_date']);
                    $borrows[$i]['is_overdue'] = $currentTime > $dueDate;
                    if ($borrows[$i]['is_overdue']) {
                        $borrows[$i]['status'] = 'overdue';
                    }
                }
            }
            
            saveBorrows($borrows);
            echo json_encode($borrows);
        }
        break;
        
    case '/borrows/approve':
        if ($method === 'POST') {
            $borrowId = $input['borrow_id'] ?? '';
            $action = $input['action'] ?? ''; // 'approve' or 'reject'
            $librarianEmail = $input['librarian_email'] ?? '';
            $librarianName = $input['librarian_name'] ?? 'Librarian';
            
            if (empty($borrowId) || empty($action)) {
                http_response_code(400);
                echo json_encode(['message' => 'Borrow ID and action are required']);
                break;
            }
            
            $borrows = loadBorrows();
            $borrowIndex = -1;
            
            for ($i = 0; $i < count($borrows); $i++) {
                if ($borrows[$i]['id'] == $borrowId) { // Use == instead of ===
                    $borrowIndex = $i;
                    break;
                }
            }
            
            if ($borrowIndex === -1) {
                http_response_code(404);
                echo json_encode(['message' => 'Borrow request not found']);
                break;
            }
            
            if ($action === 'approve') {
                $borrows[$borrowIndex]['status'] = 'borrowed';
                $borrows[$borrowIndex]['approved_by'] = $librarianEmail;
                $borrows[$borrowIndex]['approved_at'] = date('Y-m-d H:i:s');
                
                // Update book availability
                $books = loadBooks();
                for ($i = 0; $i < count($books); $i++) {
                    if ($books[$i]['id'] == $borrows[$borrowIndex]['book_id']) {
                        if ($books[$i]['available_quantity'] > 0) {
                            $books[$i]['available_quantity']--;
                            saveBooks($books);
                        }
                        break;
                    }
                }
                
                saveBorrows($borrows);
                
                // Log activity
                logStudentActivity(
                    $borrows[$borrowIndex]['user_id'],
                    $borrows[$borrowIndex]['user_email'],
                    $borrows[$borrowIndex]['user_name'],
                    "Borrow request APPROVED by {$librarianName}: {$borrows[$borrowIndex]['book_title']}",
                    'borrow_approved',
                    "Book ID: {$borrows[$borrowIndex]['book_id']}, Due: {$borrows[$borrowIndex]['due_date']}"
                );
                
                echo json_encode([
                    'message' => 'Borrow request approved successfully',
                    'borrow' => $borrows[$borrowIndex]
                ]);
            } elseif ($action === 'reject') {
                $borrows[$borrowIndex]['status'] = 'rejected';
                $borrows[$borrowIndex]['approved_by'] = $librarianEmail;
                $borrows[$borrowIndex]['approved_at'] = date('Y-m-d H:i:s');
                
                saveBorrows($borrows);
                
                // Log activity
                logStudentActivity(
                    $borrows[$borrowIndex]['user_id'],
                    $borrows[$borrowIndex]['user_email'],
                    $borrows[$borrowIndex]['user_name'],
                    "Borrow request REJECTED by {$librarianName}: {$borrows[$borrowIndex]['book_title']}",
                    'borrow_rejected',
                    "Book ID: {$borrows[$borrowIndex]['book_id']}, Reason: Librarian decision"
                );
                
                echo json_encode([
                    'message' => 'Borrow request rejected',
                    'borrow' => $borrows[$borrowIndex]
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
            
            $borrows = loadBorrows();
            $found = false;
            
            for ($i = 0; $i < count($borrows); $i++) {
                if ($borrows[$i]['id'] === $borrowId && $borrows[$i]['status'] === 'borrowed') {
                    // Check if book is not overdue
                    $dueDate = strtotime($borrows[$i]['due_date']);
                    $currentTime = time();
                    
                    if ($currentTime > $dueDate) {
                        http_response_code(400);
                        echo json_encode(['message' => 'Cannot renew overdue books. Please return the book first.']);
                        break 2;
                    }
                    
                    // Check if book has been renewed before (max 1 renewal)
                    if (isset($borrows[$i]['renewed']) && $borrows[$i]['renewed']) {
                        http_response_code(400);
                        echo json_encode(['message' => 'Book has already been renewed once. Maximum renewals reached.']);
                        break 2;
                    }
                    
                    // Extend due date by 14 days
                    $newDueDate = date('Y-m-d H:i:s', strtotime($borrows[$i]['due_date'] . ' +14 days'));
                    $borrows[$i]['due_date'] = $newDueDate;
                    $borrows[$i]['renewed'] = true;
                    $borrows[$i]['renewed_at'] = date('Y-m-d H:i:s');
                    
                    saveBorrows($borrows);
                    
                    // Log renewal activity
                    logStudentActivity(
                        $borrows[$i]['user_id'],
                        $borrows[$i]['user_email'],
                        'Student',
                        "Book renewed: '{$borrows[$i]['book_title']}' - New due date: {$newDueDate}",
                        'renew',
                        "Borrow ID: {$borrowId}, Extended by 14 days"
                    );
                    
                    echo json_encode([
                        'message' => 'Book renewed successfully',
                        'new_due_date' => $newDueDate,
                        'borrow' => $borrows[$i]
                    ]);
                    $found = true;
                    break;
                }
            }
            
            if (!$found) {
                http_response_code(404);
                echo json_encode(['message' => 'Active borrow record not found or book is not eligible for renewal']);
            }
        }
        break;
        
    case '/return':
    case '/borrows/return':
        if ($method === 'POST') {
            $borrowId = $input['borrow_id'] ?? '';
            $userId = $input['user_id'] ?? '';
            $userEmail = $input['user_email'] ?? '';
            $userName = $input['user_name'] ?? '';
            
            if (empty($borrowId)) {
                http_response_code(400);
                echo json_encode(['message' => 'Borrow ID is required']);
                break;
            }
            
            $borrows = loadBorrows();
            $found = false;
            
            for ($i = 0; $i < count($borrows); $i++) {
                if ($borrows[$i]['id'] === $borrowId) {
                    // Check if already pending return
                    if ($borrows[$i]['status'] === 'return_pending') {
                        http_response_code(400);
                        echo json_encode(['message' => 'Return request already submitted. Waiting for librarian approval.']);
                        break;
                    }
                    
                    // Check if overdue
                    $dueDate = strtotime($borrows[$i]['due_date']);
                    $currentTime = time();
                    $isOverdue = $currentTime > $dueDate;
                    $overdueDays = 0;
                    
                    if ($isOverdue) {
                        $overdueDays = ceil(($currentTime - $dueDate) / (24 * 60 * 60));
                    }
                    
                    // Change status to return_pending (needs librarian approval)
                    $borrows[$i]['status'] = 'return_pending';
                    $borrows[$i]['return_requested_at'] = date('Y-m-d H:i:s');
                    $borrows[$i]['is_overdue'] = $isOverdue;
                    $borrows[$i]['overdue_days'] = $overdueDays;
                    
                    saveBorrows($borrows);
                    
                    // Create notification for librarian
                    logSystemActivity(
                        $borrows[$i]['user_id'],
                        $borrows[$i]['user_email'],
                        $borrows[$i]['user_name'] ?? $userName,
                        "🔔 RETURN REQUEST: {$borrows[$i]['user_name']} wants to return '{$borrows[$i]['book_title']}'",
                        'return_request',
                        "Book: {$borrows[$i]['book_title']}, " . ($isOverdue ? "OVERDUE by {$overdueDays} days" : "On time") . " - PENDING LIBRARIAN APPROVAL"
                    );
                    
                    // Log student activity
                    logStudentActivity(
                        $borrows[$i]['user_id'],
                        $borrows[$i]['user_email'],
                        $borrows[$i]['user_name'] ?? $userName,
                        "Requested to return: {$borrows[$i]['book_title']}",
                        'return_request',
                        "Borrow ID: {$borrowId}, " . ($isOverdue ? "Overdue: {$overdueDays} days" : "On time")
                    );
                    
                    $found = true;
                    
                    echo json_encode([
                        'message' => 'Return request submitted! Waiting for librarian approval.',
                        'is_overdue' => $isOverdue,
                        'overdue_days' => $overdueDays,
                        'status' => 'return_pending'
                    ]);
                    break;
                }
            }
            
            if (!$found) {
                http_response_code(404);
                echo json_encode(['message' => 'Borrow record not found']);
            }
        }
        break;
        
    case '/returns/approve':
        if ($method === 'POST') {
            $borrowId = $input['borrow_id'] ?? '';
            $action = $input['action'] ?? ''; // 'approve' or 'reject'
            $librarianEmail = $input['librarian_email'] ?? '';
            $librarianName = $input['librarian_name'] ?? 'Librarian';
            
            if (empty($borrowId) || empty($action)) {
                http_response_code(400);
                echo json_encode(['message' => 'Borrow ID and action are required']);
                break;
            }
            
            $borrows = loadBorrows();
            $borrowIndex = -1;
            
            for ($i = 0; $i < count($borrows); $i++) {
                if ($borrows[$i]['id'] == $borrowId) { // Use == instead of === to allow type coercion
                    $borrowIndex = $i;
                    break;
                }
            }
            
            if ($borrowIndex === -1) {
                http_response_code(404);
                echo json_encode(['message' => 'Return request not found']);
                break;
            }
            
            if ($action === 'approve') {
                $isOverdue = $borrows[$borrowIndex]['is_overdue'] ?? false;
                $overdueDays = $borrows[$borrowIndex]['overdue_days'] ?? 0;
                
                if ($isOverdue && $overdueDays > 0) {
                    // Create penalty for overdue book
                    $penalty = addPenalty(
                        $borrows[$borrowIndex]['user_id'],
                        $borrows[$borrowIndex]['user_email'],
                        $borrows[$borrowIndex]['user_name'] ?? 'Student',
                        $borrowId,
                        $borrows[$borrowIndex]['book_title'],
                        $overdueDays
                    );
                    
                    $borrows[$borrowIndex]['status'] = 'returned_with_penalty';
                    $borrows[$borrowIndex]['penalty_id'] = $penalty['id'];
                    $borrows[$borrowIndex]['penalty_amount'] = $penalty['penalty_amount'];
                } else {
                    $borrows[$borrowIndex]['status'] = 'returned';
                }
                
                $borrows[$borrowIndex]['returned_at'] = date('Y-m-d H:i:s');
                $borrows[$borrowIndex]['return_approved_by'] = $librarianEmail;
                $borrows[$borrowIndex]['return_approved_at'] = date('Y-m-d H:i:s');
                
                // Update book availability
                $books = loadBooks();
                for ($j = 0; $j < count($books); $j++) {
                    if ($books[$j]['id'] == $borrows[$borrowIndex]['book_id']) {
                        $books[$j]['available_quantity']++;
                        saveBooks($books);
                        break;
                    }
                }
                
                saveBorrows($borrows);
                
                // Log activity
                logStudentActivity(
                    $borrows[$borrowIndex]['user_id'],
                    $borrows[$borrowIndex]['user_email'],
                    $borrows[$borrowIndex]['user_name'] ?? 'Student',
                    "Return APPROVED by {$librarianName}: {$borrows[$borrowIndex]['book_title']}",
                    'return_approved',
                    ($isOverdue ? "Overdue: {$overdueDays} days, Penalty created" : "Returned on time")
                );
                
                echo json_encode([
                    'message' => 'Return approved successfully',
                    'borrow' => $borrows[$borrowIndex],
                    'penalty' => isset($penalty) ? $penalty : null
                ]);
            } elseif ($action === 'reject') {
                $borrows[$borrowIndex]['status'] = 'borrowed'; // Back to borrowed
                $borrows[$borrowIndex]['return_rejected_by'] = $librarianEmail;
                $borrows[$borrowIndex]['return_rejected_at'] = date('Y-m-d H:i:s');
                
                saveBorrows($borrows);
                
                // Log activity
                logStudentActivity(
                    $borrows[$borrowIndex]['user_id'],
                    $borrows[$borrowIndex]['user_email'],
                    $borrows[$borrowIndex]['user_name'] ?? 'Student',
                    "Return REJECTED by {$librarianName}: {$borrows[$borrowIndex]['book_title']}",
                    'return_rejected',
                    "Book must remain borrowed"
                );
                
                echo json_encode([
                    'message' => 'Return rejected',
                    'borrow' => $borrows[$borrowIndex]
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['message' => 'Invalid action. Use approve or reject']);
            }
        }
        break;
        
    case '/borrows/force-return':
        if ($method === 'POST') {
            $borrowId = $input['borrow_id'] ?? '';
            
            if (empty($borrowId)) {
                http_response_code(400);
                echo json_encode(['message' => 'Borrow ID is required']);
                break;
            }
            
            $borrows = loadBorrows();
            $found = false;
            
            for ($i = 0; $i < count($borrows); $i++) {
                if ($borrows[$i]['id'] === $borrowId) {
                    // Force return without approval (for librarian)
                    $isOverdue = $borrows[$i]['is_overdue'] ?? false;
                    $overdueDays = $borrows[$i]['overdue_days'] ?? 0;
                    
                    if ($isOverdue && $overdueDays > 0) {
                        // Create penalty
                        $penalty = addPenalty(
                            $borrows[$i]['user_id'],
                            $borrows[$i]['user_email'],
                            $borrows[$i]['user_name'] ?? 'Student',
                            $borrowId,
                            $borrows[$i]['book_title'],
                            $overdueDays
                        );
                        
                        $borrows[$i]['status'] = 'returned_with_penalty';
                        $borrows[$i]['penalty_id'] = $penalty['id'];
                        $borrows[$i]['penalty_amount'] = $penalty['penalty_amount'];
                    } else {
                        $borrows[$i]['status'] = 'returned';
                    }
                    
                    $borrows[$i]['returned_at'] = date('Y-m-d H:i:s');
                    
                    // Update book availability
                    $books = loadBooks();
                    for ($j = 0; $j < count($books); $j++) {
                        if ($books[$j]['id'] == $borrows[$i]['book_id']) {
                            $books[$j]['available_quantity']++;
                            saveBooks($books);
                            break;
                        }
                    }
                    
                    $found = true;
                    break;
                }
            }
            
            if ($found) {
                saveBorrows($borrows);
                echo json_encode(['message' => 'Book returned successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Borrow record not found']);
            }
        }
        break;
        
    case '/notifications':
        if ($method === 'GET') {
            $borrows = loadBorrows();
            $currentTime = time();
            $notifications = [];
            
            foreach ($borrows as $borrow) {
                if ($borrow['status'] === 'borrowed' || $borrow['status'] === 'overdue') {
                    $dueDate = strtotime($borrow['due_date']);
                    $isOverdue = $currentTime > $dueDate;
                    $daysDiff = floor(($currentTime - $dueDate) / (24 * 60 * 60));
                    
                    $notification = [
                        'id' => $borrow['id'],
                        'type' => $isOverdue ? 'overdue' : 'borrowed',
                        'message' => $isOverdue ? 
                            "Book '{$borrow['book_title']}' is overdue by {$daysDiff} days" :
                            "Book '{$borrow['book_title']}' borrowed by {$borrow['user_email']}",
                        'user_email' => $borrow['user_email'],
                        'book_title' => $borrow['book_title'],
                        'due_date' => $borrow['due_date'],
                        'borrowed_at' => $borrow['borrowed_at'],
                        'is_overdue' => $isOverdue,
                        'days_overdue' => $isOverdue ? $daysDiff : 0
                    ];
                    
                    $notifications[] = $notification;
                }
            }
            
            echo json_encode($notifications);
        }
        break;
        
    case '/categories':
        if ($method === 'GET') {
            echo json_encode([
                [
                    'id' => 1,
                    'name' => 'Fiction',
                    'description' => 'Fictional books and novels',
                    'books_count' => 5
                ],
                [
                    'id' => 2,
                    'name' => 'Science',
                    'description' => 'Scientific books and research',
                    'books_count' => 3
                ],
                [
                    'id' => 3,
                    'name' => 'Technology',
                    'description' => 'Technology and programming books',
                    'books_count' => 8
                ],
                [
                    'id' => 4,
                    'name' => 'History',
                    'description' => 'Historical books and documents',
                    'books_count' => 4
                ],
                [
                    'id' => 5,
                    'name' => 'Biography',
                    'description' => 'Biographical books',
                    'books_count' => 2
                ]
            ]);
        }
        break;
        
    case '/books':
        if ($method === 'GET') {
            $search = $_GET['search'] ?? '';
            $searchType = $_GET['search_type'] ?? 'all';
            $categoryId = $_GET['category_id'] ?? '';
            $availableOnly = isset($_GET['available_only']) && $_GET['available_only'] === 'true';
            
            // Load books from storage
            $books = loadBooks();
            
            // Apply search filter
            if (!empty($search)) {
                $books = array_filter($books, function($book) use ($search, $searchType) {
                    $searchLower = strtolower($search);
                    
                    switch ($searchType) {
                        case 'title':
                            return strpos(strtolower($book['title']), $searchLower) !== false;
                        case 'author':
                            return strpos(strtolower($book['author']), $searchLower) !== false;
                        case 'isbn':
                            return strpos(strtolower($book['isbn']), $searchLower) !== false;
                        default: // 'all'
                            return strpos(strtolower($book['title']), $searchLower) !== false ||
                                   strpos(strtolower($book['author']), $searchLower) !== false ||
                                   strpos(strtolower($book['isbn']), $searchLower) !== false;
                    }
                });
            }
            
            // Apply category filter
            if (!empty($categoryId)) {
                $books = array_filter($books, function($book) use ($categoryId) {
                    return $book['category_id'] == $categoryId;
                });
            }
            
            // Apply availability filter
            if ($availableOnly) {
                $books = array_filter($books, function($book) {
                    return $book['available_quantity'] > 0;
                });
            }
            
            // Reset array keys
            $books = array_values($books);
            
            echo json_encode([
                'data' => $books,
                'total' => count($books),
                'per_page' => 10,
                'current_page' => 1
            ]);
        } else if ($method === 'POST') {
            // Add new book
            $title = $input['title'] ?? '';
            $author = $input['author'] ?? '';
            $isbn = $input['isbn'] ?? '';
            $categoryId = $input['category_id'] ?? '';
            $quantity = $input['quantity'] ?? 1;
            $description = $input['description'] ?? '';
            $publicationYear = $input['publication_year'] ?? date('Y');
            $publisher = $input['publisher'] ?? '';
            
            // Get librarian information
            $librarianId = $input['librarian_id'] ?? 0;
            $librarianEmail = $input['librarian_email'] ?? 'system@mwu.edu.et';
            $librarianName = $input['librarian_name'] ?? 'System';
            
            // Validate required fields
            if (empty($title) || empty($author) || empty($isbn)) {
                http_response_code(400);
                echo json_encode(['message' => 'Title, author, and ISBN are required']);
                break;
            }
            
            // Load existing books
            $books = loadBooks();
            
            // Generate new book ID
            $maxId = 0;
            foreach ($books as $book) {
                if ($book['id'] > $maxId) {
                    $maxId = $book['id'];
                }
            }
            $newId = $maxId + 1;
            
            $newBook = [
                'id' => $newId,
                'title' => $title,
                'author' => $author,
                'isbn' => $isbn,
                'category_id' => (int)$categoryId,
                'quantity' => (int)$quantity,
                'available_quantity' => (int)$quantity,
                'description' => $description,
                'publication_year' => (int)$publicationYear,
                'publisher' => $publisher,
                'category' => ['name' => getCategoryName((int)$categoryId)],
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            // Add to books array
            $books[] = $newBook;
            
            // Save to storage
            saveBooks($books);
            
            // Log book addition activity with librarian information
            logSystemActivity(
                $librarianId,
                $librarianEmail,
                $librarianName,
                "New book added: '{$title}' by {$author}",
                'book_add',
                "ISBN: {$isbn}, Quantity: {$quantity}"
            );
            
            echo json_encode([
                'message' => 'Book added successfully',
                'book' => $newBook
            ]);
        }
        break;
        
    case '/books/update':
        if ($method === 'POST') {
            $bookId = $input['book_id'] ?? '';
            $title = $input['title'] ?? '';
            $author = $input['author'] ?? '';
            $isbn = $input['isbn'] ?? '';
            $categoryId = $input['category_id'] ?? '';
            $quantity = $input['quantity'] ?? 1;
            $description = $input['description'] ?? '';
            $publicationYear = $input['publication_year'] ?? date('Y');
            $publisher = $input['publisher'] ?? '';
            
            // Get librarian information
            $librarianId = $input['librarian_id'] ?? 0;
            $librarianEmail = $input['librarian_email'] ?? 'system@mwu.edu.et';
            $librarianName = $input['librarian_name'] ?? 'System';
            
            if (empty($bookId)) {
                http_response_code(400);
                echo json_encode(['message' => 'Book ID is required']);
                break;
            }
            
            // Load existing books
            $books = loadBooks();
            $found = false;
            
            // Update the book
            for ($i = 0; $i < count($books); $i++) {
                if ($books[$i]['id'] == $bookId) {
                    $books[$i]['title'] = $title;
                    $books[$i]['author'] = $author;
                    $books[$i]['isbn'] = $isbn;
                    $books[$i]['category_id'] = (int)$categoryId;
                    $books[$i]['quantity'] = (int)$quantity;
                    $books[$i]['description'] = $description;
                    $books[$i]['publication_year'] = (int)$publicationYear;
                    $books[$i]['publisher'] = $publisher;
                    $books[$i]['category'] = ['name' => getCategoryName((int)$categoryId)];
                    $books[$i]['updated_at'] = date('Y-m-d H:i:s');
                    $found = true;
                    break;
                }
            }
            
            if ($found) {
                // Save to storage
                saveBooks($books);
                
                // Log book update activity with librarian information
                logSystemActivity(
                    $librarianId,
                    $librarianEmail,
                    $librarianName,
                    "Book updated: '{$title}' by {$author}",
                    'book_update',
                    "Book ID: {$bookId}, ISBN: {$isbn}"
                );
                
                echo json_encode([
                    'message' => 'Book updated successfully',
                    'book_id' => $bookId
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Book not found']);
            }
        }
        break;
        
    case '/books/delete':
        if ($method === 'POST') {
            $bookId = $input['book_id'] ?? '';
            
            // Get librarian information
            $librarianId = $input['librarian_id'] ?? 0;
            $librarianEmail = $input['librarian_email'] ?? 'system@mwu.edu.et';
            $librarianName = $input['librarian_name'] ?? 'System';
            
            if (empty($bookId)) {
                http_response_code(400);
                echo json_encode(['message' => 'Book ID is required']);
                break;
            }
            
            // Load existing books
            $books = loadBooks();
            $deletedBook = null;
            $newBooks = [];
            
            // Check if book has active borrows
            $borrows = loadBorrows();
            $activeBorrows = array_filter($borrows, function($borrow) use ($bookId) {
                return $borrow['book_id'] == $bookId && 
                       in_array($borrow['status'], ['borrowed', 'overdue', 'pending', 'return_pending']);
            });
            
            if (!empty($activeBorrows)) {
                http_response_code(400);
                echo json_encode([
                    'message' => 'Cannot delete book with active borrows. Please ensure all copies are returned first.',
                    'active_borrows' => count($activeBorrows)
                ]);
                break;
            }
            
            // Find and remove the book
            foreach ($books as $book) {
                if ($book['id'] == $bookId) {
                    $deletedBook = $book;
                } else {
                    $newBooks[] = $book;
                }
            }
            
            if ($deletedBook) {
                // Save updated books list
                saveBooks($newBooks);
                
                // Log book deletion activity
                logSystemActivity(
                    $librarianId,
                    $librarianEmail,
                    $librarianName,
                    "Book deleted: '{$deletedBook['title']}' by {$deletedBook['author']}",
                    'book_deletion',
                    "Book ID: {$bookId}, ISBN: {$deletedBook['isbn']}"
                );
                
                echo json_encode([
                    'message' => 'Book deleted successfully',
                    'deleted_book' => [
                        'id' => $deletedBook['id'],
                        'title' => $deletedBook['title'],
                        'author' => $deletedBook['author']
                    ]
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['message' => 'Book not found']);
            }
        }
        break;
        
    case '/users':
        if ($method === 'GET') {
            $allUsers = getAllUsers();
            $usersList = [];
            
            foreach ($allUsers as $email => $userData) {
                $usersList[] = [
                    'id' => $userData['id'],
                    'name' => $userData['name'],
                    'email' => $email,
                    'role' => $userData['role'],
                    'student_id' => $userData['student_id'] ?? null,
                    'phone' => $userData['phone'] ?? null,
                    'status' => $userData['status'] ?? 'approved', // Show actual status
                    'registered_at' => $userData['registered_at'] ?? null,
                    'approved_by' => $userData['approved_by'] ?? null,
                    'approved_at' => $userData['approved_at'] ?? null
                ];
            }
            
            echo json_encode($usersList);
        }
        break;
        
    case '/users/approve':
        if ($method === 'POST') {
            $userEmail = $input['email'] ?? '';
            $action = $input['action'] ?? ''; // 'approve' or 'reject'
            $adminEmail = $input['admin_email'] ?? '';
            $adminName = $input['admin_name'] ?? 'Admin';
            
            if (empty($userEmail) || empty($action)) {
                http_response_code(400);
                echo json_encode(['message' => 'Email and action are required']);
                break;
            }
            
            $registeredUsers = loadUsers();
            
            if (!isset($registeredUsers[$userEmail])) {
                http_response_code(404);
                echo json_encode(['message' => 'User not found']);
                break;
            }
            
            if ($action === 'approve') {
                $registeredUsers[$userEmail]['status'] = 'approved';
                $registeredUsers[$userEmail]['approved_by'] = $adminEmail;
                $registeredUsers[$userEmail]['approved_at'] = date('Y-m-d H:i:s');
                
                saveUsers($registeredUsers);
                
                // Log activity
                logSystemActivity(
                    $registeredUsers[$userEmail]['id'],
                    $userEmail,
                    $registeredUsers[$userEmail]['name'],
                    "User account approved by {$adminName}",
                    'user_approval',
                    "Student: {$registeredUsers[$userEmail]['name']} ({$registeredUsers[$userEmail]['student_id']})"
                );
                
                echo json_encode([
                    'message' => 'User approved successfully',
                    'user' => $registeredUsers[$userEmail]
                ]);
            } elseif ($action === 'reject') {
                $registeredUsers[$userEmail]['status'] = 'rejected';
                $registeredUsers[$userEmail]['approved_by'] = $adminEmail;
                $registeredUsers[$userEmail]['approved_at'] = date('Y-m-d H:i:s');
                
                saveUsers($registeredUsers);
                
                // Log activity
                logSystemActivity(
                    $registeredUsers[$userEmail]['id'],
                    $userEmail,
                    $registeredUsers[$userEmail]['name'],
                    "User account rejected by {$adminName}",
                    'user_rejection',
                    "Student: {$registeredUsers[$userEmail]['name']} ({$registeredUsers[$userEmail]['student_id']})"
                );
                
                echo json_encode([
                    'message' => 'User rejected successfully',
                    'user' => $registeredUsers[$userEmail]
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['message' => 'Invalid action. Use approve or reject']);
            }
        }
        break;
        
    case '/users/delete':
        if ($method === 'POST') {
            $userEmail = $input['email'] ?? '';
            $adminEmail = $input['admin_email'] ?? '';
            $adminName = $input['admin_name'] ?? 'Admin';
            
            if (empty($userEmail)) {
                http_response_code(400);
                echo json_encode(['message' => 'Email is required']);
                break;
            }
            
            // Check if user is a default system user (cannot be deleted)
            $defaultEmails = [
                'sisay.tadesse@mwu.edu.et',
                'abebe.kebede@mwu.edu.et',
                'tigist.alemu@mwu.edu.et',
                'admin@mwu.edu.et'
            ];
            
            if (in_array($userEmail, $defaultEmails)) {
                http_response_code(403);
                echo json_encode(['message' => 'Cannot delete default system users']);
                break;
            }
            
            $registeredUsers = loadUsers();
            
            if (!isset($registeredUsers[$userEmail])) {
                http_response_code(404);
                echo json_encode(['message' => 'User not found']);
                break;
            }
            
            $deletedUser = $registeredUsers[$userEmail];
            
            // Check if user has active borrows
            $borrows = loadBorrows();
            $activeBorrows = array_filter($borrows, function($borrow) use ($deletedUser) {
                return $borrow['user_id'] == $deletedUser['id'] && 
                       in_array($borrow['status'], ['borrowed', 'overdue', 'pending', 'return_pending']);
            });
            
            if (!empty($activeBorrows)) {
                http_response_code(400);
                echo json_encode([
                    'message' => 'Cannot delete user with active borrows. Please ensure all books are returned first.',
                    'active_borrows' => count($activeBorrows)
                ]);
                break;
            }
            
            // Delete the user
            unset($registeredUsers[$userEmail]);
            saveUsers($registeredUsers);
            
            // Log activity
            logSystemActivity(
                $deletedUser['id'],
                $userEmail,
                $deletedUser['name'],
                "User account deleted by {$adminName}",
                'user_deletion',
                "Student: {$deletedUser['name']} ({$deletedUser['student_id']})"
            );
            
            echo json_encode([
                'message' => 'User deleted successfully',
                'deleted_user' => [
                    'name' => $deletedUser['name'],
                    'email' => $userEmail,
                    'student_id' => $deletedUser['student_id']
                ]
            ]);
        }
        break;
        
    case '/users/reset-password':
        if ($method === 'POST') {
            $userEmail = $input['email'] ?? '';
            $adminEmail = $input['admin_email'] ?? '';
            $adminName = $input['admin_name'] ?? 'Admin';
            
            if (empty($userEmail)) {
                http_response_code(400);
                echo json_encode(['message' => 'Email is required']);
                break;
            }
            
            // Check if it's a default user or registered user
            $allUsers = getAllUsers();
            
            if (!isset($allUsers[$userEmail])) {
                http_response_code(404);
                echo json_encode(['message' => 'User not found']);
                break;
            }
            
            $user = $allUsers[$userEmail];
            
            // Generate a temporary password (8 characters: letters + numbers)
            $tempPassword = substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 8);
            
            // Check if this is a registered user (not default)
            $registeredUsers = loadUsers();
            $isRegisteredUser = isset($registeredUsers[$userEmail]);
            
            if ($isRegisteredUser) {
                // Update password for registered user
                $registeredUsers[$userEmail]['password'] = password_hash($tempPassword, PASSWORD_DEFAULT);
                $registeredUsers[$userEmail]['password_reset_at'] = date('Y-m-d H:i:s');
                $registeredUsers[$userEmail]['password_reset_by'] = $adminEmail;
                saveUsers($registeredUsers);
                
                // Log activity
                logSystemActivity(
                    $user['id'],
                    $userEmail,
                    $user['name'],
                    "Password reset by {$adminName}",
                    'password_reset',
                    "Temporary password generated for: {$user['name']}"
                );
                
                echo json_encode([
                    'message' => 'Password reset successfully',
                    'temporary_password' => $tempPassword,
                    'user' => [
                        'name' => $user['name'],
                        'email' => $userEmail,
                        'role' => $user['role']
                    ]
                ]);
            } else {
                // Cannot reset password for default system users
                http_response_code(403);
                echo json_encode([
                    'message' => 'Cannot reset password for default system users. Default passwords are fixed in the system.'
                ]);
            }
        }
        break;
        
    case '/activities':
        if ($method === 'GET') {
            $activities = loadActivities();
            $userId = $_GET['user_id'] ?? '';
            $date = $_GET['date'] ?? '';
            $type = $_GET['type'] ?? '';
            
            // Filter activities
            if (!empty($userId)) {
                $activities = array_filter($activities, function($activity) use ($userId) {
                    return $activity['user_id'] == $userId;
                });
            }
            
            if (!empty($date)) {
                $activities = array_filter($activities, function($activity) use ($date) {
                    return $activity['date'] === $date;
                });
            }
            
            if (!empty($type)) {
                $activities = array_filter($activities, function($activity) use ($type) {
                    return $activity['type'] === $type;
                });
            }
            
            // Sort by timestamp (newest first)
            usort($activities, function($a, $b) {
                return strtotime($b['timestamp']) - strtotime($a['timestamp']);
            });
            
            echo json_encode(array_values($activities));
            
        } else if ($method === 'POST') {
            // Librarian adding manual activity entry
            $userId = $input['user_id'] ?? '';
            $userEmail = $input['user_email'] ?? '';
            $userName = $input['user_name'] ?? '';
            $activity = $input['activity'] ?? '';
            $details = $input['details'] ?? '';
            $type = $input['type'] ?? 'manual';
            
            if (empty($userId) || empty($activity)) {
                http_response_code(400);
                echo json_encode(['message' => 'User ID and activity are required']);
                break;
            }
            
            $activityRecord = logStudentActivity($userId, $userEmail, $userName, $activity, $type, $details);
            
            echo json_encode([
                'message' => 'Activity logged successfully',
                'activity' => $activityRecord
            ]);
        }
        break;
        
    case '/system-activities':
        if ($method === 'GET') {
            $activities = loadSystemActivities();
            $userId = $_GET['user_id'] ?? '';
            $date = $_GET['date'] ?? '';
            $type = $_GET['type'] ?? '';
            
            // Filter activities
            if (!empty($userId)) {
                $activities = array_filter($activities, function($activity) use ($userId) {
                    return $activity['user_id'] == $userId;
                });
            }
            
            if (!empty($date)) {
                $activities = array_filter($activities, function($activity) use ($date) {
                    return $activity['date'] === $date;
                });
            }
            
            if (!empty($type)) {
                $activities = array_filter($activities, function($activity) use ($type) {
                    return $activity['type'] === $type;
                });
            }
            
            // Sort by timestamp (newest first)
            usort($activities, function($a, $b) {
                return strtotime($b['timestamp']) - strtotime($a['timestamp']);
            });
            
            echo json_encode(array_values($activities));
        }
        break;
        
    case '/librarian-notifications':
        if ($method === 'GET') {
            $notifications = loadLibrarianNotifications();
            $limit = $_GET['limit'] ?? 50;
            $unreadOnly = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
            
            // Filter unread if requested
            if ($unreadOnly) {
                $notifications = array_filter($notifications, function($notification) {
                    return !$notification['is_read'];
                });
            }
            
            // Sort by timestamp (newest first)
            usort($notifications, function($a, $b) {
                return strtotime($b['timestamp']) - strtotime($a['timestamp']);
            });
            
            // Limit results
            $notifications = array_slice($notifications, 0, $limit);
            
            echo json_encode(array_values($notifications));
            
        } else if ($method === 'POST') {
            // Mark notifications as read
            $notificationIds = $input['notification_ids'] ?? [];
            
            if (empty($notificationIds)) {
                http_response_code(400);
                echo json_encode(['message' => 'Notification IDs are required']);
                break;
            }
            
            $notifications = loadLibrarianNotifications();
            $updatedCount = 0;
            
            for ($i = 0; $i < count($notifications); $i++) {
                if (in_array($notifications[$i]['id'], $notificationIds)) {
                    $notifications[$i]['is_read'] = true;
                    $updatedCount++;
                }
            }
            
            saveLibrarianNotifications($notifications);
            
            echo json_encode([
                'message' => 'Notifications marked as read',
                'updated_count' => $updatedCount
            ]);
        }
        break;
        
    case '/student-summary':
        if ($method === 'GET') {
            $userId = $_GET['user_id'] ?? '';
            
            if (empty($userId)) {
                http_response_code(400);
                echo json_encode(['message' => 'User ID is required']);
                break;
            }
            
            $activities = loadActivities();
            $borrows = loadBorrows();
            
            // Filter user activities
            $userActivities = array_filter($activities, function($activity) use ($userId) {
                return $activity['user_id'] == $userId;
            });
            
            // Filter user borrows
            $userBorrows = array_filter($borrows, function($borrow) use ($userId) {
                return $borrow['user_id'] == $userId;
            });
            
            // Calculate statistics
            $totalActivities = count($userActivities);
            $totalBorrows = count($userBorrows);
            $activeBorrows = count(array_filter($userBorrows, function($borrow) {
                return in_array($borrow['status'], ['borrowed', 'overdue']);
            }));
            $overdueBorrows = count(array_filter($userBorrows, function($borrow) {
                return $borrow['status'] === 'overdue';
            }));
            
            // Recent activities (last 10)
            usort($userActivities, function($a, $b) {
                return strtotime($b['timestamp']) - strtotime($a['timestamp']);
            });
            $recentActivities = array_slice($userActivities, 0, 10);
            
            echo json_encode([
                'user_id' => $userId,
                'statistics' => [
                    'total_activities' => $totalActivities,
                    'total_borrows' => $totalBorrows,
                    'active_borrows' => $activeBorrows,
                    'overdue_borrows' => $overdueBorrows
                ],
                'recent_activities' => array_values($recentActivities),
                'all_borrows' => array_values($userBorrows)
            ]);
        }
        break;
        
    case '/penalties':
        if ($method === 'GET') {
            $penalties = loadPenalties();
            $userId = $_GET['user_id'] ?? '';
            $status = $_GET['status'] ?? '';
            
            // Filter penalties
            if (!empty($userId)) {
                $penalties = array_filter($penalties, function($penalty) use ($userId) {
                    return $penalty['user_id'] == $userId;
                });
            }
            
            if (!empty($status)) {
                $penalties = array_filter($penalties, function($penalty) use ($status) {
                    return $penalty['status'] === $status;
                });
            }
            
            // Sort by created date (newest first)
            usort($penalties, function($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });
            
            echo json_encode(array_values($penalties));
            
        } else if ($method === 'POST') {
            // Submit penalty payment request (needs librarian approval)
            $penaltyId = $input['penalty_id'] ?? '';
            $paymentMethod = $input['payment_method'] ?? 'cash';
            $notes = $input['notes'] ?? '';
            $userId = $input['user_id'] ?? '';
            $userEmail = $input['user_email'] ?? '';
            $userName = $input['user_name'] ?? '';
            
            if (empty($penaltyId)) {
                http_response_code(400);
                echo json_encode(['message' => 'Penalty ID is required']);
                break;
            }
            
            $penalties = loadPenalties();
            $penaltyIndex = -1;
            
            for ($i = 0; $i < count($penalties); $i++) {
                if ($penalties[$i]['id'] === $penaltyId) {
                    $penaltyIndex = $i;
                    break;
                }
            }
            
            if ($penaltyIndex === -1) {
                http_response_code(404);
                echo json_encode(['message' => 'Penalty not found']);
                break;
            }
            
            // Check if already pending
            if ($penalties[$penaltyIndex]['status'] === 'payment_pending') {
                http_response_code(400);
                echo json_encode(['message' => 'Payment request already submitted. Waiting for librarian approval.']);
                break;
            }
            
            // Update penalty status to payment_pending
            $penalties[$penaltyIndex]['status'] = 'payment_pending';
            $penalties[$penaltyIndex]['payment_method'] = $paymentMethod;
            $penalties[$penaltyIndex]['payment_requested_at'] = date('Y-m-d H:i:s');
            $penalties[$penaltyIndex]['payment_notes'] = $notes;
            
            savePenalties($penalties);
            
            // Create notification for librarian
            logSystemActivity(
                $penalties[$penaltyIndex]['user_id'],
                $penalties[$penaltyIndex]['user_email'],
                $penalties[$penaltyIndex]['user_name'],
                "🔔 PAYMENT REQUEST: {$penalties[$penaltyIndex]['user_name']} wants to pay penalty",
                'payment_request',
                "Amount: {$penalties[$penaltyIndex]['penalty_amount']} Birr, Method: {$paymentMethod}, Book: {$penalties[$penaltyIndex]['book_title']} - PENDING LIBRARIAN APPROVAL"
            );
            
            // Log student activity
            logStudentActivity(
                $penalties[$penaltyIndex]['user_id'],
                $penalties[$penaltyIndex]['user_email'],
                $penalties[$penaltyIndex]['user_name'],
                "Requested to pay penalty: {$penalties[$penaltyIndex]['penalty_amount']} Birr",
                'payment_request',
                "Penalty ID: {$penaltyId}, Method: {$paymentMethod}, Book: {$penalties[$penaltyIndex]['book_title']}"
            );
            
            echo json_encode([
                'message' => 'Payment request submitted! Waiting for librarian approval.',
                'penalty' => $penalties[$penaltyIndex]
            ]);
        }
        break;
        
    case '/penalties/approve':
        if ($method === 'POST') {
            $penaltyId = $input['penalty_id'] ?? '';
            $action = $input['action'] ?? ''; // 'approve' or 'reject'
            $librarianEmail = $input['librarian_email'] ?? '';
            $librarianName = $input['librarian_name'] ?? 'Librarian';
            
            if (empty($penaltyId) || empty($action)) {
                http_response_code(400);
                echo json_encode(['message' => 'Penalty ID and action are required']);
                break;
            }
            
            $penalties = loadPenalties();
            $penaltyIndex = -1;
            
            for ($i = 0; $i < count($penalties); $i++) {
                if ($penalties[$i]['id'] == $penaltyId) { // Use == instead of ===
                    $penaltyIndex = $i;
                    break;
                }
            }
            
            if ($penaltyIndex === -1) {
                http_response_code(404);
                echo json_encode(['message' => 'Payment request not found']);
                break;
            }
            
            if ($action === 'approve') {
                $penalties[$penaltyIndex]['status'] = 'paid';
                $penalties[$penaltyIndex]['paid_at'] = date('Y-m-d H:i:s');
                $penalties[$penaltyIndex]['payment_approved_by'] = $librarianEmail;
                $penalties[$penaltyIndex]['payment_approved_at'] = date('Y-m-d H:i:s');
                
                savePenalties($penalties);
                
                // Log activity
                logStudentActivity(
                    $penalties[$penaltyIndex]['user_id'],
                    $penalties[$penaltyIndex]['user_email'],
                    $penalties[$penaltyIndex]['user_name'],
                    "Payment APPROVED by {$librarianName}: {$penalties[$penaltyIndex]['penalty_amount']} Birr",
                    'payment_approved',
                    "Penalty cleared, Account reactivated"
                );
                
                echo json_encode([
                    'message' => 'Payment approved successfully',
                    'penalty' => $penalties[$penaltyIndex]
                ]);
            } elseif ($action === 'reject') {
                $penalties[$penaltyIndex]['status'] = 'unpaid'; // Back to unpaid
                $penalties[$penaltyIndex]['payment_rejected_by'] = $librarianEmail;
                $penalties[$penaltyIndex]['payment_rejected_at'] = date('Y-m-d H:i:s');
                
                savePenalties($penalties);
                
                // Log activity
                logStudentActivity(
                    $penalties[$penaltyIndex]['user_id'],
                    $penalties[$penaltyIndex]['user_email'],
                    $penalties[$penaltyIndex]['user_name'],
                    "Payment REJECTED by {$librarianName}",
                    'payment_rejected',
                    "Payment not verified"
                );
                
                echo json_encode([
                    'message' => 'Payment rejected',
                    'penalty' => $penalties[$penaltyIndex]
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['message' => 'Invalid action. Use approve or reject']);
            }
        }
        break;
        
    case '/user-status':
        if ($method === 'GET') {
            $userId = $_GET['user_id'] ?? '';
            
            if (empty($userId)) {
                http_response_code(400);
                echo json_encode(['message' => 'User ID is required']);
                break;
            }
            
            $isSuspended = isUserSuspended($userId);
            $penalties = loadPenalties();
            
            // Get user's unpaid penalties
            $unpaidPenalties = array_filter($penalties, function($penalty) use ($userId) {
                return $penalty['user_id'] == $userId && $penalty['status'] === 'unpaid';
            });
            
            $totalUnpaid = array_sum(array_column($unpaidPenalties, 'penalty_amount'));
            
            echo json_encode([
                'user_id' => $userId,
                'is_suspended' => $isSuspended,
                'unpaid_penalties' => array_values($unpaidPenalties),
                'total_unpaid_amount' => $totalUnpaid,
                'can_borrow' => !$isSuspended
            ]);
        }
        break;
        
    case '/test':
        if ($method === 'GET') {
            echo json_encode([
                'message' => 'API is working!',
                'timestamp' => date('Y-m-d H:i:s'),
                'method' => $method,
                'path' => $path
            ]);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['message' => 'Endpoint not found', 'path' => $path]);
        break;
}
?>