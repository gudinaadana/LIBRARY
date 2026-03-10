# 🚀 Deploy MWU DIGITAL LIBRARY to GitHub - CMD Instructions

## 📋 Prerequisites

1. ✅ Git installed on your computer
2. ✅ GitHub account created
3. ✅ You're in project folder: `C:\xampp3\htdocs\NewLaravel`

---

## 🎯 STEP-BY-STEP INSTRUCTIONS

### Step 1: Check if Git is Installed

Open CMD and type:

```cmd
git --version
```

✅ If you see version number (like `git version 2.40.0`), Git is installed.

❌ If not, download from: https://git-scm.com/download/win

---

### Step 2: Go to Your Project Folder

```cmd
cd C:\xampp3\htdocs\NewLaravel
```

---

### Step 3: Initialize Git (if not already done)

```cmd
git init
```

✅ You should see: `Initialized empty Git repository`

---

### Step 4: Configure Git (First Time Only)

Replace with YOUR name and email:

```cmd
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Example:
```cmd
git config --global user.name "Mulugeta Bekele"
git config --global user.email "mulugeta.bekele@mwu.edu.et"
```

---

### Step 5: Add All Files to Git

```cmd
git add .
```

This adds all your files (except those in .gitignore)

---

### Step 6: Commit Your Files

```cmd
git commit -m "Initial commit - MWU Digital Library System"
```

✅ You should see: files changed, insertions

---

### Step 7: Create Repository on GitHub

1. Open browser: https://github.com
2. Click "+" (top right) → "New repository"
3. Repository name: `mwu-digital-library` (or any name you want)
4. Description: `MWU Digital Library Management System`
5. Choose: **Public** or **Private**
6. ❌ DO NOT check "Add README" (we already have one)
7. Click "Create repository"

---

### Step 8: Connect Your Project to GitHub

GitHub will show you commands. Copy the URL that looks like:
```
https://github.com/YOUR-USERNAME/mwu-digital-library.git
```

Then in CMD, type:

```cmd
git remote add origin https://github.com/YOUR-USERNAME/mwu-digital-library.git
```

Replace `YOUR-USERNAME` with your actual GitHub username!

Example:
```cmd
git remote add origin https://github.com/mulugetabekele/mwu-digital-library.git
```

---

### Step 9: Push to GitHub

```cmd
git branch -M main
git push -u origin main
```

⏳ Wait for upload to complete...

✅ You should see: `Branch 'main' set up to track remote branch 'main'`

---

### Step 10: Verify on GitHub

1. Go to: `https://github.com/YOUR-USERNAME/mwu-digital-library`
2. You should see all your files!

---

## 🔄 UPDATE CODE LATER (After Making Changes)

When you make changes and want to update GitHub:

```cmd
cd C:\xampp3\htdocs\NewLaravel
git add .
git commit -m "Description of what you changed"
git push
```

Example:
```cmd
git add .
git commit -m "Added book search feature"
git push
```

---

## 📝 IMPORTANT NOTES

### Files NOT Uploaded (Protected by .gitignore):
- ❌ `/vendor/` - Composer dependencies
- ❌ `/node_modules/` - NPM dependencies
- ❌ `/frontend/.next/` - Next.js build files
- ❌ `.env` - Your database passwords (GOOD!)

### Why?
These files are too large and contain sensitive info. Others will install them using:
- `composer install` (for vendor)
- `npm install` (for node_modules)

---

## 🌐 Share Your Project

After uploading, share this link with others:
```
https://github.com/YOUR-USERNAME/mwu-digital-library
```

They can download it using:
```cmd
git clone https://github.com/YOUR-USERNAME/mwu-digital-library.git
```

---

## ⚠️ Common Issues

### "Permission denied (publickey)"
Use HTTPS URL instead of SSH:
```cmd
git remote set-url origin https://github.com/YOUR-USERNAME/mwu-digital-library.git
```

### "Updates were rejected"
Pull first, then push:
```cmd
git pull origin main --rebase
git push
```

### "Git is not recognized"
Install Git from: https://git-scm.com/download/win
Then restart CMD

### GitHub asks for password
Use Personal Access Token instead:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Use token as password when pushing

---

## ✅ Success!

Your code is now on GitHub! 🎉

**Repository URL:**
```
https://github.com/YOUR-USERNAME/mwu-digital-library
```

Others can now:
- ✅ View your code
- ✅ Clone your project
- ✅ Contribute to development
- ✅ Follow installation instructions from `INSTALLATION.md`

---

**MWU DIGITAL LIBRARY**  
Madda Walabu University  
© 2024 All Rights Reserved
