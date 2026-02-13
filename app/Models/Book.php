<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'author',
        'isbn',
        'category_id',
        'quantity',
        'available_quantity',
        'description',
        'publication_year',
        'publisher',
    ];

    protected $casts = [
        'publication_year' => 'integer',
        'quantity' => 'integer',
        'available_quantity' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function borrows()
    {
        return $this->hasMany(Borrow::class);
    }

    public function activeBorrows()
    {
        return $this->hasMany(Borrow::class)->whereIn('status', ['borrowed', 'overdue']);
    }

    public function isAvailable()
    {
        return $this->available_quantity > 0;
    }

    public function getBorrowedQuantityAttribute()
    {
        return $this->quantity - $this->available_quantity;
    }
}