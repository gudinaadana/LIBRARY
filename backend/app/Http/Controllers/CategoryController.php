<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('books')->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string'
        ]);

        $category = Category::create([
            'name' => $request->name,
            'description' => $request->description
        ]);

        return response()->json([
            'category' => $category,
            'message' => 'Category created successfully'
        ], 201);
    }

    public function show(Category $category)
    {
        return response()->json($category->loadCount('books'));
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string'
        ]);

        $category->update([
            'name' => $request->name,
            'description' => $request->description
        ]);

        return response()->json([
            'category' => $category,
            'message' => 'Category updated successfully'
        ]);
    }

    public function destroy(Category $category)
    {
        // Check if category has books
        if ($category->books()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with existing books'
            ], 400);
        }

        $category->delete();
        
        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}