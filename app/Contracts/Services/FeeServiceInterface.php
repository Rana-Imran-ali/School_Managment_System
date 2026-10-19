<?php

namespace App\Contracts\Services;

use App\Models\FeePayment;
use App\Models\FeeStructure;
use Illuminate\Database\Eloquent\Collection;

interface FeeServiceInterface
{
    public function getFeeStructures(array $filters = []): Collection;

    public function createFeeStructure(array $data): FeeStructure;

    public function recordPayment(array $data): FeePayment;

    public function getStudentFeeLedger(int $studentId): array;
}
