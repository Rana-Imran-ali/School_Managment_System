<?php

namespace App\Contracts\Services;

use App\Models\Timetable;
use Illuminate\Database\Eloquent\Collection;

interface TimetableServiceInterface
{
    public function getTimetable(array $filters = []): Collection;

    public function createEntry(array $data): Timetable;

    public function checkConflict(int $teacherId, int $sectionId, int $periodId, string $dayOfWeek, ?string $roomNumber = null, ?int $ignoreId = null): ?string;

    public function deleteEntry(int $id): bool;
}
