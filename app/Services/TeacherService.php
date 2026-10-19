<?php

namespace App\Services;

use App\Contracts\Services\TeacherServiceInterface;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TeacherService implements TeacherServiceInterface
{
    public function getTeachers(array $filters = [], int $perPage = 15): LengthAwarePaginator|Collection
    {
        $query = TeacherProfile::with(['user', 'assignments.subject', 'assignments.schoolClass', 'assignments.section']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('employee_id', 'like', "%{$search}%")
                  ->orWhere('specialization', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        return $query->paginate($perPage);
    }

    public function findTeacher(int $id): ?TeacherProfile
    {
        return TeacherProfile::with(['user', 'assignments.subject', 'assignments.schoolClass', 'assignments.section'])->find($id);
    }

    public function createTeacher(array $data): TeacherProfile
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password'] ?? 'teacher123'),
                'role'     => 'teacher',
                'phone'    => $data['phone'] ?? null,
                'status'   => 'active',
            ]);

            $teacher = TeacherProfile::create([
                'user_id'        => $user->id,
                'employee_id'    => $data['employee_id'],
                'qualification'  => $data['qualification'] ?? null,
                'specialization' => $data['specialization'] ?? null,
                'joining_date'   => $data['joining_date'] ?? now(),
                'salary'         => $data['salary'] ?? null,
                'bio'            => $data['bio'] ?? null,
            ]);

            return $teacher->load('user');
        });
    }

    public function updateTeacher(TeacherProfile $teacher, array $data): TeacherProfile
    {
        DB::transaction(function () use ($teacher, $data) {
            $userFields = array_intersect_key($data, array_flip(['name', 'email', 'phone', 'status']));
            if (!empty($userFields)) {
                $teacher->user->update($userFields);
            }

            $profileFields = array_intersect_key($data, array_flip([
                'employee_id',
                'qualification',
                'specialization',
                'joining_date',
                'salary',
                'bio',
            ]));
            if (!empty($profileFields)) {
                $teacher->update($profileFields);
            }
        });

        return $teacher->fresh(['user', 'assignments.subject', 'assignments.schoolClass', 'assignments.section']);
    }

    public function deleteTeacher(TeacherProfile $teacher): bool
    {
        return DB::transaction(function () use ($teacher) {
            return (bool) $teacher->user->delete();
        });
    }
}
