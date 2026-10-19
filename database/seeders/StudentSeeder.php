<?php

namespace Database\Seeders;

use App\Models\ParentProfile;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $class10 = SchoolClass::where('name', 'Grade 10')->first();
        $secA = Section::where('school_class_id', $class10?->id)->where('name', 'A')->first();
        $parent = ParentProfile::first();

        $students = [
            [
                'name' => 'Liam Reynolds',
                'email' => 'liam.reynolds@student.educore.edu',
                'admission_number' => 'ADM-2024-001',
                'roll_number' => '10-A-01',
                'gender' => 'male',
                'blood_group' => 'O+',
                'parent_id' => $parent?->id,
            ],
            [
                'name' => 'Sophia Patel',
                'email' => 'sophia.patel@student.educore.edu',
                'admission_number' => 'ADM-2024-002',
                'roll_number' => '10-A-02',
                'gender' => 'female',
                'blood_group' => 'B+',
                'parent_id' => $parent?->id,
            ],
            [
                'name' => 'Ethan Chen',
                'email' => 'ethan.chen@student.educore.edu',
                'admission_number' => 'ADM-2024-003',
                'roll_number' => '10-A-03',
                'gender' => 'male',
                'blood_group' => 'A+',
                'parent_id' => null,
            ],
            [
                'name' => 'Emma Watson',
                'email' => 'emma.watson@student.educore.edu',
                'admission_number' => 'ADM-2024-004',
                'roll_number' => '10-A-04',
                'gender' => 'female',
                'blood_group' => 'AB-',
                'parent_id' => null,
            ],
        ];

        foreach ($students as $st) {
            $user = User::updateOrCreate(
                ['email' => $st['email']],
                [
                    'name'     => $st['name'],
                    'password' => Hash::make('student123'),
                    'role'     => 'student',
                    'gender'   => $st['gender'],
                    'status'   => 'active',
                ]
            );

            StudentProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'admission_number'   => $st['admission_number'],
                    'roll_number'        => $st['roll_number'],
                    'current_class_id'   => $class10?->id,
                    'current_section_id' => $secA?->id,
                    'parent_id'          => $st['parent_id'],
                    'blood_group'        => $st['blood_group'],
                    'admission_date'     => '2024-08-10',
                ]
            );
        }
    }
}
