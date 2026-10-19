<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        ActivityLog::create([
            'user_id'    => $admin?->id,
            'activity'   => 'Generated Fee Receipt RCP-2026-0081',
            'module'     => 'Finance',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PostmanRuntime/7.36.0',
        ]);

        ActivityLog::create([
            'user_id'    => $admin?->id,
            'activity'   => 'Committed daily attendance register',
            'module'     => 'Attendance',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ]);
    }
}
