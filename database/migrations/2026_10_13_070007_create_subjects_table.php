<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->cascadeOnDelete();
            $table->string('name'); // e.g. Mathematics
            $table->string('code')->nullable(); // e.g. MATH-101
            $table->string('type')->default('theory'); // theory, practical, both
            $table->integer('credit_hours')->default(3);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
