<?php

namespace Database\Seeders;

use App\Models\Grade;
use Illuminate\Database\Seeder;

class GradeSeeder extends Seeder
{
    public function run(): void
    {
        $grades = [
            ['name' => 'A+', 'mark_from' => 95, 'mark_to' => 100, 'point' => 4.0, 'remarks' => 'Outstanding Performance'],
            ['name' => 'A',  'mark_from' => 85, 'mark_to' => 94,  'point' => 3.8, 'remarks' => 'Excellent'],
            ['name' => 'B',  'mark_from' => 75, 'mark_to' => 84,  'point' => 3.0, 'remarks' => 'Good'],
            ['name' => 'C',  'mark_from' => 60, 'mark_to' => 74,  'point' => 2.0, 'remarks' => 'Satisfactory'],
            ['name' => 'F',  'mark_from' => 0,  'mark_to' => 59,  'point' => 0.0, 'remarks' => 'Needs Remediation'],
        ];

        foreach ($grades as $g) {
            Grade::updateOrCreate(['name' => $g['name']], $g);
        }
    }
}
