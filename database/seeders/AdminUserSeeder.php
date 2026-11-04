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
            ['email' => 'ranaimranali2210@gmail.com'],
            [
                'name'     => 'Alexander Wright',
                'password' => Hash::make('password123'),
                'role'     => 'admin',
                'phone'    => '+92 3039099596',
                'gender'   => 'male',
                'status'   => 'active',
                'address'  => '450 Innovation Blvd, Silicon Valley, CA',
            ]
        );
    }
}
