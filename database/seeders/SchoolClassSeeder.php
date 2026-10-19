<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use Illuminate\Database\Seeder;

class SchoolClassSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            ['name' => 'Grade 9', 'numeric_name' => 9, 'description' => 'Freshman High School'],
            ['name' => 'Grade 10', 'numeric_name' => 10, 'description' => 'Sophomore High School'],
            ['name' => 'Grade 11', 'numeric_name' => 11, 'description' => 'Junior High School'],
            ['name' => 'Grade 12', 'numeric_name' => 12, 'description' => 'Senior High School'],
        ];

        foreach ($classes as $item) {
            SchoolClass::updateOrCreate(['name' => $item['name']], $item);
        }
    }
}
