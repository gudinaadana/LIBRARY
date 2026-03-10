# Backend Access Folder

This folder provides quick access to backend commands.

## Quick Commands

### Start Backend Server
```cmd
cd ..
php -S localhost:8000 -t public
```

### Run Migrations
```cmd
cd ..
php artisan migrate
```

### Run Seeders
```cmd
cd ..
php artisan db:seed
```

### Clear Cache
```cmd
cd ..
php artisan cache:clear
php artisan config:clear
```

## Note
The actual Laravel backend files are in the parent directory:
- `/app` - Controllers, Models, etc.
- `/public` - Public files and API
- `/routes` - API routes
- `/database` - Migrations and seeders
- `/config` - Configuration files

This folder is just for convenience to access backend commands.
