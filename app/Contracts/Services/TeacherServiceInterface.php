<?php

namespace App\Contracts\Services;

use App\Models\TeacherProfile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface TeacherServiceInterface
{
    public function getTeachers(array $filters = [], int $perPage = 15): LengthAwarePaginator|Collection;

    public function findTeacher(int $id): ?TeacherProfile;

    public function createTeacher(array $data): TeacherProfile;

    public function updateTeacher(TeacherProfile $teacher, array $data): TeacherProfile;

    public function deleteTeacher(TeacherProfile $teacher): bool;
}
