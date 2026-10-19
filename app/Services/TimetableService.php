<?php

namespace App\Services;

use App\Contracts\Services\TimetableServiceInterface;
use App\Models\Timetable;
use Illuminate\Database\Eloquent\Collection;

class TimetableService implements TimetableServiceInterface
{
    public function getTimetable(array $filters = []): Collection
    {
        $query = Timetable::with([
            'schoolClass',
            'section',
            'subject',
            'teacher.user',
            'period',
        ]);

        if (!empty($filters['class_id'])) {
            $query->where('school_class_id', $filters['class_id']);
        }

        if (!empty($filters['section_id'])) {
            $query->where('section_id', $filters['section_id']);
        }

        if (!empty($filters['teacher_id'])) {
            $query->where('teacher_profile_id', $filters['teacher_id']);
        }

        if (!empty($filters['day'])) {
            $query->where('day_of_week', strtolower($filters['day']));
        }

        return $query->get();
    }

    public function checkConflict(int $teacherId, int $sectionId, int $periodId, string $dayOfWeek, ?string $roomNumber = null, ?int $ignoreId = null): ?string
    {
        // 1. Instructor conflict
        $teacherQuery = Timetable::where('teacher_profile_id', $teacherId)
            ->where('period_id', $periodId)
            ->where('day_of_week', $dayOfWeek);

        if ($ignoreId) {
            $teacherQuery->where('id', '!=', $ignoreId);
        }

        if ($teacherQuery->exists()) {
            return 'Schedule conflict: This instructor is already allocated to another lecture during this period.';
        }

        // 2. Room conflict
        if (!empty($roomNumber)) {
            $roomQuery = Timetable::where('room_number', $roomNumber)
                ->where('period_id', $periodId)
                ->where('day_of_week', $dayOfWeek);

            if ($ignoreId) {
                $roomQuery->where('id', '!=', $ignoreId);
            }

            if ($roomQuery->exists()) {
                return "Facility conflict: Room {$roomNumber} is already occupied by another class during this period.";
            }
        }

        return null;
    }

    public function createEntry(array $data): Timetable
    {
        $conflict = $this->checkConflict(
            $data['teacher_profile_id'],
            $data['section_id'],
            $data['period_id'],
            $data['day_of_week'],
            $data['room_number'] ?? null
        );

        if ($conflict) {
            throw new \InvalidArgumentException($conflict);
        }

        $slot = Timetable::updateOrCreate(
            [
                'school_class_id' => $data['school_class_id'],
                'section_id'      => $data['section_id'],
                'period_id'       => $data['period_id'],
                'day_of_week'     => $data['day_of_week'],
            ],
            [
                'subject_id'         => $data['subject_id'],
                'teacher_profile_id' => $data['teacher_profile_id'],
                'room_number'        => $data['room_number'] ?? null,
                'academic_year_id'   => $data['academic_year_id'] ?? null,
            ]
        );

        return $slot->load(['subject', 'teacher.user', 'period', 'schoolClass', 'section']);
    }

    public function deleteEntry(int $id): bool
    {
        $slot = Timetable::find($id);
        return $slot ? (bool) $slot->delete() : false;
    }
}
