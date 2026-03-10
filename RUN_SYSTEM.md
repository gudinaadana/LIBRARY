# 🚀 How to Run MWU DIGITAL LIBRARY - Simple CMD Instructions

## ✅ Prerequisites Check
Before running, make sure:
1. XAMPP is running (Apache + MySQL)
2. Database `mwu_library` exists in phpMyAdmin
3. You're in the project folder: `C:\xampp3\htdocs\NewLaravel`

---

## 🎯 EASIEST WAY - Double Click Batch File

1. Open File Explorer
2. Go to: `C:\xampp3\htdocs\NewLaravel`
3. Double-click: `START_SYSTEM.bat`
4. Wait 5 seconds - browser opens automatically!

✅ Done! System is running.

---

## 💻 MANUAL WAY - Using CMD

### Step 1: Start Backend

Open CMD and type:

```cmd
cd C:\xampp3\htdocs\NewLaravel
php -S localhost:8000 -t public
```

✅ You should see: `PHP Development Server started`

**KEEP THIS WINDOW OPEN!**

---

### Step 2: Start Frontend

Open a NEW CMD window and type:

```cmd
cd C:\xampp3\htdocs\NewLaravel\frontend
npm run dev
```

✅ You should see: `Local: http://localhost:3000`

**KEEP THIS WINDOW OPEN TOO!**

---

### Step 3: Open Browser

Open your browser and go to:
```
http://localhost:3000
```

---

## 🔑 Login Credentials

### Librarian (Can edit/delete books):
- Email: `mulugeta.bekele@mwu.edu.et`
- Password: `password123`

### Student (Can borrow books):
- Email: `hanan.mohammed@student.mwu.edu.et`
- Password: `password123`

### Admin (Full access):
- Email: `sisay.tadesse@mwu.edu.et`
- Password: `password123`

---

## 🛑 How to Stop

### If using batch file:
- Close the two CMD windows that opened

### If using manual CMD:
1. Go to Backend CMD window → Press `Ctrl + C`
2. Go to Frontend CMD window → Press `Ctrl + C`

---

## ⚠️ Common Issues

### "Port 8000 already in use"
```cmd
netstat -ano | findstr :8000
taskkill /PID [NUMBER] /F
```

### "Port 3000 already in use"
Don't worry! System will use port 3001 automatically.
Open: `http://localhost:3001`

### "php: command not found"
Add PHP to your PATH or use full path:
```cmd
C:\xampp3\php\php.exe -S localhost:8000 -t public
```

### "npm: command not found"
Install Node.js from: https://nodejs.org/

---

## 📍 Quick Reference

| What | URL |
|------|-----|
| Frontend (Login Page) | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| phpMyAdmin | http://localhost/phpmyadmin |

---

## ✅ Success Check

After running, you should see:
1. ✅ Login page with "MWU DIGITAL LIBRARY" title
2. ✅ Can login with credentials above
3. ✅ Dashboard shows your role (STUDENT/LIBRARIAN/ADMIN)
4. ✅ Librarians can see Edit & Delete buttons on books

---

**That's it! Your system is running!** 🎉

**MWU DIGITAL LIBRARY**  
Madda Walabu University
