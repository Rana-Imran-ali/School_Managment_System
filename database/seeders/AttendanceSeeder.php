<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\StudentProfile;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $students = StudentProfile::all();
        $date = '2026-10-19';

        foreach ($students as $index => $student) {
            $status = ($index === 2) ? 'late' : (($index === 3) ? 'absent' : 'present');
            $remarks = ($index === 2) ? 'Transit delay' : (($index === 3) ? 'Medical appointment' : null);

            Attendance::updateOrCreate(
                [
                    'student_profile_id' => $student->id,
                    'date'               => $date,
                ],
                [
                    'school_class_id' => $student->current_class_id,
                    'section_id'      => $student->current_section_id,
                    'status'          => $status,
                    'remarks'         => $remarks,
                ]
            );
        }
    }
}
