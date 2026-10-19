<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@educore.edu'],
            [
                'name'     => 'Alexander Wright',
                'password' => Hash::make('password123'),
                'role'     => 'admin',
                'phone'    => '+1 (555) 019-2834',
                'gender'   => 'male',
                'status'   => 'active',
                'address'  => '450 Innovation Blvd, Silicon Valley, CA',
            ]
        );
    }
}
