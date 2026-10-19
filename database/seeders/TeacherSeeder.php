<?php

namespace Database\Seeders;

use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $sarah = User::updateOrCreate(
            ['email' => 'sarah.jenkins@educore.edu'],
            [
                'name'     => 'Dr. Sarah Jenkins',
                'password' => Hash::make('teacher123'),
                'role'     => 'teacher',
                'phone'    => '+1 (555) 349-2041',
                'gender'   => 'female',
                'status'   => 'active',
                'address'  => '88 Meadow Court, Berkeley, CA',
            ]
        );

        TeacherProfile::updateOrCreate(
            ['user_id' => $sarah->id],
            [
                'employee_id'    => 'EMP-T-1001',
                'qualification'  => 'Ph.D. in Applied Mathematics',
                'specialization' => 'Advanced Calculus & Discrete Math',
                'joining_date'   => '2020-08-01',
                'salary'         => 82000,
                'bio'            => '12 years experience in STEM curriculum and competitive mathematics.',
            ]
        );

        $marcus = User::updateOrCreate(
            ['email' => 'marcus.vance@educore.edu'],
            [
                'name'     => 'Prof. Marcus Vance',
                'password' => Hash::make('teacher123'),
                'role'     => 'teacher',
                'phone'    => '+1 (555) 890-1122',
                'gender'   => 'male',
                'status'   => 'active',
                'address'  => '14 Elm Street, Oakland, CA',
            ]
        );

        TeacherProfile::updateOrCreate(
            ['user_id' => $marcus->id],
            [
                'employee_id'    => 'EMP-T-1002',
                'qualification'  => 'M.S. in Computer Science',
                'specialization' => 'Software Engineering & AI',
                'joining_date'   => '2021-09-15',
                'salary'         => 85000,
                'bio'            => 'Software architect passionate about algorithms and fullstack development.',
            ]
        );
    }
}
