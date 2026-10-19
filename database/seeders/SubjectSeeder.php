<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            ['name' => 'Advanced Mathematics', 'code' => 'MATH-101', 'type' => 'theory', 'credit_hours' => 4],
            ['name' => 'Physics & Laboratory', 'code' => 'PHYS-201', 'type' => 'practical', 'credit_hours' => 4],
            ['name' => 'English Literature', 'code' => 'ENG-102', 'type' => 'theory', 'credit_hours' => 3],
            ['name' => 'Computer Science', 'code' => 'CS-301', 'type' => 'practical', 'credit_hours' => 4],
            ['name' => 'Chemistry', 'code' => 'CHEM-202', 'type' => 'theory', 'credit_hours' => 3],
            ['name' => 'World History', 'code' => 'HIST-105', 'type' => 'theory', 'credit_hours' => 3],
        ];

        foreach ($subjects as $s) {
            Subject::updateOrCreate(['code' => $s['code']], $s);
        }
    }
}
