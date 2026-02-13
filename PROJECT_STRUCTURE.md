# MWU Library System - Project Structure

## 📁 BACKEND (PHP/Laravel)
The backend files are in the ROOT directory:

### Core Backend Files:
- `public/api.php` - Main API endpoint (handles login, register, books, etc.)
- `public/*.json` - Data storage files (users, books, borrows, etc.)

### Laravel Structure:
- `app/` - Application code
  - `app/Http/Controllers/` - API Controllers
  - `app/Models/` - Data Models
- `config/` - Configuration files
- `database/` - Database migrations and seeders
- `routes/` - API routes
- `bootstrap/` - Laravel bootstrap
- `vendor/` - PHP dependencies
- `composer.json` - PHP package manager
- `.env` - Environment configuration

### Backend Commands:
```cmd
php -S localhost:8000 -t public
```

---

## 📁 FRONTEND (Next.js/React)
All frontend files are in the `frontend/` folder:

### Frontend Structure:
- `frontend/app/` - Next.js pages
  - `frontend/app/page.tsx` - Homepage
  - `frontend/app/dashboard/page.tsx` - Dashboard
- `frontend/lib/` - Utilities
  - `frontend/lib/api.ts` - API configuration
- `frontend/node_modules/` - Node dependencies
- `frontend/package.json` - Node package manager

### Frontend Commands:
```cmd
cd frontend
npm run dev
```

---

## 🚀 Quick Start

### Option 1: Use Batch Files
```cmd
START_LIBRARY.bat
```

### Option 2: Manual Start
**Terminal 1 (Backend):**
```cmd
php -S localhost:8000 -t public
```

**Terminal 2 (Frontend):**
```cmd
cd frontend
npm run dev
```

---

## 🌐 Access Points
- **Homepage:** http://localhost:3000
- **Backend API:** http://localhost:8000/api.php
- **Dashboard:** http://localhost:3000/dashboard

---

## 📊 Data Storage
All data is stored in JSON files in the `public/` folder:
- `registered_users.json` - User accounts
- `books_storage.json` - Book inventory
- `borrowed_books.json` - Borrowing records
- `student_activities.json` - Student activity logs
- `system_activities.json` - System logs
- `librarian_notifications.json` - Notifications
- `student_penalties.json` - Penalty records
