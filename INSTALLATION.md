# 🚀 MWU DIGITAL LIBRARY - Installation & Running Guide

Complete step-by-step instructions to install and run the MWU Digital Library system using CMD.

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ XAMPP installed (Apache + MySQL)
- ✅ PHP 8.2 or higher
- ✅ Node.js 18 or higher
- ✅ Composer installed
- ✅ Git (optional, for cloning)

---

## 📥 STEP 1: Get the Project

### Option A: Clone from GitHub
```cmd
cd C:\xampp3\htdocs
git clone [YOUR_GITHUB_URL] NewLaravel
cd NewLaravel
```

### Option B: Download ZIP
1. Download the project ZIP from GitHub
2. Extract to `C:\xampp3\htdocs\NewLaravel`

---

## 🗄️ STEP 2: Setup Database

### 2.1: Start XAMPP
1. Open XAMPP Control Panel
2. Click "Start" for **Apache**
3. Click "Start" for **MySQL**

### 2.2: Create Database
**Option A - Using phpMyAdmin:**
1. Open browser: `http://localhost/phpmyadmin`
2. Click "SQL" tab
3. Copy and paste this:
```sql
CREATE DATABASE IF NOT EXISTS mwu_library 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```
4. Click "Go"

**Option B - Using CMD:**
```cmd
cd C:\xampp3\htdocs\NewLaravel
mysql -u root -p < CREATE_DATABASE.sql
```
(Press Enter when asked for password - no password)

### 2.3: Create Tables and Insert Data
1. In phpMyAdmin, select `mwu_library` database
2. Click "SQL" tab
3. Open file: `CREATE_DATABASE_TABLES.sql`
4. Copy ALL content and paste in SQL tab
5. Click "Go"

✅ You should see: "Database tables created successfully!"

---

## ⚙️ STEP 3: Install Backend Dependencies

Open CMD and run:

```cmd
cd C:\xampp3\htdocs\NewLaravel
composer install
```

⏳ Wait 2-5 minutes for installation to complete.

---

## 🎨 STEP 4: Install Frontend Dependencies

Open CMD and run:

```cmd
cd C:\xampp3\htdocs\NewLaravel\frontend
npm install
```

⏳ Wait 3-5 minutes for installation to complete.

---

## 🚀 STEP 5: Run the System

### Method 1: Using Batch Files (EASIEST)

**Option A - Start Both at Once:**
1. Navigate to project folder in File Explorer
2. Double-click `START_SYSTEM.bat`
3. Wait 5 seconds
4. Browser will open automatically!

**Option B - Start Separately:**
1. Double-click `START_BACKEND.bat` (starts backend)
2. Double-click `START_FRONTEND.bat` (starts frontend)

---

### Method 2: Using CMD (Manual)

**Step 5.1: Start Backend**

Open CMD Window #1:
```cmd
cd C:\xampp3\htdocs\NewLaravel
php -S localhost:8000 -t public
```

✅ You should see: `PHP 8.2.12 Development Server (http://localhost:8000) started`

**Keep this window open!**

---

**Step 5.2: Start Frontend**

Open NEW CMD Window #2:
```cmd
cd C:\xampp3\htdocs\NewLaravel\frontend
npm run dev
```

✅ You should see: `Local: http://localhost:3000`

**Keep this window open too!**

---

**Step 5.3: Open Browser**

Open your browser and go to:
```
http://localhost:3000
```

---

## 🔑 STEP 6: Login

Use these credentials to login:

### Librarian (Can manage books)
- **Email:** `mulugeta.bekele@mwu.edu.et`
- **Password:** `password123`

### Admin (Full access)
- **Email:** `sisay.tadesse@mwu.edu.et`
- **Password:** `password123`

### Student (Can borrow books)
- **Email:** `hanan.mohammed@student.mwu.edu.et`
- **Password:** `password123`

---

## ✅ Verify Installation

After logging in, you should see:
- ✅ Dashboard with statistics
- ✅ Navigation cards
- ✅ User role badge (STUDENT/LIBRARIAN/ADMIN)

### Test Librarian Features:
1. Login as librarian
2. Click "Book Management"
3. Click "View All Books"
4. You should see Edit & Delete buttons

---

## 🛑 Stop the System

### If using batch files:
- Close the CMD windows that opened

### If using manual CMD:
1. Go to Backend CMD window
2. Press `Ctrl + C`
3. Go to Frontend CMD window
4. Press `Ctrl + C`

---

## 🔧 Troubleshooting

### Problem: "Port 8000 is already in use"
**Solution:**
```cmd
netstat -ano | findstr :8000
taskkill /PID [PID_NUMBER] /F
```

### Problem: "Port 3000 is already in use"
**Solution:** The system will automatically use port 3001

### Problem: "composer: command not found"
**Solution:** Install Composer from https://getcomposer.org/

### Problem: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Problem: Database connection error
**Solution:**
1. Make sure XAMPP MySQL is running
2. Check `.env` file has correct database credentials:
```
DB_DATABASE=mwu_library
DB_USERNAME=root
DB_PASSWORD=
```

### Problem: "vendor/autoload.php not found"
**Solution:**
```cmd
cd C:\xampp3\htdocs\NewLaravel
composer install
```

---

## 📁 Project Structure

```
NewLaravel/
├── app/                  # Laravel backend (Controllers, Models)
├── routes/               # API routes
├── database/             # Migrations, seeders
├── frontend/             # Next.js frontend
├── public/               # Public files
├── .env                  # Environment config
├── START_SYSTEM.bat      # Start both servers
├── START_BACKEND.bat     # Start backend only
└── START_FRONTEND.bat    # Start frontend only
```

---

## 🌐 Access Points

After running the system:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:8000 | API endpoints |
| phpMyAdmin | http://localhost/phpmyadmin | Database management |

---

## 📚 API Endpoints

Base URL: `http://localhost:8000/api.php`

### Authentication
- `POST /login` - User login
- `POST /register` - User registration

### Books
- `GET /books` - Get all books
- `POST /books` - Add new book
- `POST /books/update` - Update book
- `POST /books/delete` - Delete book

### Borrows
- `GET /borrows` - Get all borrows
- `POST /borrows` - Create borrow request
- `POST /borrows/return` - Return book

---

## 🎯 Next Steps

1. ✅ System is running
2. ✅ Login with provided credentials
3. ✅ Explore the dashboard
4. ✅ Test book management (as librarian)
5. ✅ Test borrowing (as student)

---

## 📞 Need Help?

Check these files:
- `README.md` - Main documentation
- `COLLABORATION_GUIDE.md` - Team guide
- `DATABASE_MIGRATION_GUIDE.md` - Database guide

---

## 🎉 Success!

If you can see the login page and login successfully, your installation is complete!

**Welcome to MWU DIGITAL LIBRARY!** 📚

---

**MWU DIGITAL LIBRARY**  
Madda Walabu University  
© 2024 All Rights Reserved
