# MWU DIGITAL LIBRARY

A complete library management system for Madda Walabu University built with **Laravel Backend API** + **Next.js Frontend** architecture, featuring role-based access control, student registration, penalty system, and real-time notifications.

## 🌐 GitHub Repository
```
https://github.com/gudinaadana/LIBRARY
```

## 📥 Quick Start for New Users

```cmd
git clone https://github.com/gudinaadana/LIBRARY.git
cd LIBRARY
composer install
cd frontend && npm install
```

See `INSTALLATION.md` for complete setup instructions.

## 🏗️ Architecture

```
Next.js Frontend (Port 3000)    ←→    Laravel Backend API (Port 8000)    ←→    MySQL Database
     (React/TypeScript)                      (PHP/Laravel)                        (XAMPP)
```

## 🚀 Quick Start

### Method 1 - Using Batch Files (Recommended)

**Step 1: Start Laravel Backend**
```
START_LIBRARY.bat
```

**Step 2: Start Next.js Frontend (in new terminal)**
```
START_FRONTEND.bat
```

**Step 3: Open Browser**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`

### Method 2 - Manual Commands

**Backend (Terminal 1):**
```cmd
cd C:\xampp3\htdocs\NewLaravel
php -S localhost:8000 -t public
```

**Frontend (Terminal 2):**
```cmd
cd C:\xampp3\htdocs\NewLaravel\frontend
npm install
npm run dev
```

## 🧹 Clean Up (Optional)

To remove the old duplicate folder (if permission issues occur, restart your computer first):
```cmd
rmdir /s /q library-system
```

## 👥 User Accounts

### Default Staff:
- **Admin**: `sisay.tadesse@mwu.edu.et` / `password123` (Chaltu Daba Gemechu)
- **Librarian**: `mulugeta.bekele@mwu.edu.et` / `password123` (Tolasa Bekele Hundessa)

### Students:
- **Sample**: `hanan.mohammed@student.mwu.edu.et` / `password123` (Bontu Girma Negassa)
- **New Students**: Can register using the registration form

## 🎯 Features

### 👨‍💼 Administrator:
- User account management
- System access control
- Data security management
- System backup & recovery

### 📚 Librarian:
- Add/update books and categories
- Issue books to members
- Accept returned books
- Real-time notifications for borrowed/overdue books
- Force return overdue books
- **Penalty Management**: Process payments, waive penalties
- **Student Activity Tracking**: Monitor all student activities
- Generate reports
- Overdue book management

### 🎓 Students:
- Search available books (auto-search as you type)
- Borrow books (max 5 books, blocked if suspended)
- **Renew books** (once per book, 14-day extension)
- Return books (disabled for overdue)
- View borrowing history with renewal information
- **Penalty Status**: View outstanding penalties and account status
- Register new accounts

## 💰 Penalty System

### Automatic Penalty Calculation:
- **50 ETB per day** overdue (minimum 200 ETB penalty)
- **Account suspension** until penalties are paid
- **Borrowing blocked** for suspended accounts

### Penalty Management:
- **Students**: View penalty status and payment instructions
- **Librarians**: Process payments, waive penalties, view statistics
- **Automatic logging**: All penalty activities tracked

### Payment Process:
1. Student visits library in person
2. Librarian processes payment in system
3. Account automatically reactivated
4. Student can resume borrowing

## 📊 Activity Tracking

### Automatic Tracking:
- Student registration
- Login activities
- Book borrowing
- Book returns
- Penalty creation and payments

### Manual Logging (Librarians):
- Library orientation sessions
- Special interactions
- Issues or concerns
- Custom activities

## 📁 Project Structure

### Laravel Backend (`/`)
```
app/
├── Http/Controllers/
│   ├── AuthController.php
│   ├── BookController.php
│   ├── CategoryController.php
│   └── BorrowController.php
├── Models/
│   ├── User.php
│   ├── Book.php
│   ├── Category.php
│   └── Borrow.php
database/
├── migrations/
└── seeders/
routes/
├── api.php
└── web.php
public/
├── api.php (Main API handler)
├── student_penalties.json (Penalty data)
├── student_activities.json (Activity logs)
└── librarian_notifications.json (Notifications)
```

### Next.js Frontend (`/frontend`)
```
app/
├── page.tsx (Login/Register)
├── dashboard/
│   └── page.tsx (Role-based Dashboard with Penalty UI)
├── layout.tsx
└── globals.css
lib/
└── api.ts (Axios configuration)
```

## 🔗 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - Student registration
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Books
- `GET /api/books` - Get all books (with search/filter)
- `POST /api/books` - Create book (Librarian/Admin)
- `PUT /api/books/{id}` - Update book (Librarian/Admin)
- `DELETE /api/books/{id}` - Delete book (Librarian/Admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Librarian/Admin)

### Borrows
- `GET /api/borrows` - Get all borrows
- `POST /api/borrows` - Borrow book (checks suspension status)
- `POST /api/return` - Return book (creates penalty if overdue)
- `POST /api/renew` - Renew book (extends due date by 14 days)
- `GET /api/notifications` - Get borrow notifications

### Penalties (NEW)
- `GET /api/penalties` - Get penalties (filter by user/status)
- `POST /api/penalties` - Process penalty payment
- `GET /api/user-status` - Check user suspension status

### Activities (NEW)
- `GET /api/activities` - Get student activities (filter by user/date)
- `POST /api/activities` - Log manual activity (Librarian)
- `GET /api/librarian-notifications` - Get activity notifications

## 🧪 API Testing with Postman

1. Import the collection: `postman/MWU_Library_API.postman_collection.json`
2. Set environment variables:
   - `base_url`: `http://localhost:8000`
   - `auth_token`: (will be set after login)
3. Test authentication endpoints first
4. Use the token for protected endpoints

## 🔔 Real-time Notifications

### Librarians see:
- **Library Activities**: New borrows, overdue books
- **Student Activities**: Registration, login, manual entries
- **Auto-refresh**: Every 30 seconds
- **Priority indicators**: High priority for overdue items

### Students see:
- **Account status**: Active/Suspended
- **Penalty information**: Outstanding amounts
- **Borrowing restrictions**: Clear suspension messages

## ⚠️ Overdue & Penalty Management

### Student Experience:
- **Cannot borrow** if account suspended
- **Cannot return overdue books** without librarian
- **Clear penalty information** with payment instructions
- **Account status dashboard** showing all penalties

### Librarian Tools:
- **Force return** overdue books (creates penalty)
- **Process payments** (cash/check/card)
- **Waive penalties** when appropriate
- **Penalty statistics** and reporting
- **Account reactivation** after payment

## 🛠️ Technology Stack

### Backend:
- **Laravel 10** - PHP Framework
- **Laravel Sanctum** - API Authentication
- **MySQL** - Database (via XAMPP)
- **PHP 8.1+** - Programming Language
- **JSON File Storage** - For rapid development

### Frontend:
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client

### Development Tools:
- **Postman** - API Testing
- **XAMPP** - Local Development Environment

## 📊 Database Schema

### Tables:
- `users` - Admin, Librarian, Student accounts
- `categories` - Book categories
- `books` - Book information with availability
- `borrows` - Borrowing records with status tracking
- `personal_access_tokens` - API authentication tokens

### JSON Data Files:
- `student_penalties.json` - Penalty records
- `student_activities.json` - Activity logs
- `librarian_notifications.json` - Notification queue
- `registered_users.json` - Student registrations
- `borrowed_books.json` - Borrow records

## 🎓 Ready to Use!

Your MWU Online Library Management System is complete with:
- ✅ **Penalty System** with automatic calculation and account suspension
- ✅ **Activity Tracking** for comprehensive student monitoring
- ✅ **Real-time Notifications** for librarians
- ✅ **Account Management** with suspension/reactivation workflow
- ✅ **Auto-search** functionality for books
- ✅ **Role-based Access Control** with proper authentication
- ✅ **Production-ready** Laravel + Next.js architecture

The system now handles the complete library workflow including penalty management and student account suspension as requested!