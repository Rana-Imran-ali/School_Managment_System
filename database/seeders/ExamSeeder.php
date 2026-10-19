<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Exam;
use Illuminate\Database\Seeder;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        $year = AcademicYear::where('is_current', true)->first();

        if ($year) {
            Exam::updateOrCreate(
                ['name' => 'Midterm Assessment 2026'],
                [
                    'academic_year_id' => $year->id,
                    'start_date'       => '2026-10-25',
                    'end_date'         => '2026-10-31',
                    'description'      => 'First Semester',
                ]
            );

            Exam::updateOrCreate(
                ['name' => 'Final Semester Examinations'],
                [
                    'academic_year_id' => $year->id,
                    'start_date'       => '2026-12-10',
                    'end_date'         => '2026-12-20',
                    'description'      => 'Winter Term',
                ]
            );
        }
    }
}
