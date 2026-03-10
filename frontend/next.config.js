/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  async rewrites() {
    return [
      {
        source: '/api/register',
        destination: 'http://localhost:8000/api.php/register',
      },
      {
        source: '/api/login',
        destination: 'http://localhost:8000/api.php/login',
      },
      {
        source: '/api/logout',
        destination: 'http://localhost:8000/api.php/logout',
      },
      {
        source: '/api/user',
        destination: 'http://localhost:8000/api.php/user',
      },
      {
        source: '/api/books',
        destination: 'http://localhost:8000/api.php/books',
      },
      {
        source: '/api/books/update',
        destination: 'http://localhost:8000/api.php/books/update',
      },
      {
        source: '/api/borrows',
        destination: 'http://localhost:8000/api.php/borrows',
      },
      {
        source: '/api/borrows/return',
        destination: 'http://localhost:8000/api.php/return',
      },
      {
        source: '/api/renew',
        destination: 'http://localhost:8000/api.php/renew',
      },
      {
        source: '/api/borrows/notifications',
        destination: 'http://localhost:8000/api.php/notifications',
      },
      {
        source: '/api/activities',
        destination: 'http://localhost:8000/api.php/activities',
      },
      {
        source: '/api/librarian-notifications',
        destination: 'http://localhost:8000/api.php/librarian-notifications',
      },
      {
        source: '/api/student-summary',
        destination: 'http://localhost:8000/api.php/student-summary',
      },
      {
        source: '/api/penalties',
        destination: 'http://localhost:8000/api.php/penalties',
      },
      {
        source: '/api/user-status',
        destination: 'http://localhost:8000/api.php/user-status',
      },
      {
        source: '/api/system-activities',
        destination: 'http://localhost:8000/api.php/system-activities',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api.php/:path*',
      },
    ]
  },
}

module.exports = nextConfig