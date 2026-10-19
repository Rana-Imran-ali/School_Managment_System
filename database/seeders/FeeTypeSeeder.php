<?php

namespace Database\Seeders;

use App\Models\FeeType;
use Illuminate\Database\Seeder;

class FeeTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Annual Tuition Fee', 'description' => 'Core academic instruction and licensing'],
            ['name' => 'STEM & Robotics Lab Fee', 'description' => 'Laboratory apparatus and computing resources'],
            ['name' => 'Library & Digital Resources', 'description' => 'Access to digital journals and library books'],
            ['name' => 'Extracurricular & Athletics', 'description' => 'Sports facility maintenance and tournaments'],
        ];

        foreach ($types as $t) {
            FeeType::updateOrCreate(['name' => $t['name']], $t);
        }
    }
}
