<?php

namespace Database\Seeders;

use App\Models\ParentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ParentProfileSeeder extends Seeder
{
    public function run(): void
    {
        $david = User::updateOrCreate(
            ['email' => 'david.reynolds@gmail.com'],
            [
                'name'     => 'David Reynolds',
                'password' => Hash::make('parent123'),
                'role'     => 'parent',
                'phone'    => '+1 (555) 441-9081',
                'gender'   => 'male',
                'status'   => 'active',
                'address'  => '320 Highland Park Way, San Francisco, CA',
            ]
        );

        ParentProfile::updateOrCreate(
            ['user_id' => $david->id],
            [
                'occupation'   => 'Lead Solutions Architect',
                'relationship' => 'Father',
            ]
        );
    }
}
