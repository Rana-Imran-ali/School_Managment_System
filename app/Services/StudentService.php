<?php

namespace App\Services;

use App\Contracts\Services\StudentServiceInterface;
use App\Mail\UserInvitationMail;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

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
            $defaultPassword = !empty($data['password']) ? $data['password'] : 'password123';

            $user = User::create([
                'name'          => $data['name'],
                'email'         => $data['email'],
                'password'      => Hash::make($defaultPassword),
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

            // Generate password setup token and dispatch email notification
            try {
                $token = Str::random(64);
                DB::table('password_reset_tokens')->updateOrInsert(
                    ['email' => $user->email],
                    [
                        'token'      => Hash::make($token),
                        'created_at' => now(),
                    ]
                );

                $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
                $setPasswordUrl = "{$frontendUrl}/set-password?token={$token}&email=" . urlencode($user->email);

                Mail::to($user->email)->send(new UserInvitationMail($user, $setPasswordUrl, $defaultPassword));
            } catch (\Throwable $e) {
                Log::warning("Could not dispatch student password invitation mail to {$user->email}: " . $e->getMessage());
            }

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
