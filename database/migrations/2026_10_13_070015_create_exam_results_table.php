<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('student_profile_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->decimal('marks_obtained', 5, 2);
            $table->decimal('total_marks', 5, 2)->default(100.00);
            $table->foreignId('grade_id')->nullable()->constrained('grades')->nullOnDelete();
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->unique(['exam_id', 'student_profile_id', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_results');
    }
};
