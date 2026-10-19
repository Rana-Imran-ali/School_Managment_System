<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database in dependency order.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            AcademicYearSeeder::class,
            SchoolClassSeeder::class,
            SectionSeeder::class,
            PeriodSeeder::class,
            SubjectSeeder::class,
            GradeSeeder::class,
            FeeTypeSeeder::class,
            TeacherSeeder::class,
            ParentProfileSeeder::class,
            StudentSeeder::class,
            TeacherAssignmentSeeder::class,
            TimetableSeeder::class,
            FeeStructureSeeder::class,
            FeePaymentSeeder::class,
            ExamSeeder::class,
            ExamResultSeeder::class,
            AttendanceSeeder::class,
            AnnouncementSeeder::class,
            MessageSeeder::class,
            ActivityLogSeeder::class,
        ]);
    }
}
