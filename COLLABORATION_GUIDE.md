# MWU Library Management System - Collaboration Guide

## 🚀 Quick Start for Collaborators

### Prerequisites
- PHP 8.0+
- Node.js 18+
- MySQL (via XAMPP)
- Git

### Setup Instructions

1. **Clone the Repository**
```bash
git clone <repository-url>
cd NewLaravel
```

2. **Backend Setup**
```bash
# Install PHP dependencies
composer install

# Copy environment file
copy .env.example .env

# Configure database in .env
DB_DATABASE=mwu_library
DB_USERNAME=root
DB_PASSWORD=

# Start backend server
php -S localhost:8000 -t public
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Access System**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Default Credentials
- **Admin:** sisay.tadesse@mwu.edu.et / admin123
- **Librarian:** abebe.kebede@mwu.edu.et / librarian123
- **Student:** Register new account

---

## 📁 Project Structure

```
NewLaravel/
├── app/                    # Laravel backend
│   ├── Http/Controllers/   # API controllers
│   └── Models/            # Data models
├── public/                # Backend entry point
│   ├── api.php           # Main API file
│   └── *.json            # Data storage files
├── frontend/             # Next.js frontend
│   ├── app/             # Pages
│   └── lib/             # API configuration
├── database/            # Migrations
└── START_SYSTEM.bat     # Quick start script
```

---

## 🔧 Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes

### Making Changes

1. **Create a branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
```bash
# Edit files
# Test locally
```

3. **Commit changes**
```bash
git add .
git commit -m "Description of changes"
```

4. **Push to repository**
```bash
git push origin feature/your-feature-name
```

5. **Create Pull Request**
- Go to GitHub
- Create PR from your branch to `develop`
- Request review

---

## 🧪 Testing

### Backend Testing
```bash
# Test API endpoints
php -S localhost:8000 -t public
# Use Postman collection in /postman folder
```

### Frontend Testing
```bash
cd frontend
npm run dev
# Test in browser at localhost:3000
```

---

## 📝 Coding Standards

### PHP (Backend)
- Follow PSR-12 coding standard
- Use meaningful variable names
- Add comments for complex logic
- Validate all inputs

### TypeScript/React (Frontend)
- Use functional components
- Follow React hooks best practices
- Use TypeScript types
- Keep components small and focused

---

## 🐛 Reporting Issues

### Bug Reports
Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/environment details

### Feature Requests
Include:
- Clear description
- Use case
- Expected outcome
- Priority level

---

## 📚 Key Features

### Admin
- User approval system
- User management
- System logs
- Reports viewing

### Librarian
- Book management (add/update/delete)
- Borrow request approval
- Return request approval
- Payment verification
- Report generation

### Student
- Book browsing and search
- Borrow requests
- Return requests
- Penalty payments
- Request status tracking

---

## 🔐 Security Notes

### Current Implementation
- ⚠️ Passwords stored in plain text (needs hashing)
- File-based JSON storage
- Basic token authentication

### Recommended Improvements
1. Implement password hashing
2. Migrate to MySQL database
3. Add JWT authentication
4. Implement HTTPS
5. Add rate limiting

---

## 🤝 Collaboration Tools

### Recommended
- **Version Control:** GitHub
- **Communication:** Slack/Discord
- **Project Management:** Trello/Jira
- **Code Review:** GitHub Pull Requests
- **Documentation:** GitHub Wiki

---

## 📞 Contact

For questions or support:
- Create an issue on GitHub
- Contact project maintainer
- Check documentation

---

## 📄 License

[Specify your license here]

---

## 🙏 Contributors

- [Your Name] - Initial development
- [Add contributors as they join]

---

**Happy Coding! 🚀**
