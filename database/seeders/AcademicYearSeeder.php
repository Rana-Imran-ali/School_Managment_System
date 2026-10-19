<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use Illuminate\Database\Seeder;

class AcademicYearSeeder extends Seeder
{
    public function run(): void
    {
        AcademicYear::updateOrCreate(
            ['name' => '2025-2026'],
            [
                'start_date' => '2025-08-15',
                'end_date'   => '2026-06-15',
                'is_current' => true,
            ]
        );

        AcademicYear::updateOrCreate(
            ['name' => '2024-2025'],
            [
                'start_date' => '2024-08-15',
                'end_date'   => '2025-06-15',
                'is_current' => false,
            ]
        );
    }
}
