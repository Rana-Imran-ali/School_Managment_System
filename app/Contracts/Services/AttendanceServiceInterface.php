<?php

namespace App\Contracts\Services;

use App\Models\Attendance;
use Illuminate\Database\Eloquent\Collection;

interface AttendanceServiceInterface
{
    /**
     * Get attendance records filtered by criteria.
     */
    public function getAttendance(array $filters): Collection;

    /**
     * Record or update bulk attendance for a class/section on a given date.
     *
     * @param array $records Array of ['student_id', 'status', 'remarks']
     * @param string $date
     * @param int $classId
     * @param int|null $sectionId
     * @param int $recordedBy
     * @return array
     */
    public function recordAttendance(array $records, string $date, int $classId, ?int $sectionId, int $recordedBy): array;

    /**
     * Get attendance percentage summary for a student.
     *
     * @param int $studentId
     * @return array
     */
    public function getStudentSummary(int $studentId): array;
}
