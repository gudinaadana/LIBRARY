# 📥 Download and Run MWU DIGITAL LIBRARY from GitHub

## 🌐 GitHub Repository
```
https://github.com/gudinaadana/LIBRARY
```

---

## 🚀 INSTALLATION INSTRUCTIONS FOR NEW USERS

### Step 1: Download the Project

Open CMD and type:

```cmd
cd C:\xampp3\htdocs
git clone https://github.com/gudinaadana/LIBRARY.git
cd LIBRARY
```

**OR** Download ZIP:
1. Go to: https://github.com/gudinaadana/LIBRARY
2. Click green "Code" button → "Download ZIP"
3. Extract to: `C:\xampp3\htdocs\LIBRARY`

---

### Step 2: Setup Database

1. Start XAMPP (Apache + MySQL)
2. Open: http://localhost/phpmyadmin
3. Click "SQL" tab
4. Run this command:

```sql
CREATE DATABASE IF NOT EXISTS mwu_library 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

5. Select `mwu_library` database
6. Click "Import" tab
7. Choose file: `CREATE_DATABASE_TABLES.sql`
8. Click "Go"

---

### Step 3: Install Backend Dependencies

```cmd
cd C:\xampp3\htdocs\LIBRARY
composer install
```

⏳ Wait 2-5 minutes...

---

### Step 4: Install Frontend Dependencies

```cmd
cd C:\xampp3\htdocs\LIBRARY\frontend
npm install
```

⏳ Wait 3-5 minutes...

---

### Step 5: Run the System

**Option A - Easy Way:**
```cmd
cd C:\xampp3\htdocs\LIBRARY
START_SYSTEM.bat
```

**Option B - Manual Way:**

Terminal 1 (Backend):
```cmd
cd C:\xampp3\htdocs\LIBRARY
php -S localhost:8000 -t public
```

Terminal 2 (Frontend):
```cmd
cd C:\xampp3\htdocs\LIBRARY\frontend
npm run dev
```

---

### Step 6: Open Browser

Go to: http://localhost:3000

---

## 🔑 Login Credentials

### Librarian:
- Email: `mulugeta.bekele@mwu.edu.et`
- Password: `password123`

### Student:
- Email: `hanan.mohammed@student.mwu.edu.et`
- Password: `password123`

### Admin:
- Email: `sisay.tadesse@mwu.edu.et`
- Password: `password123`

---

## ✅ Success!

You should see:
- ✅ "MWU DIGITAL LIBRARY" login page
- ✅ Can login with credentials above
- ✅ Dashboard with role badge
- ✅ Librarians can edit/delete books

---

**MWU DIGITAL LIBRARY**  
Madda Walabu University  
© 2024 All Rights Reserved
