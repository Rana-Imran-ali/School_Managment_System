<?php

namespace Database\Seeders;

use App\Models\Period;
use Illuminate\Database\Seeder;

class PeriodSeeder extends Seeder
{
    public function run(): void
    {
        $periods = [
            ['name' => 'Period 1', 'start_time' => '08:30', 'end_time' => '09:20', 'is_break' => false],
            ['name' => 'Period 2', 'start_time' => '09:25', 'end_time' => '10:15', 'is_break' => false],
            ['name' => 'Morning Recess', 'start_time' => '10:15', 'end_time' => '10:35', 'is_break' => true],
            ['name' => 'Period 3', 'start_time' => '10:35', 'end_time' => '11:25', 'is_break' => false],
            ['name' => 'Period 4', 'start_time' => '11:30', 'end_time' => '12:20', 'is_break' => false],
            ['name' => 'Lunch Break', 'start_time' => '12:20', 'end_time' => '13:05', 'is_break' => true],
            ['name' => 'Period 5', 'start_time' => '13:05', 'end_time' => '13:55', 'is_break' => false],
            ['name' => 'Period 6', 'start_time' => '14:00', 'end_time' => '14:50', 'is_break' => false],
        ];

        foreach ($periods as $p) {
            Period::updateOrCreate(['name' => $p['name']], $p);
        }
    }
}
