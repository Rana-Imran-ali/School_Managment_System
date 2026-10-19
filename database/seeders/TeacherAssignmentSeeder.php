<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\TeacherAssignment;
use App\Models\TeacherProfile;
use Illuminate\Database\Seeder;

class TeacherAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        $sarah = TeacherProfile::first();
        $math = Subject::where('code', 'MATH-101')->first();
        $class10 = SchoolClass::where('name', 'Grade 10')->first();
        $secA = Section::where('school_class_id', $class10?->id)->where('name', 'A')->first();
        $year = AcademicYear::where('is_current', true)->first();

        if ($sarah && $math && $class10 && $secA && $year) {
            TeacherAssignment::updateOrCreate(
                [
                    'teacher_profile_id' => $sarah->id,
                    'subject_id'         => $math->id,
                    'school_class_id'    => $class10->id,
                    'section_id'         => $secA->id,
                    'academic_year_id'   => $year->id,
                ]
            );
        }
    }
}
