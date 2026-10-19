<?php

namespace App\Contracts\Services;

use App\Models\ParentProfile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ParentServiceInterface
{
    public function getParents(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function findParent(int $id): ?ParentProfile;

    public function createParent(array $data): ParentProfile;

    public function updateParent(ParentProfile $parent, array $data): ParentProfile;

    public function deleteParent(ParentProfile $parent): bool;
}
