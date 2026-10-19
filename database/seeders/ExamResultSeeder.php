<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\Grade;
use App\Models\StudentProfile;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class ExamResultSeeder extends Seeder
{
    public function run(): void
    {
        $exam = Exam::first();
        $student = StudentProfile::first();
        $math = Subject::where('code', 'MATH-101')->first();
        $cs = Subject::where('code', 'CS-301')->first();
        $gradeA = Grade::where('name', 'A')->first();
        $gradeAPlus = Grade::where('name', 'A+')->first();

        if ($exam && $student && $math) {
            ExamResult::updateOrCreate(
                [
                    'exam_id'            => $exam->id,
                    'student_profile_id' => $student->id,
                    'subject_id'         => $math->id,
                ],
                [
                    'marks_obtained' => 94,
                    'total_marks'    => 100,
                    'grade_id'       => $gradeA?->id,
                    'remarks'        => 'Exceptional analytical proofs',
                ]
            );
        }

        if ($exam && $student && $cs) {
            ExamResult::updateOrCreate(
                [
                    'exam_id'            => $exam->id,
                    'student_profile_id' => $student->id,
                    'subject_id'         => $cs->id,
                ],
                [
                    'marks_obtained' => 98,
                    'total_marks'    => 100,
                    'grade_id'       => $gradeAPlus?->id,
                    'remarks'        => 'Perfect architecture implementation',
                ]
            );
        }
    }
}
