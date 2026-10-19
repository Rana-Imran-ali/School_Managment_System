<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeePaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'student_profile_id' => $this->student_profile_id,
            'student_name'       => $this->studentProfile?->user?->name,
            'admission_number'   => $this->studentProfile?->admission_number,
            'fee_structure_id'   => $this->fee_structure_id,
            'fee_type_id'        => $this->fee_type_id,
            'fee_type_name'      => $this->feeType?->name,
            'amount_paid'        => (float) $this->amount_paid,
            'payment_date'       => $this->payment_date?->format('Y-m-d') ?? $this->payment_date,
            'payment_method'     => $this->payment_method,
            'transaction_id'     => $this->transaction_id,
            'status'             => $this->status,
            'receipt_number'     => $this->receipt_number,
            'remarks'            => $this->remarks,
            'created_at'         => $this->created_at?->toIso8601String(),
        ];
    }
}
