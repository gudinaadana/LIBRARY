'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '../lib/api'

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false)
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    // Small delay to ensure localStorage is properly cleared after logout
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      // Only redirect if BOTH token and user data exist and are valid
      if (token && userData) {
        try {
          // Verify the user data is valid JSON
          const user = JSON.parse(userData)
          if (user && user.id && user.email) {
            // User is logged in, redirect to dashboard
            router.push('/dashboard')
          }
        } catch (e) {
          // Invalid user data, clear it
          localStorage.clear()
        }
      }
    }
    
    // Run check after a small delay
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router])

  if (showLogin) {
    return <LoginSection onBack={() => setShowLogin(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">📚</span>
              </div>
              <span className="text-white font-bold text-xl">MWU Library</span>
            </div>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-white text-blue-900 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all"
            >
              Login / Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Madda Walabu University
            </span>
            DIGITAL LIBRARY
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Access thousands of books, manage your borrowings, and explore our digital collection - all in one place
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              Get Started →
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">10,000+</div>
            <div className="text-gray-300">Books Available</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">5,000+</div>
            <div className="text-gray-300">Active Students</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
            <div className="text-gray-300">Online Access</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
            <div className="text-gray-300">Categories</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white/5 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Powerful Features for Everyone
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-all">
              <div className="text-5xl mb-4">📖</div>
              <h3 className="text-2xl font-bold text-white mb-3">Browse Books</h3>
              <p className="text-gray-300">
                Search and explore our extensive collection of books across multiple categories and subjects
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-all">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-2xl font-bold text-white mb-3">Easy Borrowing</h3>
              <p className="text-gray-300">
                Borrow books online and manage your borrowings with automatic reminders and renewals
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-all">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-3">Track History</h3>
              <p className="text-gray-300">
                View your borrowing history, track due dates, and manage your library account efficiently
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-pink-500/20 to-red-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-all">
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="text-2xl font-bold text-white mb-3">Notifications</h3>
              <p className="text-gray-300">
                Get instant notifications for due dates, new arrivals, and important library updates
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-all">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-white mb-3">User Management</h3>
              <p className="text-gray-300">
                Admins and librarians can efficiently manage users, books, and system operations
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-all">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-2xl font-bold text-white mb-3">Reports & Analytics</h3>
              <p className="text-gray-300">
                Generate comprehensive reports and gain insights into library usage and trends
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Roles Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Who Can Use Our System?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-5xl mb-4 text-center">🎓</div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Students</h3>
              <ul className="text-gray-300 space-y-2">
                <li>✓ Browse and search books</li>
                <li>✓ Borrow and return books</li>
                <li>✓ View borrowing history</li>
                <li>✓ Receive notifications</li>
                <li>✓ Manage your profile</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-5xl mb-4 text-center">📚</div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Librarians</h3>
              <ul className="text-gray-300 space-y-2">
                <li>✓ Manage book inventory</li>
                <li>✓ Process borrowing requests</li>
                <li>✓ Generate reports</li>
                <li>✓ Track overdue books</li>
                <li>✓ Notify students</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-5xl mb-4 text-center">⚙️</div>
              <h3 className="text-2xl font-bold text-white mb-3 text-center">Administrators</h3>
              <ul className="text-gray-300 space-y-2">
                <li>✓ Manage all users</li>
                <li>✓ System configuration</li>
                <li>✓ View analytics</li>
                <li>✓ Access control</li>
                <li>✓ System backup</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of students already using our library system
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="bg-white text-orange-600 px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            Login or Register Now →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>© 2024 Madda Walabu University. All rights reserved.</p>
          <p className="mt-2">DIGITAL LIBRARY</p>
        </div>
      </footer>
    </div>
  )
}

// Login Section Component
function LoginSection({ onBack }: { onBack: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    name: '',
    student_id: '',
    phone: '',
    confirm_password: ''
  })
  const [alert, setAlert] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({ ...prev, role }))
    
    switch(role) {
      case 'admin':
        setFormData(prev => ({
          ...prev,
          email: 'sisay.tadesse@mwu.edu.et',
          password: 'password123'
        }))
        break
      case 'librarian':
        setFormData(prev => ({
          ...prev,
          email: 'mulugeta.bekele@mwu.edu.et',
          password: 'password123'
        }))
        break
      case 'student':
        setFormData(prev => ({
          ...prev,
          email: 'hanan.mohammed@student.mwu.edu.et',
          password: 'password123'
        }))
        break
      default:
        setFormData(prev => ({
          ...prev,
          email: '',
          password: ''
        }))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await api.post('/login', {
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      setAlert({ type: 'success', message: `Welcome ${response.data.user.name}! Redirecting...` })
      
      setTimeout(() => {
        // Replace history to prevent back button
        router.replace('/dashboard')
      }, 2000)
      
    } catch (error: any) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirm_password) {
      setAlert({ type: 'error', message: 'Passwords do not match!' })
      return
    }

    if (!formData.email.includes('@student.mwu.edu.et') && !formData.email.includes('@mwu.edu.et')) {
      setAlert({ type: 'error', message: 'Please use your MWU email address (@student.mwu.edu.et)' })
      return
    }
    
    setLoading(true)
    
    try {
      const response = await api.post('/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        student_id: formData.student_id,
        phone: formData.phone
      })
      
      setAlert({ 
        type: 'success', 
        message: `Registration successful! Welcome ${response.data.user.name}. You can now login.` 
      })
      
      setFormData({
        email: formData.email,
        password: '',
        role: 'student',
        name: '',
        student_id: '',
        phone: '',
        confirm_password: ''
      })
      
      setTimeout(() => {
        setIsLogin(true)
      }, 3000)
      
    } catch (error: any) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <button
          onClick={onBack}
          className="mb-4 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Back to Home
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Madda Walabu University</h1>
          <h2 className="text-xl text-blue-600 mb-6">DIGITAL LIBRARY</h2>
        </div>

        {alert.message && (
          <div className={`p-3 rounded-lg mb-6 ${
            alert.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {alert.message}
          </div>
        )}

        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-l-lg font-medium ${
              isLogin 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-r-lg font-medium ${
              !isLogin 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Register New Student
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.name@student.mwu.edu.et"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={formData.student_id}
                onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                placeholder="Enter your student ID"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Create a password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                placeholder="Confirm your password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register as Student'}
            </button>
          </form>
        )}


      </div>
    </div>
  )
}
