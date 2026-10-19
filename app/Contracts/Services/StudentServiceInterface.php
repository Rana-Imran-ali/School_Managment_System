<?php

namespace App\Contracts\Services;

use App\Models\StudentProfile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface StudentServiceInterface
{
    /**
     * Get paginated or filtered list of students.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator|Collection
     */
    public function getStudents(array $filters = [], int $perPage = 15): LengthAwarePaginator|Collection;

    /**
     * Find student by ID with all standard relations.
     *
     * @param int $id
     * @return StudentProfile|null
     */
    public function findStudent(int $id): ?StudentProfile;

    /**
     * Create a new student (user account + student profile).
     *
     * @param array $data
     * @return StudentProfile
     */
    public function createStudent(array $data): StudentProfile;

    /**
     * Update an existing student profile and associated user.
     *
     * @param StudentProfile $student
     * @param array $data
     * @return StudentProfile
     */
    public function updateStudent(StudentProfile $student, array $data): StudentProfile;

    /**
     * Delete student profile and related records.
     *
     * @param StudentProfile $student
     * @return bool
     */
    public function deleteStudent(StudentProfile $student): bool;
}
