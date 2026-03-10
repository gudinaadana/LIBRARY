'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../lib/api'

interface User {
  id: number
  name: string
  email: string
  role: string
  student_id?: string
  phone?: string
  registered_at?: string
  status?: string
  approved_by?: string
  approved_at?: string
}

interface Book {
  id: number
  title: string
  author: string
  isbn: string
  category: { name: string }
  quantity: number
  available_quantity: number
  description?: string
}

interface Borrow {
  id: number
  user_id: number
  book_id: number
  user_email: string
  user_name?: string
  book_title: string
  borrowed_at: string
  due_date: string
  returned_at?: string
  status: string
  is_overdue?: boolean
  requested_at?: string
  approved_by?: string
  approved_at?: string
  return_requested_at?: string
  return_approved_at?: string
  return_approved_by?: string
  return_rejected_at?: string
  overdue_days?: number
  penalty_amount?: number
  penalty_id?: string
}

interface SearchFilters {
  search: string
  searchType: 'title' | 'author' | 'isbn' | 'all'
  category: string
  availableOnly: boolean
}

interface Activity {
  id: string
  user_id: number
  user_email: string
  user_name: string
  activity: string
  type: string
  details: string
  timestamp: string
  date: string
  time: string
}

interface LibrarianNotification {
  id: string
  activity_id: string
  user_id: number
  user_email: string
  user_name: string
  message: string
  type: string
  details: string
  timestamp: string
  is_read: boolean
  priority: string
}

interface Penalty {
  id: string
  user_id: number
  user_email: string
  user_name: string
  borrow_id: string
  book_title: string
  overdue_days: number
  penalty_amount: number
  status: 'unpaid' | 'paid' | 'waived' | 'payment_pending'
  created_at: string
  paid_at?: string
  payment_method?: string
  notes: string
  payment_requested_at?: string
  payment_approved_at?: string
  payment_approved_by?: string
  payment_rejected_at?: string
}

interface UserStatus {
  user_id: number
  is_suspended: boolean
  unpaid_penalties: Penalty[]
  total_unpaid_amount: number
  can_borrow: boolean
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [borrows, setBorrows] = useState<Borrow[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [activeView, setActiveView] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: '',
    searchType: 'all',
    category: '',
    availableOnly: true
  })
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [systemActivities, setSystemActivities] = useState<Activity[]>([])
  const [librarianNotifications, setLibrarianNotifications] = useState<LibrarianNotification[]>([])
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const [penalties, setPenalties] = useState<Penalty[]>([])
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [showAddBookForm, setShowAddBookForm] = useState(false)
  const [showUpdateBookForm, setShowUpdateBookForm] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [showEditUserForm, setShowEditUserForm] = useState(false)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/')
      return
    }
    
    setUser(JSON.parse(userData))
    setupAxiosInterceptors(token)
    loadInitialData()
    
    // Load notifications for librarians
    if (JSON.parse(userData).role === 'librarian') {
      loadNotifications()
      loadLibrarianNotifications()
      loadActivities()
      loadSystemActivities()
      const interval = setInterval(() => {
        loadNotifications()
        loadLibrarianNotifications()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [])

  // Auto-search when search filters change
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (activeView === 'available-books') {
        performAutoSearch()
      }
    }, 300) // 300ms delay for better performance

    return () => clearTimeout(delayedSearch)
  }, [searchFilters.search, searchFilters.category, searchFilters.availableOnly, activeView])

  // Auto-scroll to content when activeView changes
  useEffect(() => {
    if (activeView !== 'overview' && contentRef.current) {
      // Delay to ensure content is fully rendered
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
        // Also scroll window to top of content
        window.scrollTo({
          top: contentRef.current?.offsetTop ? contentRef.current.offsetTop - 100 : 0,
          behavior: 'smooth'
        })
      }, 200)
    }
  }, [activeView])

  const setupAxiosInterceptors = (token: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/')
        }
        return Promise.reject(error)
      }
    )
  }

  const loadInitialData = async () => {
    try {
      const [booksRes, borrowsRes] = await Promise.all([
        api.get('/books'),
        api.get('/borrows')
      ])
      
      setBooks(booksRes.data.data || [])
      setBorrows(borrowsRes.data.data || borrowsRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    try {
      const response = await api.get('/borrows/notifications')
      setNotifications(response.data)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const loadLibrarianNotifications = async () => {
    try {
      const response = await api.get('/librarian-notifications')
      setLibrarianNotifications(response.data)
    } catch (error) {
      console.error('Error loading librarian notifications:', error)
    }
  }

  const loadSystemActivities = async (userId?: number, date?: string) => {
    try {
      let url = '/system-activities'
      const params = new URLSearchParams()
      
      if (userId) params.append('user_id', userId.toString())
      if (date) params.append('date', date)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await api.get(url)
      setSystemActivities(response.data)
    } catch (error) {
      console.error('Error loading system activities:', error)
    }
  }

  const loadActivities = async (userId?: number, date?: string) => {
    try {
      let url = '/activities'
      const params = new URLSearchParams()
      
      if (userId) params.append('user_id', userId.toString())
      if (date) params.append('date', date)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await api.get(url)
      setActivities(response.data)
    } catch (error) {
      console.error('Error loading activities:', error)
    }
  }

  const addStudentActivity = async (userId: number, userEmail: string, userName: string, activity: string, details: string = '') => {
    try {
      await api.post('/activities', {
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        activity: activity,
        details: details,
        type: 'manual'
      })
      
      alert('✅ Activity logged successfully!')
      loadActivities()
      loadLibrarianNotifications()
    } catch (error: any) {
      alert(`❌ ${error.response?.data?.message || 'Error logging activity'}`)
    }
  }

  const loadPenalties = async (userId?: number, status?: string) => {
    try {
      let url = '/penalties'
      const params = new URLSearchParams()
      
      if (userId) params.append('user_id', userId.toString())
      if (status) params.append('status', status)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await api.get(url)
      setPenalties(response.data)
    } catch (error) {
      console.error('Error loading penalties:', error)
    }
  }

  const loadUserStatus = async (userId: number) => {
    try {
      const response = await api.get(`/user-status?user_id=${userId}`)
      setUserStatus(response.data)
    } catch (error) {
      console.error('Error loading user status:', error)
    }
  }

  const loadAllUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await api.get('/users')
      setAllUsers(response.data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const processPenaltyPayment = async (penaltyId: string, paymentMethod: string = 'cash', notes: string = '') => {
    try {
      await api.post('/penalties', {
        penalty_id: penaltyId,
        payment_method: paymentMethod,
        notes: notes
      })
      
      alert('✅ Payment request submitted! Waiting for librarian verification.\n\nCheck "My Requests Status" to track your payment.')
      loadPenalties()
      loadLibrarianNotifications()
      if (userStatus) {
        loadUserStatus(userStatus.user_id)
      }
    } catch (error: any) {
      alert(`❌ ${error.response?.data?.message || 'Error processing payment'}`)
    }
  }

  const loadAvailableBooks = async (filters?: SearchFilters) => {
    try {
      let url = '/books'
      const params = new URLSearchParams()
      
      if (filters?.search) {
        params.append('search', filters.search)
        if (filters.searchType !== 'all') {
          params.append('search_type', filters.searchType)
        }
      }
      
      if (filters?.category) {
        params.append('category_id', filters.category)
      }
      
      if (filters?.availableOnly) {
        params.append('available_only', 'true')
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await api.get(url)
      const bookData = response.data.data || response.data || []
      setBooks(bookData)
      setSearchResults(bookData)
    } catch (error) {
      console.error('Error loading books:', error)
    }
  }

  const performAutoSearch = async () => {
    await loadAvailableBooks(searchFilters)
  }

  const handleSearch = () => {
    loadAvailableBooks(searchFilters)
  }

  const clearSearch = () => {
    setSearchFilters({
      search: '',
      searchType: 'all',
      category: '',
      availableOnly: true
    })
    loadInitialData()
  }

  const handleBorrowBook = async (bookId: number) => {
    if (!user) {
      alert('Please login first')
      return
    }
    
    try {
      console.log('Borrowing book:', { user_id: user.id, book_id: bookId })
      
      const response = await api.post('/borrows', {
        user_id: user.id,
        book_id: bookId
      })
      
      console.log('Borrow response:', response.data)
      alert('✅ Borrow request submitted! Waiting for librarian approval.\n\nCheck "My Requests Status" to track your request.')
      
      // Reload data to show updated availability and borrowed books
      await loadInitialData()
      
    } catch (error: any) {
      console.error('Borrow error:', error)
      
      if (error.response?.data?.suspended) {
        alert(`🚫 Account Suspended!\n\n${error.response.data.message}\n\nPlease contact the librarian to pay your outstanding penalties.`)
        // Load user status to show penalties
        if (user.id) {
          loadUserStatus(user.id)
          setActiveView('my-penalties')
        }
      } else {
        alert(`❌ ${error.response?.data?.message || 'Error borrowing book'}`)
      }
    }
  }

  const handleAddBook = async (bookData: any) => {
    try {
      // Add librarian information to the book data
      const bookDataWithUser = {
        ...bookData,
        librarian_id: user?.id,
        librarian_email: user?.email,
        librarian_name: user?.name
      }
      
      await api.post('/books', bookDataWithUser)
      alert('✅ Book added successfully!')
      setShowAddBookForm(false)
      // Refresh both books and initial data
      await loadInitialData()
      await loadAvailableBooks()
    } catch (error: any) {
      alert(`❌ ${error.response?.data?.message || 'Error adding book'}`)
    }
  }

  const handleUpdateBook = async (bookData: any) => {
    try {
      // Add librarian information to the book data
      const bookDataWithUser = {
        ...bookData,
        librarian_id: user?.id,
        librarian_email: user?.email,
        librarian_name: user?.name
      }
      
      await api.post('/books/update', bookDataWithUser)
      alert('✅ Book updated successfully!')
      setShowUpdateBookForm(false)
      setSelectedBook(null)
      // Refresh both books and initial data
      await loadInitialData()
      await loadAvailableBooks()
    } catch (error: any) {
      alert(`❌ ${error.response?.data?.message || 'Error updating book'}`)
    }
  }

  const handleDeleteBook = async (bookId: number, bookTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"?\n\nThis action cannot be undone.`)) {
      return
    }
    
    try {
      await api.post('/books/delete', {
        book_id: bookId,
        librarian_id: user?.id,
        librarian_email: user?.email,
        librarian_name: user?.name
      })
      
      alert('✅ Book deleted successfully!')
      // Refresh both books and initial data
      await loadInitialData()
      await loadAvailableBooks()
    } catch (error: any) {
      alert(`❌ ${error.response?.data?.message || 'Error deleting book'}`)
    }
  }

  const handleRenewBook = async (borrowId: number) => {
    if (!user) {
      alert('Please login first')
      return
    }
    
    if (!confirm('Renew this book for another 14 days?')) {
      return
    }
    
    try {
      const response = await api.post('/renew', {
        borrow_id: borrowId,
        user_id: user.id
      })
      
      alert(`✅ Book renewed successfully!\n\nNew due date: ${new Date(response.data.new_due_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}`)
      
      // Reload data to show updated due dates
      await loadInitialData()
      
    } catch (error: any) {
      if (error.response?.data?.suspended) {
        alert(`🚫 Account Suspended!\n\n${error.response.data.message}`)
      } else {
        alert(`❌ ${error.response?.data?.message || 'Error renewing book'}`)
      }
    }
  }

  const handleReturnBook = async (borrowId: number) => {
    try {
      const response = await api.post('/borrows/return', {
        borrow_id: borrowId
      })
      
      if (response.data.penalty) {
        alert(`📚 Book returned with penalty!\n\nOverdue: ${response.data.overdue_days} days\nPenalty: $${response.data.penalty_amount}\n\nYour account is now suspended until penalty is paid.`)
        
        // Reload data and show penalties
        await loadInitialData()
        if (user?.id) {
          loadUserStatus(user.id)
          setActiveView('my-penalties')
        }
      } else {
        alert('✅ Return request submitted! Waiting for librarian approval.\n\nCheck "My Requests Status" to track your request.')
        await loadInitialData()
      }
      
    } catch (error: any) {
      if (error.response?.data?.is_overdue) {
        alert('⚠️ This book is overdue! Please contact the librarian to process the return.')
      } else {
        alert(`❌ ${error.response?.data?.message || 'Error returning book'}`)
      }
    }
  }

  const handleForceReturn = async (borrowId: number) => {
    if (!confirm('Force return this overdue book?')) return
    
    try {
      await api.post('/borrows/force-return', {
        borrow_id: borrowId
      })
      
      alert('Book force returned successfully!')
      loadInitialData()
      loadNotifications()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error force returning book')
    }
  }

  const logout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // Clear all localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.clear() // Clear everything to be safe
      
      // Clear session storage too
      sessionStorage.clear()
      
      // Use replace instead of push to prevent back button issues
      router.replace('/')
      
      // Force reload to clear any cached state
      window.location.href = '/'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  const userBorrows = borrows.filter(borrow => 
    borrow.user_id == user.id && ['borrowed', 'overdue'].includes(borrow.status)
  )

  const availableBooks = books.filter(book => book.available_quantity > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="gradient-bg text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-light">📚 MWU DIGITAL LIBRARY</h1>
          <div className="flex items-center space-x-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {user.role.toUpperCase()}
            </span>
            <span>Welcome, {user.name}!</span>
            <button
              onClick={logout}
              className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{books.length}</div>
            <div className="text-gray-600">Total Books</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{availableBooks.length}</div>
            <div className="text-gray-600">Available Books</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {borrows.filter(b => ['borrowed', 'overdue'].includes(b.status)).length}
            </div>
            <div className="text-gray-600">Borrowed Books</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              {user.role === 'student' ? userBorrows.length : borrows.filter(b => b.status === 'overdue').length}
            </div>
            <div className="text-gray-600">
              {user.role === 'student' ? 'Your Active Loans' : 'Overdue Books'}
            </div>
          </div>
        </div>

        {/* Librarian Notifications */}
        {user.role === 'librarian' && (
          <div className="bg-gradient-to-r from-yellow-50 to-white p-6 rounded-xl shadow-sm mb-8 border-l-4 border-yellow-400">
            <h3 className="text-lg font-semibold mb-4">🔔 System Activities & Student Notifications</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Real-time Library Notifications */}
              <div>
                <h4 className="font-medium mb-2">📚 Library Activities</h4>
                <div className="max-h-48 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-green-600">✅ No pending library notifications</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.slice(0, 5).map((notification, index) => {
                        const alertClass = notification.is_overdue ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-400'
                        const icon = notification.is_overdue ? '⚠️' : '📚'
                        
                        return (
                          <div key={index} className={`p-2 rounded border-l-4 ${alertClass}`}>
                            <div className="text-sm font-medium">{icon} {notification.type.toUpperCase()}</div>
                            <div className="text-xs text-gray-600">{notification.message}</div>
                            <div className="text-xs text-gray-500">
                              {notification.user_email} | {formatDate(notification.borrowed_at)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Student Activity Notifications */}
              <div>
                <h4 className="font-medium mb-2">👥 Student Activities</h4>
                <div className="max-h-48 overflow-y-auto">
                  {librarianNotifications.filter(n => ['register', 'login', 'borrow', 'return', 'manual', 'overdue', 'penalty', 'payment'].includes(n.type)).length === 0 ? (
                    <p className="text-gray-500">No recent student activities</p>
                  ) : (
                    <div className="space-y-2">
                      {librarianNotifications.filter(n => ['register', 'login', 'borrow', 'return', 'manual', 'overdue', 'penalty', 'payment'].includes(n.type)).slice(0, 5).map((notification, index) => {
                        const priorityColor = notification.priority === 'high' ? 'border-red-400 bg-red-50' : 'border-blue-400 bg-blue-50'
                        const typeIcons = {
                          'register': '👤',
                          'login': '🔐',
                          'borrow': '📚',
                          'return': '📤',
                          'manual': '📝',
                          'overdue': '⚠️',
                          'penalty': '💰',
                          'payment': '💳'
                        }
                        
                        return (
                          <div key={index} className={`p-2 rounded border-l-4 ${priorityColor}`}>
                            <div className="text-sm font-medium">
                              {typeIcons[notification.type as keyof typeof typeIcons] || '📋'} {notification.message}
                            </div>
                            <div className="text-xs text-gray-500">
                              {notification.user_name} | {formatDate(notification.timestamp)}
                            </div>
                            {!notification.is_read && (
                              <div className="text-xs text-blue-600 font-medium">● New</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => setActiveView('student-activities')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                View Student Activities
              </button>
              <button 
                onClick={() => {
                  setActiveView('manage-penalties')
                  loadPenalties()
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Manage Penalties
              </button>
            </div>
          </div>
        )}

        {/* Student Account Status Alert */}
        {user.role === 'student' && (
          <div className="bg-red-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-red-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-800">💰 Account Status</h3>
                <p className="text-sm text-red-600">Check your penalty status and account standing</p>
              </div>
              <button
                onClick={() => {
                  setActiveView('my-penalties')
                  if (user.id) loadUserStatus(user.id)
                }}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                🚨 Check My Penalties & Status
              </button>
            </div>
          </div>
        )}

        {/* Student Request Status Notifications */}
        {user.role === 'student' && (
          <>
            {/* Pending Borrow Requests */}
            {borrows.filter(b => b.user_id === user.id && b.status === 'pending').length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-yellow-500">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⏳</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-800">Pending Borrow Requests</h3>
                    <p className="text-sm text-yellow-600">
                      You have {borrows.filter(b => b.user_id === user.id && b.status === 'pending').length} borrow request(s) waiting for librarian approval
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Approved Borrow Requests */}
            {borrows.filter(b => b.user_id === user.id && b.status === 'borrowed' && b.approved_at && 
              new Date(b.approved_at).getTime() > Date.now() - 300000).length > 0 && (
              <div className="bg-green-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-green-500">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">✅</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800">Borrow Request Approved!</h3>
                    <p className="text-sm text-green-600">
                      Your borrow request has been approved. Check "My Borrowed Books" to see details.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rejected Borrow Requests */}
            {borrows.filter(b => b.user_id === user.id && b.status === 'rejected').length > 0 && (
              <div className="bg-red-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-red-500">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">❌</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800">Borrow Request Rejected</h3>
                    <p className="text-sm text-red-600">
                      {borrows.filter(b => b.user_id === user.id && b.status === 'rejected').length} borrow request(s) were rejected by the librarian
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Return Requests */}
            {borrows.filter(b => b.user_id === user.id && b.status === 'return_pending').length > 0 && (
              <div className="bg-blue-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-blue-500">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📥</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-800">Pending Return Requests</h3>
                    <p className="text-sm text-blue-600">
                      You have {borrows.filter(b => b.user_id === user.id && b.status === 'return_pending').length} return request(s) waiting for librarian approval
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Approved Return Requests */}
            {borrows.filter(b => b.user_id === user.id && (b.status === 'returned' || b.status === 'returned_with_penalty') && 
              b.return_approved_at && new Date(b.return_approved_at).getTime() > Date.now() - 300000).length > 0 && (
              <div className="bg-green-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-green-500">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">✅</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800">Return Approved!</h3>
                    <p className="text-sm text-green-600">
                      Your book return has been approved by the librarian.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Payment Requests */}
            {penalties.filter(p => p.user_id === user.id && p.status === 'payment_pending').length > 0 && (
              <div className="bg-purple-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-purple-500">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">💳</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-800">Pending Payment Verification</h3>
                    <p className="text-sm text-purple-600">
                      You have {penalties.filter(p => p.user_id === user.id && p.status === 'payment_pending').length} payment(s) waiting for librarian verification
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Approved Payment Requests */}
            {penalties.filter(p => p.user_id === user.id && p.status === 'paid' && 
              p.payment_approved_at && new Date(p.payment_approved_at).getTime() > Date.now() - 300000).length > 0 && (
              <div className="bg-green-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-green-500">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">✅</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800">Payment Approved!</h3>
                    <p className="text-sm text-green-600">
                      Your penalty payment has been verified. Your account is now active!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rejected Payment Requests */}
            {penalties.filter(p => p.user_id === user.id && p.payment_rejected_at && 
              new Date(p.payment_rejected_at).getTime() > Date.now() - 300000).length > 0 && (
              <div className="bg-red-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-red-500">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">❌</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800">Payment Not Verified</h3>
                    <p className="text-sm text-red-600">
                      Your payment was not verified by the librarian. Please contact the library.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Admin Notification Alert for Pending Registrations */}
        {user.role === 'admin' && allUsers.filter(u => u.status === 'pending').length > 0 && (
          <div className="bg-orange-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-orange-500 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔔</div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-800">
                    New Registration Alert!
                  </h3>
                  <p className="text-sm text-orange-600">
                    {allUsers.filter(u => u.status === 'pending').length} student(s) waiting for approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveView('pending-approvals')
                  loadAllUsers()
                }}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                📋 Review Now ({allUsers.filter(u => u.status === 'pending').length})
              </button>
            </div>
          </div>
        )}

        {/* Librarian Notification Alerts */}
        {user.role === 'librarian' && (
          <>
            {borrows.filter(b => b.status === 'pending').length > 0 && (
              <div className="bg-blue-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-blue-500 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">📚</div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">New Borrow Request Alert!</h3>
                      <p className="text-sm text-blue-600">
                        {borrows.filter(b => b.status === 'pending').length} student(s) waiting to borrow books
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveView('pending-borrows')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    📋 Review Now ({borrows.filter(b => b.status === 'pending').length})
                  </button>
                </div>
              </div>
            )}
            
            {borrows.filter(b => b.status === 'return_pending').length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-yellow-500 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">📥</div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800">New Return Request Alert!</h3>
                      <p className="text-sm text-yellow-600">
                        {borrows.filter(b => b.status === 'return_pending').length} student(s) waiting to return books
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveView('pending-returns')}
                    className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                  >
                    📋 Review Now ({borrows.filter(b => b.status === 'return_pending').length})
                  </button>
                </div>
              </div>
            )}
            
            {penalties.filter(p => p.status === 'payment_pending').length > 0 && (
              <div className="bg-green-50 p-4 rounded-xl shadow-sm mb-6 border-l-4 border-green-500 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">💰</div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">New Payment Request Alert!</h3>
                      <p className="text-sm text-green-600">
                        {penalties.filter(p => p.status === 'payment_pending').length} student(s) submitted penalty payments
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveView('pending-payments')
                      loadPenalties()
                    }}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    📋 Review Now ({penalties.filter(p => p.status === 'payment_pending').length})
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Role-based Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
          {user.role === 'admin' && (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 relative">
                {allUsers.filter(u => u.status === 'pending').length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm animate-bounce">
                    {allUsers.filter(u => u.status === 'pending').length}
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-4">⏳ Pending Approvals</h3>
                <p className="text-gray-600 mb-4">Review and approve new student registrations</p>
                <button 
                  onClick={() => {
                    setActiveView('pending-approvals')
                    loadAllUsers()
                  }}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  View Pending ({allUsers.filter(u => u.status === 'pending').length})
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold mb-4">👥 User Account Management</h3>
                <p className="text-gray-600 mb-4">Manage user accounts and access control</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      setActiveView('manage-users')
                      loadAllUsers()
                    }}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Manage Users
                  </button>
                  <button 
                    onClick={() => setActiveView('add-new-user')}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add New User
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                <h3 className="text-lg font-semibold mb-4">🔒 System Access Control</h3>
                <p className="text-gray-600 mb-4">Control system access and permissions</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveView('permissions')}
                    className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Permissions
                  </button>
                  <button 
                    onClick={() => setActiveView('system-logs')}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    System Logs
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <h3 className="text-lg font-semibold mb-4">💾 System Backup & Recovery</h3>
                <p className="text-gray-600 mb-4">Perform system backup and recovery operations</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveView('create-backup')}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Create Backup
                  </button>
                  <button 
                    onClick={() => setActiveView('restore-system')}
                    className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Restore System
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <h3 className="text-lg font-semibold mb-4">📊 View Reports</h3>
                <p className="text-gray-600 mb-4">View reports submitted by librarians</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveView('view-reports')}
                    className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Reports Inbox
                  </button>
                  <button 
                    onClick={() => setActiveView('report-archive')}
                    className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    Report Archive
                  </button>
                </div>
              </div>
            </>
          )}

          {user.role === 'librarian' && (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 relative">
                {borrows.filter(b => b.status === 'pending').length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm animate-bounce">
                    {borrows.filter(b => b.status === 'pending').length}
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-4">⏳ Pending Borrow Requests</h3>
                <p className="text-gray-600 mb-4">Approve or reject student borrow requests</p>
                <button 
                  onClick={() => setActiveView('pending-borrows')}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Review Requests ({borrows.filter(b => b.status === 'pending').length})
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 relative">
                {borrows.filter(b => b.status === 'return_pending').length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm animate-bounce">
                    {borrows.filter(b => b.status === 'return_pending').length}
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-4">📥 Pending Return Requests</h3>
                <p className="text-gray-600 mb-4">Approve or reject book return requests</p>
                <button 
                  onClick={() => setActiveView('pending-returns')}
                  className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Review Returns ({borrows.filter(b => b.status === 'return_pending').length})
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 relative">
                {penalties.filter(p => p.status === 'payment_pending').length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm animate-bounce">
                    {penalties.filter(p => p.status === 'payment_pending').length}
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-4">💰 Pending Payment Requests</h3>
                <p className="text-gray-600 mb-4">Approve or reject penalty payments</p>
                <button 
                  onClick={() => {
                    setActiveView('pending-payments')
                    loadPenalties()
                  }}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Review Payments ({penalties.filter(p => p.status === 'payment_pending').length})
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold mb-4">📚 Book Management</h3>
                <p className="text-gray-600 mb-4">Add, edit, and delete book information</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      setActiveView('manage-books')
                      // Ensure scroll happens after state update
                      setTimeout(() => {
                        contentRef.current?.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start' 
                        })
                      }, 150)
                    }}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    View All Books
                  </button>
                  <button 
                    onClick={() => setShowAddBookForm(true)}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add New Book
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <h3 className="text-lg font-semibold mb-4">📤 Issue & Return Books</h3>
                <p className="text-gray-600 mb-4">Manage book circulation</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveView('all-borrows')}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    View All Borrows
                  </button>
                  <button 
                    onClick={() => setActiveView('overdue-books')}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Overdue Books
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <h3 className="text-lg font-semibold mb-4">📊 Generate Reports</h3>
                <p className="text-gray-600 mb-4">Generate various library reports</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveView('monthly-report')}
                    className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Monthly Report
                  </button>
                  <button 
                    onClick={() => setActiveView('member-report')}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Member Report
                  </button>
                </div>
              </div>
            </>
          )}

          {user.role === 'student' && (
            <>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 relative">
                {(borrows.filter(b => b.user_id === user.id && ['pending', 'return_pending', 'rejected'].includes(b.status)).length +
                  penalties.filter(p => p.user_id === user.id && p.status === 'payment_pending').length) > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm animate-bounce">
                    {borrows.filter(b => b.user_id === user.id && ['pending', 'return_pending', 'rejected'].includes(b.status)).length +
                     penalties.filter(p => p.user_id === user.id && p.status === 'payment_pending').length}
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-4">📋 My Requests Status</h3>
                <p className="text-gray-600 mb-4">Track all your pending, approved, and rejected requests</p>
                <button 
                  onClick={() => {
                    setActiveView('my-requests-status')
                    loadInitialData()
                    loadPenalties()
                  }}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  View All Requests
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold mb-4">🔍 Quick Book Search</h3>
                <p className="text-gray-600 mb-4">Search for books by title, author, or ISBN</p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={searchFilters.search}
                    onChange={(e) => {
                      setSearchFilters(prev => ({ ...prev, search: e.target.value }))
                      if (e.target.value) {
                        setActiveView('available-books')
                      }
                    }}
                    placeholder="Type book name, author, or ISBN..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button 
                    onClick={() => {
                      setActiveView('available-books')
                      loadAvailableBooks(searchFilters)
                    }}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Browse All Books
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                <h3 className="text-lg font-semibold mb-4">📤 Return Borrowed Books</h3>
                <p className="text-gray-600 mb-4">Return books you have borrowed</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveView('my-borrows')}
                    className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    My Borrowed Books
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <h3 className="text-lg font-semibold mb-4">📋 Account & Penalties</h3>
                <p className="text-gray-600 mb-4">View your account status and penalty information</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      setActiveView('my-penalties')
                      if (user.id) loadUserStatus(user.id)
                    }}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    My Penalties & Status
                  </button>
                  <button 
                    onClick={() => setActiveView('borrowing-history')}
                    className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    View History
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Data Display Area */}
        <div ref={contentRef} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <h3 className="text-lg font-semibold">
              {activeView === 'overview' && '📊 System Overview'}
              {activeView === 'available-books' && '📚 Available Books'}
              {activeView === 'my-borrows' && '📤 My Borrowed Books'}
              {activeView === 'borrowing-history' && '📋 My Borrowing History'}
              {activeView === 'all-borrows' && '📊 All Active Borrows'}
              {activeView === 'overdue-books' && '⚠️ Overdue Books'}
              {activeView === 'student-activities' && '👥 Student Activities'}
              {activeView === 'system-activities' && '🔧 System Activities'}
              {activeView === 'add-activity' && '📝 Add Student Activity'}
              {activeView === 'my-penalties' && '💰 My Penalties & Account Status'}
              {activeView === 'manage-penalties' && '💰 Manage Student Penalties'}
              {activeView === 'manage-books' && '📚 Manage Books'}
              {activeView === 'manage-users' && '👥 Manage Users'}
              {activeView === 'add-new-user' && '👤 Add New User'}
              {activeView === 'edit-user' && '✏️ Edit User'}
              {activeView === 'permissions' && '🔒 System Permissions'}
              {activeView === 'system-logs' && '📋 System Logs'}
              {activeView === 'create-backup' && '💾 Create System Backup'}
              {activeView === 'restore-system' && '🔄 System Restore'}
              {activeView === 'monthly-report' && '📊 Monthly Report'}
              {activeView === 'member-report' && '👥 Member Report'}
              {activeView === 'view-reports' && '📊 Reports Inbox'}
              {activeView === 'report-archive' && '📁 Report Archive'}
            </h3>
          </div>
          
          <div className="p-6">
            {activeView === 'overview' && (
              <div className="text-center text-gray-600">
                <p>Welcome to MWU DIGITAL LIBRARY</p>
                <p>Select an option above to view data</p>
              </div>
            )}

            {activeView === 'available-books' && (
              <div>
                {/* Automatic Search Interface */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-md font-semibold mb-4">🔍 Search Books (Auto-search as you type)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search by Book Name, Author, or ISBN
                      </label>
                      <input
                        type="text"
                        value={searchFilters.search}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, search: e.target.value }))}
                        placeholder="Type book title, author name, or ISBN number..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Results will appear automatically as you type
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Filter
                      </label>
                      <select
                        value={searchFilters.category}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Categories</option>
                        <option value="1">Literature</option>
                        <option value="2">Science</option>
                        <option value="3">Technology</option>
                        <option value="4">History</option>
                        <option value="5">Biography</option>
                        <option value="6">Education</option>
                        <option value="7">Business</option>
                        <option value="8">Health</option>
                      </select>
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id="availableOnly"
                          checked={searchFilters.availableOnly}
                          onChange={(e) => setSearchFilters(prev => ({ ...prev, availableOnly: e.target.checked }))}
                          className="mr-2"
                        />
                        <label htmlFor="availableOnly" className="text-sm text-gray-700">
                          Available books only
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Search Results Summary */}
                  {searchFilters.search && (
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800">
                        <strong>Searching for:</strong> "{searchFilters.search}" 
                        {searchFilters.category && ` in ${['', 'Fiction', 'Science', 'Technology', 'History', 'Biography'][parseInt(searchFilters.category)]} category`}
                        {searchFilters.availableOnly && ' (available books only)'}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  
                  {/* Clear Search Button */}
                  {(searchFilters.search || searchFilters.category) && (
                    <div className="mt-3">
                      <button
                        onClick={clearSearch}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Books Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Title</th>
                        <th className="text-left p-3">Author</th>
                        <th className="text-left p-3">ISBN</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Available</th>
                        <th className="text-left p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(searchFilters.search ? searchResults : availableBooks).map(book => (
                        <tr key={book.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">
                            <div className="text-gray-900">{book.title}</div>
                            <div className="text-xs text-gray-500">{book.description}</div>
                          </td>
                          <td className="p-3">{book.author}</td>
                          <td className="p-3 text-sm text-gray-600 font-mono">{book.isbn}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {book.category.name}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              book.available_quantity > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {book.available_quantity}/{book.quantity}
                            </span>
                          </td>
                          <td className="p-3">
                            {book.available_quantity > 0 ? (
                              <button
                                onClick={() => handleBorrowBook(book.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                              >
                                Borrow Book
                              </button>
                            ) : (
                              <span className="text-gray-500 text-sm bg-gray-100 px-3 py-2 rounded-lg">
                                Not Available
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(searchFilters.search ? searchResults : availableBooks).length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            {searchFilters.search ? (
                              <div>
                                <p className="text-lg mb-2">📚 No books found</p>
                                <p className="text-sm">Try searching with different keywords or check the category filter</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-lg mb-2">📚 No books available</p>
                                <p className="text-sm">All books are currently borrowed</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'my-borrows' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Book Title</th>
                      <th className="text-left p-3">Borrowed Date</th>
                      <th className="text-left p-3">Due Date</th>
                      <th className="text-left p-3">Days Left</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Renewal</th>
                      <th className="text-left p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userBorrows.map(borrow => {
                      const isOverdue = borrow.status === 'overdue'
                      const dueDate = new Date(borrow.due_date)
                      const today = new Date()
                      const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                      const isRenewed = (borrow as any).renewed || false
                      
                      return (
                        <tr key={borrow.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{borrow.book_title}</td>
                          <td className="p-3 text-sm">
                            <div className="text-gray-900">{formatDate(borrow.borrowed_at)}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(borrow.borrowed_at).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            <div className="text-gray-900">{formatDate(borrow.due_date)}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(borrow.due_date).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            {isRenewed && (
                              <div className="text-xs text-blue-600 font-medium">📅 Renewed</div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isOverdue 
                                ? 'bg-red-100 text-red-800' 
                                : daysLeft <= 3 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isOverdue 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {borrow.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            {isRenewed ? (
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                ✅ Already Renewed
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">
                                {isOverdue ? 'Not Available' : 'Available'}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="space-y-2">
                              {isOverdue ? (
                                <button
                                  disabled
                                  className="bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed block w-full"
                                >
                                  Contact Librarian
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReturnBook(borrow.id)}
                                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors block w-full"
                                >
                                  📤 Return Book
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {userBorrows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          📚 You have no books currently borrowed
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pending Borrow Requests View - Librarian */}
            {activeView === 'pending-borrows' && user.role === 'librarian' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">⏳ Pending Borrow Requests</h2>
                  <p className="text-gray-600">Review and approve student borrow requests</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Student</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Book Title</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Requested</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {borrows.filter(b => b.status === 'pending').map((borrow) => (
                        <tr key={borrow.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium text-gray-900">{borrow.user_name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">ID: {borrow.user_id}</div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">{borrow.user_email}</td>
                          <td className="p-3">
                            <div className="font-medium text-gray-900">{borrow.book_title}</div>
                            <div className="text-sm text-gray-500">Book ID: {borrow.book_id}</div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(borrow.requested_at || borrow.borrowed_at).toLocaleString()}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(borrow.due_date).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  if (confirm(`Approve borrow request for ${borrow.user_name}?`)) {
                                    try {
                                      await api.post('/borrows/approve', {
                                        borrow_id: borrow.id,
                                        action: 'approve',
                                        librarian_email: user?.email,
                                        librarian_name: user?.name
                                      })
                                      alert(`✅ Borrow request approved!`)
                                      loadInitialData() // Refresh list
                                    } catch (error: any) {
                                      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to approve'))
                                    }
                                  }
                                }}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Reject borrow request for ${borrow.user_name}?`)) {
                                    try {
                                      await api.post('/borrows/approve', {
                                        borrow_id: borrow.id,
                                        action: 'reject',
                                        librarian_email: user?.email,
                                        librarian_name: user?.name
                                      })
                                      alert(`❌ Borrow request rejected`)
                                      loadInitialData() // Refresh list
                                    } catch (error: any) {
                                      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to reject'))
                                    }
                                  }
                                }}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {borrows.filter(b => b.status === 'pending').length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">
                            <div className="text-6xl mb-4">✅</div>
                            <div className="text-xl font-semibold text-green-600 mb-2">No Pending Requests</div>
                            <div>All borrow requests have been processed.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pending Return Requests View - Librarian */}
            {activeView === 'pending-returns' && user.role === 'librarian' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">📥 Pending Return Requests</h2>
                  <p className="text-gray-600">Review and approve book return requests</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Student</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Book Title</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Borrowed</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Return Requested</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {borrows.filter(b => b.status === 'return_pending').map((borrow) => (
                        <tr key={borrow.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium text-gray-900">{borrow.user_name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{borrow.user_email}</div>
                          </td>
                          <td className="p-3 font-medium text-gray-900">{borrow.book_title}</td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(borrow.borrowed_at).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(borrow.due_date).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(borrow.return_requested_at || Date.now()).toLocaleString()}
                          </td>
                          <td className="p-3">
                            {borrow.is_overdue ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                Overdue ({borrow.overdue_days} days)
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                On Time
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  if (confirm(`Approve return for ${borrow.user_name}?${borrow.is_overdue ? '\n\nNote: This book is OVERDUE. A penalty will be created.' : ''}`)) {
                                    try {
                                      await api.post('/returns/approve', {
                                        borrow_id: borrow.id,
                                        action: 'approve',
                                        librarian_email: user?.email,
                                        librarian_name: user?.name
                                      })
                                      alert(`✅ Return approved!${borrow.is_overdue ? ' Penalty created.' : ''}`)
                                      loadInitialData()
                                    } catch (error: any) {
                                      alert('❌ Error: ' + (error.response?.data?.message || 'Failed'))
                                    }
                                  }
                                }}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Reject return for ${borrow.user_name}?`)) {
                                    try {
                                      await api.post('/returns/approve', {
                                        borrow_id: borrow.id,
                                        action: 'reject',
                                        librarian_email: user?.email,
                                        librarian_name: user?.name
                                      })
                                      alert(`❌ Return rejected`)
                                      loadInitialData()
                                    } catch (error: any) {
                                      alert('❌ Error: ' + (error.response?.data?.message || 'Failed'))
                                    }
                                  }
                                }}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {borrows.filter(b => b.status === 'return_pending').length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">
                            <div className="text-6xl mb-4">✅</div>
                            <div className="text-xl font-semibold text-green-600 mb-2">No Pending Returns</div>
                            <div>All return requests have been processed.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pending Payment Requests View - Librarian */}
            {activeView === 'pending-payments' && user.role === 'librarian' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">💰 Pending Payment Requests</h2>
                  <p className="text-gray-600">Review and approve penalty payments</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Student</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Book Title</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Overdue Days</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Payment Method</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Requested</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {penalties.filter(p => p.status === 'payment_pending').map((penalty) => (
                        <tr key={penalty.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium text-gray-900">{penalty.user_name}</div>
                            <div className="text-sm text-gray-500">{penalty.user_email}</div>
                          </td>
                          <td className="p-3 font-medium text-gray-900">{penalty.book_title}</td>
                          <td className="p-3 text-sm text-gray-600">{penalty.overdue_days} days</td>
                          <td className="p-3">
                            <span className="font-bold text-red-600">{penalty.penalty_amount} Birr</span>
                          </td>
                          <td className="p-3 text-sm text-gray-600 capitalize">{penalty.payment_method || 'Cash'}</td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(penalty.payment_requested_at || Date.now()).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  if (confirm(`Approve payment of ${penalty.penalty_amount} Birr from ${penalty.user_name}?`)) {
                                    try {
                                      await api.post('/penalties/approve', {
                                        penalty_id: penalty.id,
                                        action: 'approve',
                                        librarian_email: user?.email,
                                        librarian_name: user?.name
                                      })
                                      alert(`✅ Payment approved! Student account reactivated.`)
                                      loadPenalties()
                                    } catch (error: any) {
                                      alert('❌ Error: ' + (error.response?.data?.message || 'Failed'))
                                    }
                                  }
                                }}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Reject payment from ${penalty.user_name}?`)) {
                                    try {
                                      await api.post('/penalties/approve', {
                                        penalty_id: penalty.id,
                                        action: 'reject',
                                        librarian_email: user?.email,
                                        librarian_name: user?.name
                                      })
                                      alert(`❌ Payment rejected`)
                                      loadPenalties()
                                    } catch (error: any) {
                                      alert('❌ Error: ' + (error.response?.data?.message || 'Failed'))
                                    }
                                  }
                                }}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {penalties.filter(p => p.status === 'payment_pending').length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">
                            <div className="text-6xl mb-4">✅</div>
                            <div className="text-xl font-semibold text-green-600 mb-2">No Pending Payments</div>
                            <div>All payment requests have been processed.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'all-borrows' && user.role === 'librarian' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">User Email</th>
                      <th className="text-left p-3">Book Title</th>
                      <th className="text-left p-3">Borrowed Date</th>
                      <th className="text-left p-3">Due Date</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrows.filter(b => ['borrowed', 'overdue'].includes(b.status)).map(borrow => {
                      const isOverdue = borrow.status === 'overdue'
                      return (
                        <tr key={borrow.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{borrow.user_email}</td>
                          <td className="p-3">{borrow.book_title}</td>
                          <td className="p-3">{formatDate(borrow.borrowed_at)}</td>
                          <td className="p-3">{formatDate(borrow.due_date)}</td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              isOverdue 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {borrow.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            {isOverdue ? (
                              <button
                                onClick={() => handleForceReturn(borrow.id)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                              >
                                Force Return
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReturnBook(borrow.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                              >
                                Accept Return
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Student Activities View */}
            {activeView === 'student-activities' && user?.role === 'librarian' && (
              <div>
                <div className="mb-4 flex space-x-4">
                  <input
                    type="date"
                    onChange={(e) => loadActivities(undefined, e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => loadActivities()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Load All Activities
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Time</th>
                        <th className="text-left p-3">Student</th>
                        <th className="text-left p-3">Activity</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map(activity => {
                        const typeIcons = {
                          'register': '👤',
                          'login': '🔐',
                          'borrow': '📚',
                          'return': '📤',
                          'manual': '📝',
                          'overdue': '⚠️'
                        }
                        
                        return (
                          <tr key={activity.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm">
                              <div>{formatDate(activity.timestamp)}</div>
                              <div className="text-xs text-gray-500">{activity.time}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{activity.user_name}</div>
                              <div className="text-xs text-gray-500">{activity.user_email}</div>
                            </td>
                            <td className="p-3">{activity.activity}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {typeIcons[activity.type as keyof typeof typeIcons] || '📋'} {activity.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-gray-600">{activity.details}</td>
                          </tr>
                        )
                      })}
                      {activities.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500">
                            No activities found for the selected criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Add Activity View */}
            {activeView === 'add-activity' && user?.role === 'librarian' && (
              <div className="max-w-2xl">
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target as HTMLFormElement)
                  const userId = parseInt(formData.get('user_id') as string)
                  const userEmail = formData.get('user_email') as string
                  const userName = formData.get('user_name') as string
                  const activity = formData.get('activity') as string
                  const details = formData.get('details') as string
                  
                  addStudentActivity(userId, userEmail, userName, activity, details)
                  ;(e.target as HTMLFormElement).reset()
                }} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Email
                      </label>
                      <input
                        type="email"
                        name="user_email"
                        placeholder="student@student.mwu.edu.et"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Name
                      </label>
                      <input
                        type="text"
                        name="user_name"
                        placeholder="Student Full Name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID (User ID)
                    </label>
                    <input
                      type="number"
                      name="user_id"
                      placeholder="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activity Description
                    </label>
                    <input
                      type="text"
                      name="activity"
                      placeholder="e.g., Student attended library orientation session"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      name="details"
                      rows={3}
                      placeholder="Additional notes or details about this activity..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      📝 Log Activity
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('student-activities')}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      View Activities
                    </button>
                  </div>
                </form>
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Activity Logging Tips:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Log important interactions with students</li>
                    <li>• Record library orientation sessions</li>
                    <li>• Note any issues or concerns</li>
                    <li>• Document special requests or accommodations</li>
                    <li>• Track student engagement and participation</li>
                  </ul>
                </div>
              </div>
            )}

            {/* System Activities View */}
            {activeView === 'system-activities' && user?.role === 'librarian' && (
              <div>
                <div className="mb-4 flex space-x-4">
                  <input
                    type="date"
                    onChange={(e) => loadSystemActivities(undefined, e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => loadSystemActivities()}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Load All System Activities
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Time</th>
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">System Activity</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemActivities.map(activity => {
                        const typeIcons = {
                          'book_add': '📚',
                          'book_update': '✏️',
                          'book_delete': '🗑️',
                          'system': '🔧'
                        }
                        
                        return (
                          <tr key={activity.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm">
                              <div>{formatDate(activity.timestamp)}</div>
                              <div className="text-xs text-gray-500">{activity.time}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{activity.user_name}</div>
                              <div className="text-xs text-gray-500">{activity.user_email}</div>
                            </td>
                            <td className="p-3">{activity.activity}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                {typeIcons[activity.type as keyof typeof typeIcons] || '🔧'} {activity.type.toUpperCase().replace('_', ' ')}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-gray-600">{activity.details}</td>
                          </tr>
                        )
                      })}
                      {systemActivities.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500">
                            No system activities found for the selected criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">ℹ️ About System Activities:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Book management activities (add, update, delete)</li>
                    <li>• System configuration changes</li>
                    <li>• Administrative operations</li>
                    <li>• Library system maintenance activities</li>
                  </ul>
                </div>
              </div>
            )}

            {/* My Penalties View - Student */}
            {activeView === 'my-penalties' && user?.role === 'student' && (
              <div>
                {userStatus && (
                  <div className="space-y-6">
                    {/* Account Status */}
                    <div className={`p-6 rounded-xl border-l-4 ${
                      userStatus.is_suspended 
                        ? 'bg-red-50 border-red-400' 
                        : 'bg-green-50 border-green-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {userStatus.is_suspended ? '🚫 Account Suspended' : '✅ Account Active'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {userStatus.is_suspended 
                              ? 'Your account is suspended due to unpaid penalties. Please pay outstanding fines to reactivate.'
                              : 'Your account is in good standing. You can borrow books normally.'
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            {userStatus.total_unpaid_amount.toFixed(2)} ETB
                          </div>
                          <div className="text-sm text-gray-500">Total Outstanding</div>
                        </div>
                      </div>
                    </div>

                    {/* Unpaid Penalties */}
                    {userStatus.unpaid_penalties.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-4 text-red-600">💰 Outstanding Penalties</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-3">Book Title</th>
                                <th className="text-left p-3">Overdue Days</th>
                                <th className="text-left p-3">Penalty Amount</th>
                                <th className="text-left p-3">Created Date</th>
                                <th className="text-left p-3">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userStatus.unpaid_penalties.map(penalty => (
                                <tr key={penalty.id} className="border-b hover:bg-gray-50">
                                  <td className="p-3 font-medium">{penalty.book_title}</td>
                                  <td className="p-3">
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                      {penalty.overdue_days} days
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className="text-lg font-bold text-red-600">
                                      {penalty.penalty_amount.toFixed(2)} ETB
                                    </span>
                                  </td>
                                  <td className="p-3 text-sm">{formatDate(penalty.created_at)}</td>
                                  <td className="p-3">
                                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                      {penalty.status.toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Payment Instructions */}
                    {userStatus.is_suspended && (
                      <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-400">
                        <h4 className="font-semibold text-yellow-800 mb-2">💡 How to Pay Penalties</h4>
                        <div className="text-sm text-yellow-700 space-y-2">
                          <p>• Visit the library in person to pay your penalties</p>
                          <p>• Bring cash or check for the total amount: <strong>{userStatus.total_unpaid_amount.toFixed(2)} ETB</strong></p>
                          <p>• Ask the librarian to process your payment in the system</p>
                          <p>• Your account will be reactivated immediately after payment</p>
                          <p>• Contact: <strong>mulugeta.bekele@mwu.edu.et</strong> for questions</p>
                        </div>
                      </div>
                    )}

                    {/* No Penalties */}
                    {userStatus.unpaid_penalties.length === 0 && !userStatus.is_suspended && (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-xl font-semibold text-green-600 mb-2">No Outstanding Penalties!</h3>
                        <p className="text-gray-600">Your account is in good standing. Keep up the good work!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Manage Penalties View - Librarian */}
            {activeView === 'manage-penalties' && user?.role === 'librarian' && (
              <div>
                <div className="mb-6 flex space-x-4">
                  <button
                    onClick={() => loadPenalties()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Load All Penalties
                  </button>
                  <button
                    onClick={() => loadPenalties(undefined, 'unpaid')}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Unpaid Only
                  </button>
                  <button
                    onClick={() => loadPenalties(undefined, 'paid')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Paid Only
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Student</th>
                        <th className="text-left p-3">Book Title</th>
                        <th className="text-left p-3">Overdue Days</th>
                        <th className="text-left p-3">Penalty Amount</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Created Date</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {penalties.map(penalty => (
                        <tr key={penalty.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium">{penalty.user_name}</div>
                            <div className="text-xs text-gray-500">{penalty.user_email}</div>
                          </td>
                          <td className="p-3 font-medium">{penalty.book_title}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              {penalty.overdue_days} days
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-lg font-bold text-red-600">
                              {penalty.penalty_amount.toFixed(2)} ETB
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              penalty.status === 'paid' 
                                ? 'bg-green-100 text-green-800'
                                : penalty.status === 'waived'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {penalty.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-sm">
                            <div>{formatDate(penalty.created_at)}</div>
                            {penalty.paid_at && (
                              <div className="text-xs text-green-600">
                                Paid: {formatDate(penalty.paid_at)}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            {penalty.status === 'unpaid' && (
                              <div className="space-y-2">
                                <button
                                  onClick={() => {
                                    const paymentMethod = prompt('Payment method (cash/check/card):', 'cash')
                                    const notes = prompt('Payment notes (optional):', '')
                                    if (paymentMethod) {
                                      processPenaltyPayment(penalty.id, paymentMethod, notes || '')
                                    }
                                  }}
                                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors block w-full"
                                >
                                  Mark as Paid
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Waive penalty of $${penalty.penalty_amount} for ${penalty.user_name}?`)) {
                                      processPenaltyPayment(penalty.id, 'waived', 'Penalty waived by librarian')
                                    }
                                  }}
                                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors block w-full"
                                >
                                  Waive Penalty
                                </button>
                              </div>
                            )}
                            {penalty.status === 'paid' && (
                              <div className="text-sm text-green-600">
                                <div>✅ Paid</div>
                                {penalty.payment_method && (
                                  <div className="text-xs">via {penalty.payment_method}</div>
                                )}
                              </div>
                            )}
                            {penalty.status === 'waived' && (
                              <div className="text-sm text-blue-600">
                                <div>🎁 Waived</div>
                                <div className="text-xs">by librarian</div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {penalties.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">
                            No penalties found for the selected criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Penalty Statistics */}
                {penalties.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                      <div className="text-2xl font-bold text-red-600">
                        {penalties.filter(p => p.status === 'unpaid').length}
                      </div>
                      <div className="text-sm text-red-700">Unpaid Penalties</div>
                      <div className="text-xs text-red-600">
                        {penalties.filter(p => p.status === 'unpaid').reduce((sum, p) => sum + p.penalty_amount, 0).toFixed(2)} ETB total
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                      <div className="text-2xl font-bold text-green-600">
                        {penalties.filter(p => p.status === 'paid').length}
                      </div>
                      <div className="text-sm text-green-700">Paid Penalties</div>
                      <div className="text-xs text-green-600">
                        {penalties.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.penalty_amount, 0).toFixed(2)} ETB collected
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <div className="text-2xl font-bold text-blue-600">
                        {penalties.filter(p => p.status === 'waived').length}
                      </div>
                      <div className="text-sm text-blue-700">Waived Penalties</div>
                      <div className="text-xs text-blue-600">
                        {penalties.filter(p => p.status === 'waived').reduce((sum, p) => sum + p.penalty_amount, 0).toFixed(2)} ETB waived
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* My Requests Status View - Student */}
            {activeView === 'my-requests-status' && user?.role === 'student' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 My Requests Status</h2>
                  <p className="text-gray-600">Track all your borrow, return, and payment requests</p>
                </div>

                {/* Borrow Requests Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Borrow Requests</h3>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Book Title</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Requested Date</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Approved By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {borrows.filter(b => b.user_id === user.id && ['pending', 'borrowed', 'rejected'].includes(b.status)).map((borrow) => (
                          <tr key={borrow.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-900">{borrow.book_title}</td>
                            <td className="p-3 text-sm text-gray-600">
                              {new Date(borrow.requested_at || borrow.borrowed_at).toLocaleString()}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {new Date(borrow.due_date).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              {borrow.status === 'pending' && (
                                <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 font-medium">
                                  ⏳ Pending Approval
                                </span>
                              )}
                              {borrow.status === 'borrowed' && (
                                <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                                  ✅ Approved & Borrowed
                                </span>
                              )}
                              {borrow.status === 'rejected' && (
                                <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800 font-medium">
                                  ❌ Rejected
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {borrow.approved_by || '-'}
                            </td>
                          </tr>
                        ))}
                        {borrows.filter(b => b.user_id === user.id && ['pending', 'borrowed', 'rejected'].includes(b.status)).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">
                              No borrow requests found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Return Requests Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">📥 Return Requests</h3>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Book Title</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Return Requested</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Was Overdue?</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Approved By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {borrows.filter(b => b.user_id === user.id && ['return_pending', 'returned', 'returned_with_penalty'].includes(b.status)).map((borrow) => (
                          <tr key={borrow.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-900">{borrow.book_title}</td>
                            <td className="p-3 text-sm text-gray-600">
                              {borrow.return_requested_at ? new Date(borrow.return_requested_at).toLocaleString() : '-'}
                            </td>
                            <td className="p-3">
                              {borrow.is_overdue ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                  Yes ({borrow.overdue_days} days)
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {borrow.status === 'return_pending' && (
                                <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                                  ⏳ Pending Approval
                                </span>
                              )}
                              {borrow.status === 'returned' && (
                                <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                                  ✅ Approved & Returned
                                </span>
                              )}
                              {borrow.status === 'returned_with_penalty' && (
                                <span className="px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 font-medium">
                                  ✅ Returned (Penalty Applied)
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {borrow.return_approved_by || '-'}
                            </td>
                          </tr>
                        ))}
                        {borrows.filter(b => b.user_id === user.id && ['return_pending', 'returned', 'returned_with_penalty'].includes(b.status)).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">
                              No return requests found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Requests Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">💰 Payment Requests</h3>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Book Title</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Payment Method</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Requested Date</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-700">Verified By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {penalties.filter(p => p.user_id === user.id && ['payment_pending', 'paid'].includes(p.status)).map((penalty) => (
                          <tr key={penalty.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-900">{penalty.book_title}</td>
                            <td className="p-3">
                              <span className="font-bold text-red-600">{penalty.penalty_amount} Birr</span>
                            </td>
                            <td className="p-3 text-sm text-gray-600 capitalize">{penalty.payment_method || 'Cash'}</td>
                            <td className="p-3 text-sm text-gray-600">
                              {penalty.payment_requested_at ? new Date(penalty.payment_requested_at).toLocaleString() : '-'}
                            </td>
                            <td className="p-3">
                              {penalty.status === 'payment_pending' && (
                                <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 font-medium">
                                  ⏳ Pending Verification
                                </span>
                              )}
                              {penalty.status === 'paid' && (
                                <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                                  ✅ Verified & Paid
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {penalty.payment_approved_by || '-'}
                            </td>
                          </tr>
                        ))}
                        {penalties.filter(p => p.user_id === user.id && ['payment_pending', 'paid'].includes(p.status)).length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500">
                              No payment requests found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Borrowing History View */}
            {activeView === 'borrowing-history' && user?.role === 'student' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Book Title</th>
                      <th className="text-left p-3">Borrowed Date</th>
                      <th className="text-left p-3">Due Date</th>
                      <th className="text-left p-3">Returned Date</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Renewed</th>
                      <th className="text-left p-3">Penalty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrows.filter(b => b.user_id == user.id).map(borrow => {
                      const isRenewed = (borrow as any).renewed || false
                      const renewedAt = (borrow as any).renewed_at || null
                      
                      return (
                        <tr key={borrow.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{borrow.book_title}</td>
                          <td className="p-3 text-sm">{formatDate(borrow.borrowed_at)}</td>
                          <td className="p-3 text-sm">
                            <div>{formatDate(borrow.due_date)}</div>
                            {isRenewed && (
                              <div className="text-xs text-blue-600">📅 Extended</div>
                            )}
                          </td>
                          <td className="p-3 text-sm">
                            {borrow.returned_at ? formatDate(borrow.returned_at) : '-'}
                          </td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              borrow.status === 'returned' 
                                ? 'bg-green-100 text-green-800'
                                : borrow.status === 'returned_with_penalty'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : borrow.status === 'overdue'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                            }`}>
                              {borrow.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            {isRenewed ? (
                              <div className="text-sm">
                                <span className="text-blue-600 font-medium">✅ Yes</span>
                                {renewedAt && (
                                  <div className="text-xs text-gray-500">
                                    {formatDate(renewedAt)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">No</span>
                            )}
                          </td>
                          <td className="p-3">
                            {borrow.penalty_amount ? (
                              <span className="text-red-600 font-medium">
                                {borrow.penalty_amount.toFixed(2)} ETB
                              </span>
                            ) : (
                              <span className="text-green-600">None</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {borrows.filter(b => b.user_id == user.id).length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          📚 No borrowing history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Manage Books View - Librarian */}
            {activeView === 'manage-books' && user?.role === 'librarian' && (
              <div>
                <div className="mb-6">
                  <button
                    onClick={() => setShowAddBookForm(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors mr-4"
                  >
                    📚 Add New Book
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Title</th>
                        <th className="text-left p-3">Author</th>
                        <th className="text-left p-3">ISBN</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Quantity</th>
                        <th className="text-left p-3">Available</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map(book => (
                        <tr key={book.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">
                            <div className="text-gray-900">{book.title}</div>
                            <div className="text-xs text-gray-500">{book.description}</div>
                          </td>
                          <td className="p-3">{book.author}</td>
                          <td className="p-3 text-sm text-gray-600 font-mono">{book.isbn}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {book.category.name}
                            </span>
                          </td>
                          <td className="p-3 text-center">{book.quantity}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              book.available_quantity > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {book.available_quantity}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedBook(book)
                                  setShowUpdateBookForm(true)
                                }}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBook(book.id, book.title)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Overdue Books View */}
            {activeView === 'overdue-books' && user?.role === 'librarian' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Student</th>
                      <th className="text-left p-3">Book Title</th>
                      <th className="text-left p-3">Due Date</th>
                      <th className="text-left p-3">Days Overdue</th>
                      <th className="text-left p-3">Potential Penalty</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrows.filter(b => b.status === 'overdue').map(borrow => {
                      const dueDate = new Date(borrow.due_date)
                      const today = new Date()
                      const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                      const potentialPenalty = Math.max(daysOverdue * 50, 200) // 50 ETB/day, min 200 ETB
                      
                      return (
                        <tr key={borrow.id} className="border-b hover:bg-gray-50 bg-red-50">
                          <td className="p-3">
                            <div className="font-medium">{borrow.user_email}</div>
                            <div className="text-xs text-gray-500">ID: {borrow.user_id}</div>
                          </td>
                          <td className="p-3 font-medium">{borrow.book_title}</td>
                          <td className="p-3 text-sm text-red-600">{formatDate(borrow.due_date)}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                              {daysOverdue} days
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-lg font-bold text-red-600">
                              {potentialPenalty.toFixed(2)} ETB
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="space-y-2">
                              <button
                                onClick={() => handleForceReturn(borrow.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors block w-full"
                              >
                                Force Return + Penalty
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Send reminder email to ${borrow.user_email}?`)) {
                                    alert('📧 Reminder email sent! (Feature not implemented)')
                                  }
                                }}
                                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors block w-full"
                              >
                                Send Reminder
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {borrows.filter(b => b.status === 'overdue').length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          <div className="text-6xl mb-4">🎉</div>
                          <div className="text-xl font-semibold text-green-600 mb-2">No Overdue Books!</div>
                          <div>All books are returned on time or still within due date.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Admin Views */}
            {activeView === 'pending-approvals' && user?.role === 'admin' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">⏳ Pending Student Approvals</h2>
                  <p className="text-gray-600">Review and approve new student registrations</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Student Info</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Registered</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allUsers.filter(u => u.status === 'pending').map((userData) => (
                        <tr key={userData.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium text-gray-900">{userData.name}</div>
                            <div className="text-sm text-gray-500">ID: {userData.id}</div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">{userData.email}</td>
                          <td className="p-3 text-sm text-gray-600">{userData.student_id || 'N/A'}</td>
                          <td className="p-3 text-sm text-gray-600">{userData.phone || 'N/A'}</td>
                          <td className="p-3 text-sm text-gray-600">
                            {userData.registered_at ? new Date(userData.registered_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  if (confirm(`Approve ${userData.name}'s registration?`)) {
                                    try {
                                      await api.post('/users/approve', {
                                        email: userData.email,
                                        action: 'approve',
                                        admin_email: user?.email,
                                        admin_name: user?.name
                                      })
                                      alert(`✅ ${userData.name} has been approved!`)
                                      loadAllUsers() // Refresh list
                                    } catch (error: any) {
                                      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to approve user'))
                                    }
                                  }
                                }}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Reject ${userData.name}'s registration?`)) {
                                    try {
                                      await api.post('/users/approve', {
                                        email: userData.email,
                                        action: 'reject',
                                        admin_email: user?.email,
                                        admin_name: user?.name
                                      })
                                      alert(`❌ ${userData.name} has been rejected`)
                                      loadAllUsers() // Refresh list
                                    } catch (error: any) {
                                      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to reject user'))
                                    }
                                  }
                                }}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {allUsers.filter(u => u.status === 'pending').length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-gray-500">
                            <div className="text-6xl mb-4">✅</div>
                            <div className="text-xl font-semibold text-green-600 mb-2">No Pending Approvals</div>
                            <div>All student registrations have been processed.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'manage-users' && user?.role === 'admin' && (
              <div>
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setActiveView('add-new-user')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    👤 Add New User
                  </button>
                  
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Roles</option>
                    <option value="admin">Administrators</option>
                    <option value="librarian">Librarians</option>
                    <option value="student">Students</option>
                  </select>
                  
                  <select className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">Student ID</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingUsers ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            Loading users...
                          </td>
                        </tr>
                      ) : allUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        allUsers.map((userData, index) => (
                          <tr key={userData.id || index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{userData.name}</td>
                            <td className="p-3">{userData.email}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                userData.role === 'admin' ? 'bg-red-100 text-red-800' :
                                userData.role === 'librarian' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {userData.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3">{userData.student_id || '-'}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                ACTIVE
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="space-y-2">
                                <button 
                                  onClick={() => {
                                    setSelectedUserForEdit(userData)
                                    setShowEditUserForm(true)
                                  }}
                                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors w-full"
                                >
                                  ✏️ Edit
                                </button>
                                <button 
                                  onClick={() => {
                                    const registeredAt = userData.registered_at ? 
                                      `\n• Registered: ${new Date(userData.registered_at).toLocaleDateString()}` : 
                                      '\n• Default System User'
                                    alert(`👤 User Details:\n\n• Name: ${userData.name}\n• Email: ${userData.email}\n• Role: ${userData.role}\n• Student ID: ${userData.student_id || 'N/A'}\n• Phone: ${userData.phone || 'N/A'}\n• Status: Active${registeredAt}`)
                                  }}
                                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors w-full"
                                >
                                  👁️ View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* User Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <div className="text-2xl font-bold text-blue-600">{allUsers.length}</div>
                    <div className="text-sm text-blue-700">Total Users</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                    <div className="text-2xl font-bold text-red-600">
                      {allUsers.filter(u => u.role === 'admin').length}
                    </div>
                    <div className="text-sm text-red-700">Administrators</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <div className="text-2xl font-bold text-green-600">
                      {allUsers.filter(u => u.role === 'librarian').length}
                    </div>
                    <div className="text-sm text-green-700">Librarians</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                    <div className="text-2xl font-bold text-purple-600">
                      {allUsers.filter(u => u.role === 'student').length}
                    </div>
                    <div className="text-sm text-purple-700">Students</div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'add-new-user' && user?.role === 'admin' && (
              <div className="max-w-2xl">
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target as HTMLFormElement)
                  const userData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    confirm_password: formData.get('confirm_password'),
                    role: formData.get('role'),
                    student_id: formData.get('student_id'),
                    phone: formData.get('phone')
                  }
                  
                  if (userData.password !== userData.confirm_password) {
                    alert('❌ Passwords do not match!')
                    return
                  }
                  
                  // Call API to create user
                  try {
                    const response = await api.post('/register', userData)
                    if (response.data.message && response.data.message.includes('successful')) {
                      alert('✅ User created successfully!')
                      setActiveView('manage-users')
                      ;(e.target as HTMLFormElement).reset()
                      // Refresh the user list
                      loadAllUsers()
                    } else {
                      alert('❌ Error: ' + (response.data.message || 'Unknown error'))
                    }
                  } catch (error: any) {
                    alert('❌ Network error: ' + (error.response?.data?.message || error.message))
                  }
                }} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="user@mwu.edu.et"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role *
                      </label>
                      <select
                        name="role"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="student">Student</option>
                        <option value="librarian">Librarian</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID
                      </label>
                      <input
                        type="text"
                        name="student_id"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="STU001 (for students only)"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+251911234567"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      👤 Create User
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('manage-users')}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit User View */}
            {showEditUserForm && selectedUserForEdit && user?.role === 'admin' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-semibold mb-4">✏️ Edit User: {selectedUserForEdit.name}</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target as HTMLFormElement)
                    const userData = {
                      user_id: selectedUserForEdit.id,
                      name: formData.get('name'),
                      email: formData.get('email'),
                      role: formData.get('role'),
                      student_id: formData.get('student_id'),
                      phone: formData.get('phone'),
                      status: formData.get('status')
                    }
                    
                    // Call API to update user (placeholder for now)
                    alert(`✅ User "${userData.name}" updated successfully!\n\nUpdated fields:\n• Name: ${userData.name}\n• Email: ${userData.email}\n• Role: ${userData.role}\n• Student ID: ${userData.student_id || 'N/A'}\n• Status: ${userData.status}`)
                    setShowEditUserForm(false)
                    setSelectedUserForEdit(null)
                  }} className="space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          defaultValue={selectedUserForEdit.name}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          defaultValue={selectedUserForEdit.email}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role *
                        </label>
                        <select
                          name="role"
                          required
                          defaultValue={selectedUserForEdit.role}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="student">Student</option>
                          <option value="librarian">Librarian</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student ID
                        </label>
                        <input
                          type="text"
                          name="student_id"
                          defaultValue={selectedUserForEdit.student_id}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="STU001 (for students only)"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+251911234567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Status *
                        </label>
                        <select
                          name="status"
                          required
                          defaultValue="active"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      <h5 className="font-medium text-yellow-800 mb-2">🔒 Password Reset</h5>
                      <p className="text-sm text-yellow-700 mb-3">
                        Generate a temporary password for this user. The new password will be displayed to you and must be shared with the user securely.
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Reset password for ${selectedUserForEdit.name} (${selectedUserForEdit.email})?\n\nA temporary password will be generated and shown to you.`)) {
                            try {
                              const response = await api.post('/users/reset-password', {
                                email: selectedUserForEdit.email,
                                admin_email: user?.email,
                                admin_name: user?.name
                              })
                              
                              // Show the temporary password in a prominent alert
                              alert(`✅ Password Reset Successful!\n\n` +
                                    `User: ${response.data.user.name}\n` +
                                    `Email: ${response.data.user.email}\n\n` +
                                    `🔑 TEMPORARY PASSWORD: ${response.data.temporary_password}\n\n` +
                                    `⚠️ IMPORTANT:\n` +
                                    `• Write down this password immediately\n` +
                                    `• Share it securely with the user\n` +
                                    `• User should change it after first login\n` +
                                    `• This password will not be shown again`)
                              
                            } catch (error: any) {
                              alert(`❌ ${error.response?.data?.message || 'Error resetting password'}`)
                            }
                          }
                        }}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                      >
                        🔑 Reset Password (Generate Temporary)
                      </button>
                    </div>
                    
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        ✏️ Update User
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditUserForm(false)
                          setSelectedUserForEdit(null)
                        }}
                        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete user "${selectedUserForEdit.name}"? This action cannot be undone.`)) {
                            try {
                              const response = await api.post('/users/delete', {
                                email: selectedUserForEdit.email,
                                admin_email: user?.email,
                                admin_name: user?.name
                              })
                              
                              alert(`🗑️ ${response.data.message}`)
                              setShowEditUserForm(false)
                              setSelectedUserForEdit(null)
                              loadAllUsers() // Refresh user list
                            } catch (error: any) {
                              alert(`❌ ${error.response?.data?.message || 'Error deleting user'}`)
                            }
                          }
                        }}
                        className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        🗑️ Delete User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeView === 'permissions' && user?.role === 'admin' && (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">Users</th>
                        <th className="text-left p-3">Permissions</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">Administrator</td>
                        <td className="p-3">1</td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div>• Full System Access</div>
                            <div>• User Management</div>
                            <div>• System Configuration</div>
                            <div>• Backup & Restore</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            ACTIVE
                          </span>
                        </td>
                        <td className="p-3">
                          <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                            Configure
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">Librarian</td>
                        <td className="p-3">1</td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div>• Book Management</div>
                            <div>• Issue & Return Books</div>
                            <div>• View Reports</div>
                            <div>• Manage Penalties</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            ACTIVE
                          </span>
                        </td>
                        <td className="p-3">
                          <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                            Configure
                          </button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">Student</td>
                        <td className="p-3">1+</td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div>• Search Books</div>
                            <div>• Borrow Books</div>
                            <div>• View History</div>
                            <div>• Check Penalties</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            ACTIVE
                          </span>
                        </td>
                        <td className="p-3">
                          <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                            Configure
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'system-logs' && user?.role === 'admin' && (
              <div>
                <div className="mb-4 flex space-x-4">
                  <input
                    type="date"
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Filter by Date
                  </button>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    Export Logs
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Timestamp</th>
                        <th className="text-left p-3">Event Type</th>
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">Description</th>
                        <th className="text-left p-3">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">2026-02-04 10:45:23</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            LOGIN
                          </span>
                        </td>
                        <td className="p-3">hanan.mohammed@student.mwu.edu.et</td>
                        <td className="p-3">User logged in successfully</td>
                        <td className="p-3 text-sm">192.168.1.100</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">2026-02-04 09:15:42</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            BOOK_ADD
                          </span>
                        </td>
                        <td className="p-3">mulugeta.bekele@mwu.edu.et</td>
                        <td className="p-3">Added new book: "Introduction to Computer Science"</td>
                        <td className="p-3 text-sm">192.168.1.50</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">2026-02-04 08:30:15</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            BORROW
                          </span>
                        </td>
                        <td className="p-3">hanan.mohammed@student.mwu.edu.et</td>
                        <td className="p-3">Borrowed book: "Data Structures and Algorithms"</td>
                        <td className="p-3 text-sm">192.168.1.100</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'create-backup' && user?.role === 'admin' && (
              <div className="max-w-2xl">
                <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-400 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">💾 System Backup</h4>
                  <p className="text-sm text-blue-700">
                    Create a complete backup of the library system including database and files.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backup Type
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="full">Full System Backup</option>
                      <option value="database">Database Only</option>
                      <option value="files">Files Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Backup Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Weekly backup before system update"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={() => {
                        if (confirm('Create system backup? This may take several minutes.')) {
                          alert('✅ Backup created successfully!\n\nBackup saved to: /backups/library_backup_' + new Date().toISOString().split('T')[0] + '.zip')
                        }
                      }}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      💾 Create Backup
                    </button>
                    <button
                      onClick={() => setActiveView('overview')}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="mt-8 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <h5 className="font-medium text-yellow-800 mb-2">⚠️ Backup Information</h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Backups are stored in the /backups directory</li>
                    <li>• Full backups include database, uploaded files, and configuration</li>
                    <li>• Backup process may temporarily slow down the system</li>
                    <li>• Recommended to perform backups during low usage hours</li>
                  </ul>
                </div>
              </div>
            )}

            {activeView === 'restore-system' && user?.role === 'admin' && (
              <div className="max-w-2xl">
                <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-400 mb-6">
                  <h4 className="font-semibold text-red-800 mb-2">🔄 System Restore</h4>
                  <p className="text-sm text-red-700">
                    ⚠️ WARNING: This will overwrite current system data with backup data. This action cannot be undone!
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Backup File
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select a backup file...</option>
                      <option value="backup1">library_backup_2026-02-03.zip (Full Backup - 45MB)</option>
                      <option value="backup2">library_backup_2026-02-01.zip (Full Backup - 42MB)</option>
                      <option value="backup3">library_backup_2026-01-28.zip (Database Only - 5MB)</option>
                    </select>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <h5 className="font-medium text-yellow-800 mb-2">📋 Pre-Restore Checklist</h5>
                    <div className="space-y-2 text-sm text-yellow-700">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        I have notified all users about the system maintenance
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        I have created a current backup before restoring
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        I understand this will overwrite all current data
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={() => {
                        if (confirm('⚠️ FINAL WARNING: This will permanently overwrite all current system data with the selected backup. Are you absolutely sure you want to proceed?')) {
                          alert('🔄 System restore initiated!\n\nThe system will be unavailable during the restore process. Please wait...')
                        }
                      }}
                      className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      🔄 Restore System
                    </button>
                    <button
                      onClick={() => setActiveView('overview')}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Report Views - Librarian */}
            {activeView === 'monthly-report' && user?.role === 'librarian' && (
              <div>
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Month
                    </label>
                    <input
                      type="month"
                      defaultValue={new Date().toISOString().slice(0, 7)}
                      className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        alert(`📊 Monthly Report Generated for ${month}!\n\n📈 Report Summary:\n• Total Books Borrowed: 15\n• Total Books Returned: 12\n• Overdue Books: 3\n• New Registrations: 5\n• Most Popular Book: "Introduction to Computer Science"\n• Peak Borrowing Day: Monday\n\n📄 Full report has been generated and saved to reports folder.`)
                      }}
                      className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      📊 Generate Report
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-400">
                    <div className="text-3xl font-bold text-blue-600 mb-2">15</div>
                    <div className="text-sm text-blue-700">Books Borrowed</div>
                    <div className="text-xs text-blue-600 mt-1">This Month</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-400">
                    <div className="text-3xl font-bold text-green-600 mb-2">12</div>
                    <div className="text-sm text-green-700">Books Returned</div>
                    <div className="text-xs text-green-600 mt-1">This Month</div>
                  </div>
                  <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-400">
                    <div className="text-3xl font-bold text-red-600 mb-2">3</div>
                    <div className="text-sm text-red-700">Overdue Books</div>
                    <div className="text-xs text-red-600 mt-1">Current</div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-400">
                    <div className="text-3xl font-bold text-purple-600 mb-2">5</div>
                    <div className="text-sm text-purple-700">New Members</div>
                    <div className="text-xs text-purple-600 mt-1">This Month</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="text-lg font-semibold mb-4">📚 Most Popular Books</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Introduction to Computer Science</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">8 borrows</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Data Structures and Algorithms</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">6 borrows</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Database Management Systems</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">4 borrows</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="text-lg font-semibold mb-4">📈 Daily Activity</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Monday</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '80%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">8</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tuesday</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">6</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Wednesday</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '40%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">4</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => alert('📄 Report exported to PDF successfully!\n\nFile saved as: Monthly_Report_' + new Date().toISOString().slice(0, 7) + '.pdf')}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    📄 Export to PDF
                  </button>
                  <button
                    onClick={() => alert('📊 Report exported to Excel successfully!\n\nFile saved as: Monthly_Report_' + new Date().toISOString().slice(0, 7) + '.xlsx')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    📊 Export to Excel
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('📧 Send monthly report via email?\n\nReport will be sent to all administrators and librarians.')) {
                        alert('📧 Monthly report sent successfully!\n\nRecipients:\n• sisay.tadesse@mwu.edu.et\n• mulugeta.bekele@mwu.edu.et')
                      }
                    }}
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    📧 Email Report
                  </button>
                </div>
              </div>
            )}

            {activeView === 'member-report' && user?.role === 'librarian' && (
              <div>
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Type
                    </label>
                    <select className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="all">All Members</option>
                      <option value="active">Active Members</option>
                      <option value="students">Students Only</option>
                      <option value="overdue">Members with Overdue Books</option>
                      <option value="penalties">Members with Penalties</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <select className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="current">Current Month</option>
                      <option value="last30">Last 30 Days</option>
                      <option value="last90">Last 90 Days</option>
                      <option value="year">This Year</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        alert('👥 Member Report Generated!\n\n📈 Report Summary:\n• Total Members: 25\n• Active Members: 23\n• Students: 20\n• Staff: 3\n• Members with Overdue Books: 3\n• Members with Penalties: 2\n• Most Active Member: Hanan Mohammed (8 books borrowed)\n• Average Books per Member: 2.4\n\n📄 Full report has been generated and saved.')
                      }}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      👥 Generate Report
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-400">
                    <div className="text-3xl font-bold text-blue-600 mb-2">25</div>
                    <div className="text-sm text-blue-700">Total Members</div>
                    <div className="text-xs text-blue-600 mt-1">All Time</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-400">
                    <div className="text-3xl font-bold text-green-600 mb-2">23</div>
                    <div className="text-sm text-green-700">Active Members</div>
                    <div className="text-xs text-green-600 mt-1">This Month</div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-400">
                    <div className="text-3xl font-bold text-purple-600 mb-2">20</div>
                    <div className="text-sm text-purple-700">Students</div>
                    <div className="text-xs text-purple-600 mt-1">Registered</div>
                  </div>
                  <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-400">
                    <div className="text-3xl font-bold text-red-600 mb-2">3</div>
                    <div className="text-sm text-red-700">With Overdue</div>
                    <div className="text-xs text-red-600 mt-1">Current</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                    <h4 className="text-lg font-semibold">👥 Member Details</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3">Name</th>
                          <th className="text-left p-3">Email</th>
                          <th className="text-left p-3">Role</th>
                          <th className="text-left p-3">Books Borrowed</th>
                          <th className="text-left p-3">Current Loans</th>
                          <th className="text-left p-3">Overdue</th>
                          <th className="text-left p-3">Penalties</th>
                          <th className="text-left p-3">Last Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">Hanan Mohammed</td>
                          <td className="p-3">hanan.mohammed@student.mwu.edu.et</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              STUDENT
                            </span>
                          </td>
                          <td className="p-3">8</td>
                          <td className="p-3">2</td>
                          <td className="p-3">0</td>
                          <td className="p-3">0 ETB</td>
                          <td className="p-3 text-sm">2026-02-04</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">Tolasa Bekele</td>
                          <td className="p-3">tolasa.bekele@student.mwu.edu.et</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              STUDENT
                            </span>
                          </td>
                          <td className="p-3">5</td>
                          <td className="p-3">1</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              1
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-red-600 font-medium">250 ETB</span>
                          </td>
                          <td className="p-3 text-sm">2026-02-03</td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">Meseret Tadesse</td>
                          <td className="p-3">meseret.tadesse@student.mwu.edu.et</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              STUDENT
                            </span>
                          </td>
                          <td className="p-3">3</td>
                          <td className="p-3">1</td>
                          <td className="p-3">0</td>
                          <td className="p-3">0 ETB</td>
                          <td className="p-3 text-sm">2026-02-02</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => alert('📄 Member report exported to PDF successfully!\n\nFile saved as: Member_Report_' + new Date().toISOString().slice(0, 10) + '.pdf')}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    📄 Export to PDF
                  </button>
                  <button
                    onClick={() => alert('📊 Member report exported to Excel successfully!\n\nFile saved as: Member_Report_' + new Date().toISOString().slice(0, 10) + '.xlsx')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    📊 Export to Excel
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('📧 Send member report via email?\n\nReport will be sent to administrators.')) {
                        alert('📧 Member report sent successfully!\n\nRecipients:\n• sisay.tadesse@mwu.edu.et')
                      }
                    }}
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    📧 Email Report
                  </button>
                </div>
              </div>
            )}

            {/* Admin Report Views */}
            {activeView === 'view-reports' && user?.role === 'admin' && (
              <div>
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800">📊 Reports Inbox</h4>
                    <p className="text-sm text-gray-600">Reports submitted by librarians for administrative review</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => alert('📧 All unread reports marked as read!')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Mark All Read
                    </button>
                    <button
                      onClick={() => setActiveView('report-archive')}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      View Archive
                    </button>
                  </div>
                </div>

                {/* Report Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <div className="text-2xl font-bold text-blue-600">5</div>
                    <div className="text-sm text-blue-700">New Reports</div>
                    <div className="text-xs text-blue-600">This Week</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                    <div className="text-2xl font-bold text-purple-600">12</div>
                    <div className="text-sm text-purple-700">Total Reports</div>
                    <div className="text-xs text-purple-600">This Month</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-green-700">Monthly Reports</div>
                    <div className="text-xs text-green-600">Received</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <div className="text-2xl font-bold text-yellow-600">4</div>
                    <div className="text-sm text-yellow-700">Member Reports</div>
                    <div className="text-xs text-yellow-600">Received</div>
                  </div>
                </div>

                {/* Reports List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                    <h4 className="text-lg font-semibold">📋 Recent Reports</h4>
                  </div>
                  <div className="divide-y">
                    {/* Monthly Report */}
                    <div className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                              📊 MONTHLY REPORT
                            </span>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                              ● NEW
                            </span>
                          </div>
                          <h5 className="text-lg font-semibold text-gray-900 mb-1">
                            February 2026 Library Activity Report
                          </h5>
                          <p className="text-sm text-gray-600 mb-2">
                            Submitted by: <strong>Ato Mulugeta Bekele</strong> (Librarian)
                          </p>
                          <p className="text-sm text-gray-500">
                            📈 Summary: 15 books borrowed, 12 returned, 3 overdue, 5 new registrations
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">Feb 5, 2026 - 2:30 PM</div>
                          <div className="space-x-2">
                            <button
                              onClick={() => {
                                alert('📊 February 2026 Monthly Report\n\n📈 Key Metrics:\n• Books Borrowed: 15\n• Books Returned: 12\n• Overdue Books: 3\n• New Registrations: 5\n• Most Popular: "Introduction to Computer Science"\n• Peak Day: Monday\n\n📄 Full report available for download.')
                              }}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                              👁️ View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Member Report */}
                    <div className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              👥 MEMBER REPORT
                            </span>
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                              ● NEW
                            </span>
                          </div>
                          <h5 className="text-lg font-semibold text-gray-900 mb-1">
                            Active Members Analysis - February 2026
                          </h5>
                          <p className="text-sm text-gray-600 mb-2">
                            Submitted by: <strong>Ato Mulugeta Bekele</strong> (Librarian)
                          </p>
                          <p className="text-sm text-gray-500">
                            👥 Summary: 25 total members, 23 active, 3 with overdue books, 2 with penalties
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">Feb 5, 2026 - 1:15 PM</div>
                          <div className="space-x-2">
                            <button
                              onClick={() => {
                                alert('👥 February 2026 Member Report\n\n📈 Member Statistics:\n• Total Members: 25\n• Active Members: 23\n• Students: 20\n• Staff: 3\n• With Overdue: 3\n• With Penalties: 2\n• Most Active: Hanan Mohammed\n\n📄 Detailed member analysis available.')
                              }}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                              👁️ View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Previous Reports */}
                    <div className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                              📊 MONTHLY REPORT
                            </span>
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                              READ
                            </span>
                          </div>
                          <h5 className="text-lg font-semibold text-gray-900 mb-1">
                            January 2026 Library Activity Report
                          </h5>
                          <p className="text-sm text-gray-600 mb-2">
                            Submitted by: <strong>Ato Mulugeta Bekele</strong> (Librarian)
                          </p>
                          <p className="text-sm text-gray-500">
                            📈 Summary: 18 books borrowed, 16 returned, 2 overdue, 3 new registrations
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">Feb 1, 2026 - 4:45 PM</div>
                          <div className="space-x-2">
                            <button
                              onClick={() => {
                                alert('📊 January 2026 Monthly Report\n\n📈 Key Metrics:\n• Books Borrowed: 18\n• Books Returned: 16\n• Overdue Books: 2\n• New Registrations: 3\n• Most Popular: "Database Systems"\n• Peak Day: Wednesday\n\n📄 Full report available for download.')
                              }}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                            >
                              👁️ View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'report-archive' && user?.role === 'admin' && (
              <div>
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800">📁 Report Archive</h4>
                    <p className="text-sm text-gray-600">Historical reports and archived submissions</p>
                  </div>
                  <div className="flex space-x-2">
                    <select className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
                      <option value="all">All Reports</option>
                      <option value="monthly">Monthly Reports</option>
                      <option value="member">Member Reports</option>
                    </select>
                    <select className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                </div>

                {/* Archive Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-400">
                    <div className="text-2xl font-bold text-indigo-600">48</div>
                    <div className="text-sm text-indigo-700">Total Archived</div>
                    <div className="text-xs text-indigo-600">All Time</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                    <div className="text-2xl font-bold text-purple-600">36</div>
                    <div className="text-sm text-purple-700">Monthly Reports</div>
                    <div className="text-xs text-purple-600">Archived</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-blue-700">Member Reports</div>
                    <div className="text-xs text-blue-600">Archived</div>
                  </div>
                </div>

                {/* Archive Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b">
                    <h4 className="text-lg font-semibold">📋 Archived Reports</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3">Report Type</th>
                          <th className="text-left p-3">Title</th>
                          <th className="text-left p-3">Submitted By</th>
                          <th className="text-left p-3">Date</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                              Monthly
                            </span>
                          </td>
                          <td className="p-3 font-medium">December 2025 Activity Report</td>
                          <td className="p-3">Ato Mulugeta Bekele</td>
                          <td className="p-3 text-sm">Jan 2, 2026</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Reviewed
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="space-x-2">
                              <button
                                onClick={() => alert('📊 December 2025 Report\n\nViewing archived monthly report...')}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              Member
                            </span>
                          </td>
                          <td className="p-3 font-medium">Q4 2025 Member Analysis</td>
                          <td className="p-3">Ato Mulugeta Bekele</td>
                          <td className="p-3 text-sm">Dec 28, 2025</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Reviewed
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="space-x-2">
                              <button
                                onClick={() => alert('👥 Q4 2025 Member Report\n\nViewing archived member analysis...')}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                              Monthly
                            </span>
                          </td>
                          <td className="p-3 font-medium">November 2025 Activity Report</td>
                          <td className="p-3">Ato Mulugeta Bekele</td>
                          <td className="p-3 text-sm">Dec 1, 2025</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Reviewed
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="space-x-2">
                              <button
                                onClick={() => alert('📊 November 2025 Report\n\nViewing archived monthly report...')}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => alert('📊 Bulk export initiated!\n\nExporting all reports from selected filters...')}
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    📊 Bulk Export
                  </button>
                  <button
                    onClick={() => setActiveView('view-reports')}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Back to Inbox
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddBookForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">📚 Add New Book</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const bookData = {
                title: formData.get('title'),
                author: formData.get('author'),
                isbn: formData.get('isbn'),
                category_id: formData.get('category_id'),
                quantity: formData.get('quantity'),
                description: formData.get('description'),
                publication_year: formData.get('publication_year'),
                publisher: formData.get('publisher')
              }
              handleAddBook(bookData)
            }} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter book title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    name="author"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter author name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ISBN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category_id"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">Literature</option>
                    <option value="2">Science</option>
                    <option value="3">Technology</option>
                    <option value="4">History</option>
                    <option value="5">Biography</option>
                    <option value="6">Education</option>
                    <option value="7">Business</option>
                    <option value="8">Health</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    defaultValue="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    name="publication_year"
                    min="1900"
                    max="2030"
                    defaultValue={new Date().getFullYear()}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publisher
                </label>
                <input
                  type="text"
                  name="publisher"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter publisher name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter book description"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  📚 Add Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBookForm(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Book Modal */}
      {showUpdateBookForm && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">✏️ Update Book</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const bookData = {
                book_id: selectedBook.id,
                title: formData.get('title'),
                author: formData.get('author'),
                isbn: formData.get('isbn'),
                category_id: formData.get('category_id'),
                quantity: formData.get('quantity'),
                description: formData.get('description'),
                publication_year: formData.get('publication_year'),
                publisher: formData.get('publisher')
              }
              handleUpdateBook(bookData)
            }} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={selectedBook.title}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    name="author"
                    required
                    defaultValue={selectedBook.author}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    required
                    defaultValue={selectedBook.isbn}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    defaultValue={selectedBook.quantity}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ✏️ Update Book
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete "${selectedBook.title}"?\n\nThis action cannot be undone and will permanently remove this book from the system.`)) {
                      try {
                        const response = await api.post('/books/delete', {
                          book_id: selectedBook.id,
                          librarian_id: user?.id,
                          librarian_email: user?.email,
                          librarian_name: user?.name
                        })
                        
                        alert(`🗑️ ${response.data.message}`)
                        setShowUpdateBookForm(false)
                        setSelectedBook(null)
                        // Refresh books list
                        await loadInitialData()
                        await loadAvailableBooks()
                      } catch (error: any) {
                        alert(`❌ ${error.response?.data?.message || 'Error deleting book'}`)
                      }
                    }
                  }}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  🗑️ Delete Book
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateBookForm(false)
                    setSelectedBook(null)
                  }}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}