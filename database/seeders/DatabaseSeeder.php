<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Book;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default users
        User::create([
            'name' => 'Chaltu Daba Gemechu',
            'email' => 'sisay.tadesse@mwu.edu.et',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'student_id' => null,
            'phone' => '+251911000001'
        ]);

        User::create([
            'name' => 'Tolasa Bekele Hundessa',
            'email' => 'mulugeta.bekele@mwu.edu.et',
            'password' => Hash::make('password123'),
            'role' => 'librarian',
            'student_id' => null,
            'phone' => '+251911000002'
        ]);

        User::create([
            'name' => 'Bontu Girma Negassa',
            'email' => 'hanan.mohammed@student.mwu.edu.et',
            'password' => Hash::make('password123'),
            'role' => 'student',
            'student_id' => 'STU001',
            'phone' => '+251911000003'
        ]);

        // Create categories
        $categories = [
            ['name' => 'Literature', 'description' => 'Language and literature books'],
            ['name' => 'Science', 'description' => 'Mathematics, Physics, Chemistry, and other sciences'],
            ['name' => 'Technology', 'description' => 'Computer Science, Engineering, and IT books'],
            ['name' => 'History', 'description' => 'Historical books and documents'],
            ['name' => 'Biography', 'description' => 'Biographical books'],
            ['name' => 'Education', 'description' => 'Educational and academic textbooks'],
            ['name' => 'Business', 'description' => 'Business and management books'],
            ['name' => 'Health', 'description' => 'Health and medical books']
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        // Create sample books
        $books = [
            [
                'title' => 'Afaan Oromoo: Seerluga fi Barreeffama',
                'author' => 'Baqqalaa Garbaa Hundessaa',
                'isbn' => '9780743273565',
                'category_id' => 6,
                'quantity' => 5,
                'available_quantity' => 3,
                'description' => 'Comprehensive guide to Afaan Oromoo grammar and literature',
                'publication_year' => 2020,
                'publisher' => 'Finfinnee University Press'
            ],
            [
                'title' => 'Mathematics: Calculus and Linear Algebra',
                'author' => 'Dereje Hailu Wayessa',
                'isbn' => '9780132350884',
                'category_id' => 2,
                'quantity' => 3,
                'available_quantity' => 2,
                'description' => 'Advanced mathematics for engineering students',
                'publication_year' => 2019,
                'publisher' => 'Oromia Science Academy'
            ],
            [
                'title' => 'Chemistry: Organic and Inorganic Compounds',
                'author' => 'Gemechu Megersa Daba',
                'isbn' => '9780553380163',
                'category_id' => 2,
                'quantity' => 4,
                'available_quantity' => 4,
                'description' => 'Comprehensive chemistry textbook for university students',
                'publication_year' => 2021,
                'publisher' => 'Oromia Science Academy'
            ],
            [
                'title' => 'Computer Organization and Architecture (COA)',
                'author' => 'Almaz Negassa Hundessa',
                'isbn' => '9780061120084',
                'category_id' => 3,
                'quantity' => 6,
                'available_quantity' => 5,
                'description' => 'Computer hardware and system architecture fundamentals',
                'publication_year' => 2022,
                'publisher' => 'Oromia Technology Institute'
            ],
            [
                'title' => 'Software Engineering: Design and Development',
                'author' => 'Bultum Chala Regassa',
                'isbn' => '9781451648539',
                'category_id' => 3,
                'quantity' => 2,
                'available_quantity' => 1,
                'description' => 'Modern software development methodologies and practices',
                'publication_year' => 2023,
                'publisher' => 'Adama Institute of Technology'
            ],
            [
                'title' => 'Data Structures and Algorithms',
                'author' => 'Wakjira Tolessa Gemechu',
                'isbn' => '9780262033848',
                'category_id' => 3,
                'quantity' => 4,
                'available_quantity' => 3,
                'description' => 'Fundamental data structures and algorithmic problem solving',
                'publication_year' => 2022,
                'publisher' => 'Adama Institute of Technology'
            ],
            [
                'title' => 'Physics: Mechanics and Thermodynamics',
                'author' => 'Hirpha Gutema Wayessa',
                'isbn' => '9780062316097',
                'category_id' => 2,
                'quantity' => 3,
                'available_quantity' => 2,
                'description' => 'Classical physics principles for engineering students',
                'publication_year' => 2020,
                'publisher' => 'Oromia Science Academy'
            ],
            [
                'title' => 'Business Management and Entrepreneurship',
                'author' => 'Meseret Daba Negassa',
                'isbn' => '9780307887894',
                'category_id' => 7,
                'quantity' => 2,
                'available_quantity' => 2,
                'description' => 'Modern business practices and startup methodologies',
                'publication_year' => 2021,
                'publisher' => 'Ambo Business School Press'
            ]
        ];

        foreach ($books as $book) {
            Book::create($book);
        }
    }
}