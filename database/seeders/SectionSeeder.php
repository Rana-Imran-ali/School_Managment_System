<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Section;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $classes = SchoolClass::all();

        foreach ($classes as $class) {
            Section::updateOrCreate(
                ['school_class_id' => $class->id, 'name' => 'A'],
                ['capacity' => 35]
            );

            Section::updateOrCreate(
                ['school_class_id' => $class->id, 'name' => 'B'],
                ['capacity' => 35]
            );
        }
    }
}
