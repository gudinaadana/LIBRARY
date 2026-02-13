<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'student_id',
        'phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function borrows()
    {
        return $this->hasMany(Borrow::class);
    }

    public function activeBorrows()
    {
        return $this->hasMany(Borrow::class)->whereIn('status', ['borrowed', 'overdue']);
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isLibrarian()
    {
        return $this->role === 'librarian';
    }

    public function isStudent()
    {
        return $this->role === 'student';
    }
}