<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        if ($admin) {
            Announcement::updateOrCreate(
                ['title' => 'Upcoming STEM & Innovation Fair 2026'],
                [
                    'content'         => 'All high school classes are invited to showcase innovative engineering and software projects.',
                    'target_audience' => 'all',
                    'publish_date'    => '2026-10-17',
                    'status'          => 'published',
                    'created_by'      => $admin->id,
                ]
            );

            Announcement::updateOrCreate(
                ['title' => 'Midterm Examination Schedule Released'],
                [
                    'content'         => 'The official datesheet for the upcoming semester examinations has been published.',
                    'target_audience' => 'students',
                    'publish_date'    => '2026-10-15',
                    'status'          => 'published',
                    'created_by'      => $admin->id,
                ]
            );
        }
    }
}
