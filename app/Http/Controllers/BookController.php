<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use App\Models\Category;

class BookController extends Controller
{
    public function index()
    {
        $books = Book::with('category')->paginate(10);
        return response()->json($books);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'required|string|unique:books',
            'category_id' => 'required|exists:categories,id',
            'quantity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'publication_year' => 'nullable|integer',
            'publisher' => 'nullable|string|max:255'
        ]);

        $book = Book::create([
            'title' => $request->title,
            'author' => $request->author,
            'isbn' => $request->isbn,
            'category_id' => $request->category_id,
            'quantity' => $request->quantity,
            'available_quantity' => $request->quantity,
            'description' => $request->description,
            'publication_year' => $request->publication_year,
            'publisher' => $request->publisher
        ]);

        return response()->json([
            'book' => $book->load('category'),
            'message' => 'Book created successfully'
        ], 201);
    }

    public function show(Book $book)
    {
        return response()->json($book->load('category'));
    }

    public function update(Request $request, Book $book)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'required|string|unique:books,isbn,' . $book->id,
            'category_id' => 'required|exists:categories,id',
            'quantity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'publication_year' => 'nullable|integer',
            'publisher' => 'nullable|string|max:255'
        ]);

        // Update available quantity based on quantity change
        $quantityDiff = $request->quantity - $book->quantity;
        $newAvailableQuantity = $book->available_quantity + $quantityDiff;
        
        $book->update([
            'title' => $request->title,
            'author' => $request->author,
            'isbn' => $request->isbn,
            'category_id' => $request->category_id,
            'quantity' => $request->quantity,
            'available_quantity' => max(0, $newAvailableQuantity),
            'description' => $request->description,
            'publication_year' => $request->publication_year,
            'publisher' => $request->publisher
        ]);

        return response()->json([
            'book' => $book->load('category'),
            'message' => 'Book updated successfully'
        ]);
    }

    public function destroy(Book $book)
    {
        // Check if book has active borrows
        if ($book->borrows()->whereIn('status', ['borrowed', 'overdue'])->exists()) {
            return response()->json([
                'message' => 'Cannot delete book with active borrows'
            ], 400);
        }

        $book->delete();
        
        return response()->json([
            'message' => 'Book deleted successfully'
        ]);
    }

    public function search(Request $request)
    {
        $query = Book::with('category');
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        if ($request->has('available_only') && $request->available_only) {
            $query->where('available_quantity', '>', 0);
        }
        
        $books = $query->paginate(10);
        
        return response()->json($books);
    }
}