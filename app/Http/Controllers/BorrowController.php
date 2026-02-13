<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Borrow;
use App\Models\Book;
use App\Models\User;
use Carbon\Carbon;

class BorrowController extends Controller
{
    public function index()
    {
        $borrows = Borrow::with(['user', 'book'])
                         ->orderBy('created_at', 'desc')
                         ->paginate(10);
        
        return response()->json($borrows);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'book_id' => 'required|exists:books,id'
        ]);

        $book = Book::findOrFail($request->book_id);
        $user = User::findOrFail($request->user_id);

        // Check if book is available
        if ($book->available_quantity <= 0) {
            return response()->json([
                'message' => 'Book is not available for borrowing'
            ], 400);
        }

        // Check if user already has this book borrowed
        $existingBorrow = Borrow::where('user_id', $request->user_id)
                               ->where('book_id', $request->book_id)
                               ->whereIn('status', ['borrowed', 'overdue'])
                               ->first();

        if ($existingBorrow) {
            return response()->json([
                'message' => 'User already has this book borrowed'
            ], 400);
        }

        // Check user's borrowing limit (max 5 books)
        $activeBorrows = Borrow::where('user_id', $request->user_id)
                              ->whereIn('status', ['borrowed', 'overdue'])
                              ->count();

        if ($activeBorrows >= 5) {
            return response()->json([
                'message' => 'User has reached maximum borrowing limit (5 books)'
            ], 400);
        }

        // Create borrow record
        $borrow = Borrow::create([
            'user_id' => $request->user_id,
            'book_id' => $request->book_id,
            'borrowed_at' => now(),
            'due_date' => now()->addDays(14), // 14 days borrowing period
            'status' => 'borrowed'
        ]);

        // Update book availability
        $book->decrement('available_quantity');

        return response()->json([
            'borrow' => $borrow->load(['user', 'book']),
            'message' => 'Book borrowed successfully'
        ], 201);
    }

    public function return(Request $request)
    {
        $request->validate([
            'borrow_id' => 'required|exists:borrows,id'
        ]);

        $borrow = Borrow::with(['book'])->findOrFail($request->borrow_id);

        if ($borrow->status === 'returned') {
            return response()->json([
                'message' => 'Book has already been returned'
            ], 400);
        }

        // Update borrow record
        $borrow->update([
            'returned_at' => now(),
            'status' => 'returned'
        ]);

        // Update book availability
        $borrow->book->increment('available_quantity');

        return response()->json([
            'borrow' => $borrow,
            'message' => 'Book returned successfully'
        ]);
    }

    public function userBorrows(Request $request, $userId)
    {
        $borrows = Borrow::with(['book'])
                         ->where('user_id', $userId)
                         ->orderBy('created_at', 'desc')
                         ->paginate(10);
        
        return response()->json($borrows);
    }

    public function overdue()
    {
        $overdueBorrows = Borrow::with(['user', 'book'])
                               ->where('due_date', '<', now())
                               ->whereIn('status', ['borrowed', 'overdue'])
                               ->get();

        // Update status to overdue
        Borrow::where('due_date', '<', now())
              ->where('status', 'borrowed')
              ->update(['status' => 'overdue']);

        return response()->json($overdueBorrows);
    }

    public function notifications()
    {
        $notifications = [];
        
        // Get all active borrows
        $activeBorrows = Borrow::with(['user', 'book'])
                              ->whereIn('status', ['borrowed', 'overdue'])
                              ->get();

        foreach ($activeBorrows as $borrow) {
            $isOverdue = $borrow->due_date < now();
            $daysDiff = now()->diffInDays($borrow->due_date, false);
            
            $notifications[] = [
                'id' => $borrow->id,
                'type' => $isOverdue ? 'overdue' : 'borrowed',
                'message' => $isOverdue ? 
                    "Book '{$borrow->book->title}' is overdue by " . abs($daysDiff) . " days" :
                    "Book '{$borrow->book->title}' borrowed by {$borrow->user->name}",
                'user_email' => $borrow->user->email,
                'user_name' => $borrow->user->name,
                'book_title' => $borrow->book->title,
                'due_date' => $borrow->due_date,
                'borrowed_at' => $borrow->borrowed_at,
                'is_overdue' => $isOverdue,
                'days_overdue' => $isOverdue ? abs($daysDiff) : 0
            ];
        }

        return response()->json($notifications);
    }

    public function forceReturn(Request $request)
    {
        $request->validate([
            'borrow_id' => 'required|exists:borrows,id'
        ]);

        $borrow = Borrow::with(['book'])->findOrFail($request->borrow_id);

        if ($borrow->status === 'returned') {
            return response()->json([
                'message' => 'Book has already been returned'
            ], 400);
        }

        // Force return (librarian can return overdue books)
        $borrow->update([
            'returned_at' => now(),
            'status' => 'returned'
        ]);

        // Update book availability
        $borrow->book->increment('available_quantity');

        return response()->json([
            'borrow' => $borrow,
            'message' => 'Book force returned successfully'
        ]);
    }
}