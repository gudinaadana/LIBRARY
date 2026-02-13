<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BorrowController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Book routes
    Route::apiResource('books', BookController::class);
    Route::get('/books/search', [BookController::class, 'search']);
    
    // Category routes
    Route::apiResource('categories', CategoryController::class);
    
    // Borrow routes
    Route::get('/borrows', [BorrowController::class, 'index']);
    Route::post('/borrows', [BorrowController::class, 'store']);
    Route::post('/borrows/return', [BorrowController::class, 'return']);
    Route::post('/borrows/force-return', [BorrowController::class, 'forceReturn']);
    Route::get('/borrows/user/{userId}', [BorrowController::class, 'userBorrows']);
    Route::get('/borrows/overdue', [BorrowController::class, 'overdue']);
    Route::get('/borrows/notifications', [BorrowController::class, 'notifications']);
});

// Fallback route for SPA
Route::fallback(function () {
    return response()->json(['message' => 'API endpoint not found'], 404);
});