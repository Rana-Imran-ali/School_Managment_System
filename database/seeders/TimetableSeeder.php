<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Period;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\Timetable;
use Illuminate\Database\Seeder;

class TimetableSeeder extends Seeder
{
    public function run(): void
    {
        $class10 = SchoolClass::where('name', 'Grade 10')->first();
        $secA = Section::where('school_class_id', $class10?->id)->where('name', 'A')->first();
        $math = Subject::where('code', 'MATH-101')->first();
        $cs = Subject::where('code', 'CS-301')->first();
        $sarah = TeacherProfile::first();
        $p1 = Period::where('name', 'Period 1')->first();
        $p2 = Period::where('name', 'Period 2')->first();
        $year = AcademicYear::where('is_current', true)->first();

        if ($class10 && $secA && $math && $sarah && $p1 && $year) {
            Timetable::updateOrCreate(
                [
                    'school_class_id' => $class10->id,
                    'section_id'      => $secA->id,
                    'period_id'       => $p1->id,
                    'day_of_week'     => 'monday',
                ],
                [
                    'subject_id'         => $math->id,
                    'teacher_profile_id' => $sarah->id,
                    'academic_year_id'   => $year->id,
                    'room_number'        => 'Lab 301',
                ]
            );
        }

        if ($class10 && $secA && $cs && $sarah && $p2 && $year) {
            Timetable::updateOrCreate(
                [
                    'school_class_id' => $class10->id,
                    'section_id'      => $secA->id,
                    'period_id'       => $p2->id,
                    'day_of_week'     => 'monday',
                ],
                [
                    'subject_id'         => $cs->id,
                    'teacher_profile_id' => $sarah->id,
                    'academic_year_id'   => $year->id,
                    'room_number'        => 'CS Lab 2',
                ]
            );
        }
    }
}
