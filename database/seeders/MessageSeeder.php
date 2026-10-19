<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::where('role', 'teacher')->first();
        $parent = User::where('role', 'parent')->first();

        if ($teacher && $parent) {
            Message::updateOrCreate(
                [
                    'sender_id'   => $teacher->id,
                    'receiver_id' => $parent->id,
                    'subject'     => 'Liam’s Outstanding Progress in STEM',
                ],
                [
                    'message' => 'Liam has performed remarkably in advanced mathematics and lab assignments.',
                    'is_read' => true,
                    'read_at' => now(),
                ]
            );
        }
    }
}
