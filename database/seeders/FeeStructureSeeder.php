<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\FeeStructure;
use App\Models\FeeType;
use App\Models\SchoolClass;
use Illuminate\Database\Seeder;

class FeeStructureSeeder extends Seeder
{
    public function run(): void
    {
        $class10 = SchoolClass::where('name', 'Grade 10')->first();
        $year = AcademicYear::where('is_current', true)->first();
        $tuition = FeeType::where('name', 'Annual Tuition Fee')->first();
        $stem = FeeType::where('name', 'STEM & Robotics Lab Fee')->first();

        if ($class10 && $year && $tuition) {
            FeeStructure::updateOrCreate(
                [
                    'school_class_id'  => $class10->id,
                    'academic_year_id' => $year->id,
                    'fee_type_id'      => $tuition->id,
                ],
                [
                    'amount'   => 2400.00,
                    'due_date' => '2026-11-01',
                ]
            );
        }

        if ($class10 && $year && $stem) {
            FeeStructure::updateOrCreate(
                [
                    'school_class_id'  => $class10->id,
                    'academic_year_id' => $year->id,
                    'fee_type_id'      => $stem->id,
                ],
                [
                    'amount'   => 350.00,
                    'due_date' => '2026-11-01',
                ]
            );
        }
    }
}
