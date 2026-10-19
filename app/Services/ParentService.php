<?php

namespace App\Services;

use App\Contracts\Services\ParentServiceInterface;
use App\Models\ParentProfile;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ParentService implements ParentServiceInterface
{
    public function getParents(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = ParentProfile::with(['user', 'students.user', 'students.currentClass']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function ($uq) use ($search) {
                $uq->where('name', 'like', "%{$search}%")
                   ->orWhere('email', 'like', "%{$search}%")
                   ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function findParent(int $id): ?ParentProfile
    {
        return ParentProfile::with(['user', 'students.user', 'students.currentClass', 'students.currentSection'])->find($id);
    }

    public function createParent(array $data): ParentProfile
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password'] ?? 'parent123'),
                'role'     => 'parent',
                'phone'    => $data['phone'] ?? null,
                'address'  => $data['address'] ?? null,
                'status'   => 'active',
            ]);

            $parent = ParentProfile::create([
                'user_id'      => $user->id,
                'occupation'   => $data['occupation'] ?? null,
                'relationship' => $data['relationship'] ?? 'Guardian',
            ]);

            return $parent->load('user');
        });
    }

    public function updateParent(ParentProfile $parent, array $data): ParentProfile
    {
        DB::transaction(function () use ($parent, $data) {
            $userFields = array_intersect_key($data, array_flip(['name', 'email', 'phone', 'address', 'status']));
            if (!empty($userFields)) {
                $parent->user->update($userFields);
            }

            $profileFields = array_intersect_key($data, array_flip(['occupation', 'relationship']));
            if (!empty($profileFields)) {
                $parent->update($profileFields);
            }
        });

        return $parent->fresh(['user', 'students.user', 'students.currentClass', 'students.currentSection']);
    }

    public function deleteParent(ParentProfile $parent): bool
    {
        return DB::transaction(function () use ($parent) {
            return (bool) $parent->user->delete();
        });
    }
}
