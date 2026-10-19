<?php

namespace App\Services;

use App\Contracts\Services\FeeServiceInterface;
use App\Models\FeePayment;
use App\Models\FeeStructure;
use App\Models\StudentProfile;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FeeService implements FeeServiceInterface
{
    public function getFeeStructures(array $filters = []): Collection
    {
        $query = FeeStructure::with(['feeType', 'schoolClass', 'academicYear']);

        if (!empty($filters['class_id'])) {
            $query->where('school_class_id', $filters['class_id']);
        }

        if (!empty($filters['academic_year_id'])) {
            $query->where('academic_year_id', $filters['academic_year_id']);
        }

        return $query->get();
    }

    public function createFeeStructure(array $data): FeeStructure
    {
        $structure = FeeStructure::create($data);
        return $structure->load(['feeType', 'schoolClass', 'academicYear']);
    }

    public function recordPayment(array $data): FeePayment
    {
        return DB::transaction(function () use ($data) {
            $year = date('Y');
            $uniqueSuffix = strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
            $data['receipt_number'] = $data['receipt_number'] ?? "RCP-{$year}-{$uniqueSuffix}";
            $data['recorded_by']    = $data['recorded_by'] ?? Auth::id();

            $payment = FeePayment::create($data);
            return $payment->load(['studentProfile.user', 'feeType', 'feeStructure']);
        });
    }

    public function getStudentFeeLedger(int $studentId): array
    {
        $student = StudentProfile::with(['user', 'currentClass'])->findOrFail($studentId);

        $payments = FeePayment::with(['feeType', 'feeStructure'])
            ->where('student_profile_id', $studentId)
            ->latest('payment_date')
            ->get();

        $structures = [];
        if ($student->current_class_id) {
            $structures = FeeStructure::with('feeType')
                ->where('school_class_id', $student->current_class_id)
                ->get();
        }

        $totalExpected = $structures->sum('amount');
        $totalPaid     = $payments->where('status', 'paid')->sum('amount_paid');
        $balance       = max(0, $totalExpected - $totalPaid);

        return [
            'student' => [
                'id'               => $student->id,
                'name'             => $student->user?->name,
                'admission_number' => $student->admission_number,
                'class'            => $student->currentClass?->name,
            ],
            'fee_structures'  => $structures,
            'payments'        => $payments,
            'total_invoiced'  => (float) $totalExpected,
            'total_paid'      => (float) $totalPaid,
            'outstanding_due' => (float) $balance,
        ];
    }
}
