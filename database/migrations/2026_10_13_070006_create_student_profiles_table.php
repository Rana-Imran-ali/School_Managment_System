<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('parent_profiles')->nullOnDelete();
            $table->foreignId('current_class_id')->nullable()->constrained('school_classes')->nullOnDelete();
            $table->foreignId('current_section_id')->nullable()->constrained('sections')->nullOnDelete();
            $table->string('admission_number')->unique();
            $table->string('roll_number')->nullable();
            $table->date('admission_date')->nullable();
            $table->string('blood_group')->nullable();
            $table->string('religion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
