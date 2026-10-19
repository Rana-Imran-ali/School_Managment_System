<?php

namespace App\Services;

use App\Contracts\Services\AttendanceServiceInterface;
use App\Models\Attendance;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class AttendanceService implements AttendanceServiceInterface
{
    public function getAttendance(array $filters): Collection
    {
        $date = $filters['date'] ?? date('Y-m-d');

        $query = Attendance::with(['studentProfile.user'])
            ->where('date', $date);

        if (!empty($filters['class_id'])) {
            $query->where('school_class_id', $filters['class_id']);
        }

        if (!empty($filters['section_id'])) {
            $query->where('section_id', $filters['section_id']);
        }

        return $query->get();
    }

    public function recordAttendance(array $records, string $date, int $classId, ?int $sectionId, int $recordedBy): array
    {
        return DB::transaction(function () use ($records, $date, $classId, $sectionId) {
            $results = [];
            foreach ($records as $entry) {
                $record = Attendance::updateOrCreate(
                    [
                        'student_profile_id' => $entry['student_profile_id'],
                        'school_class_id'    => $classId,
                        'section_id'         => $sectionId,
                        'date'               => $date,
                    ],
                    [
                        'status'  => $entry['status'],
                        'remarks' => $entry['remarks'] ?? null,
                    ]
                );
                $results[] = $record;
            }
            return $results;
        });
    }

    public function getStudentSummary(int $studentId): array
    {
        $query = Attendance::where('student_profile_id', $studentId);

        $total   = (clone $query)->count();
        $present = (clone $query)->where('status', 'present')->count();
        $absent  = (clone $query)->where('status', 'absent')->count();
        $late    = (clone $query)->where('status', 'late')->count();
        $excused = (clone $query)->where('status', 'excused')->count();

        $rate = $total > 0 ? round(($present / $total) * 100, 1) : 100.0;

        return [
            'total_recorded_days' => $total,
            'present_count'       => $present,
            'absent_count'        => $absent,
            'late_count'          => $late,
            'excused_count'       => $excused,
            'attendance_rate'     => $rate,
        ];
    }
}
