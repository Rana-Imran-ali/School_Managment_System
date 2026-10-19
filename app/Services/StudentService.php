<?php

namespace App\Services;

use App\Contracts\Services\StudentServiceInterface;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentService implements StudentServiceInterface
{
    public function getStudents(array $filters = [], int $perPage = 15): LengthAwarePaginator|Collection
    {
        $query = StudentProfile::with(['user', 'currentClass', 'currentSection', 'parent.user']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('admission_number', 'like', "%{$search}%")
                  ->orWhere('roll_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['class_id'])) {
            $query->where('current_class_id', $filters['class_id']);
        }

        if (!empty($filters['section_id'])) {
            $query->where('current_section_id', $filters['section_id']);
        }

        return $query->paginate($perPage);
    }

    public function findStudent(int $id): ?StudentProfile
    {
        return StudentProfile::with([
            'user',
            'currentClass',
            'currentSection',
            'parent.user',
            'attendances' => fn($q) => $q->latest()->take(10),
            'examResults.subject',
            'feePayments' => fn($q) => $q->latest()->take(5),
        ])->find($id);
    }

    public function createStudent(array $data): StudentProfile
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'          => $data['name'],
                'email'         => $data['email'],
                'password'      => Hash::make($data['password'] ?? 'student123'),
                'role'          => 'student',
                'phone'         => $data['phone'] ?? null,
                'gender'        => $data['gender'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'address'       => $data['address'] ?? null,
                'status'        => 'active',
            ]);

            $student = StudentProfile::create([
                'user_id'            => $user->id,
                'admission_number'   => $data['admission_number'],
                'roll_number'        => $data['roll_number'] ?? null,
                'admission_date'     => $data['admission_date'] ?? now(),
                'current_class_id'   => $data['current_class_id'],
                'current_section_id' => $data['current_section_id'],
                'parent_id'          => $data['parent_id'] ?? null,
                'blood_group'        => $data['blood_group'] ?? null,
                'religion'           => $data['religion'] ?? null,
            ]);

            return $student->load(['user', 'currentClass', 'currentSection', 'parent.user']);
        });
    }

    public function updateStudent(StudentProfile $student, array $data): StudentProfile
    {
        DB::transaction(function () use ($student, $data) {
            $userFields = array_intersect_key($data, array_flip(['name', 'email', 'phone', 'gender', 'date_of_birth', 'address', 'status']));
            if (!empty($userFields)) {
                $student->user->update($userFields);
            }

            $profileFields = array_intersect_key($data, array_flip([
                'current_class_id',
                'current_section_id',
                'roll_number',
                'admission_number',
                'parent_id',
                'blood_group',
                'religion',
            ]));
            if (!empty($profileFields)) {
                $student->update($profileFields);
            }
        });

        return $student->fresh(['user', 'currentClass', 'currentSection', 'parent.user']);
    }

    public function deleteStudent(StudentProfile $student): bool
    {
        return DB::transaction(function () use ($student) {
            return (bool) $student->user->delete();
        });
    }
}
