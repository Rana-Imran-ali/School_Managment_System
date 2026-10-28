<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * FLAW 6 fix: Convert the users.role column from a plain VARCHAR to a
 * database-level ENUM constraint so no arbitrary role values can ever
 * be stored, even via direct DB inserts or seeder bugs.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Ensure no out-of-range values exist before altering
        DB::table('users')
            ->whereNotIn('role', ['admin', 'teacher', 'student', 'parent', 'staff'])
            ->update(['role' => 'student']);

        // Step 2: Alter the column to ENUM (SQLite-safe approach via raw SQL)
        // For MySQL/MariaDB:
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','teacher','student','parent','staff') NOT NULL DEFAULT 'student'");
    }

    public function down(): void
    {
        // Revert to plain string if rolling back
        DB::statement("ALTER TABLE users MODIFY COLUMN role VARCHAR(255) NOT NULL DEFAULT 'student'");
    }
};
