<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // A+, A, B, C, F
            $table->decimal('point', 4, 2); // 4.00, 3.50, etc.
            $table->decimal('mark_from', 5, 2); // 90.00
            $table->decimal('mark_to', 5, 2); // 100.00
            $table->string('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
