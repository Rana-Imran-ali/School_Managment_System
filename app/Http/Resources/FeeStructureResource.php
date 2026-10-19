<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeeStructureResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'school_class_id'  => $this->school_class_id,
            'fee_type_id'      => $this->fee_type_id,
            'academic_year_id' => $this->academic_year_id,
            'amount'           => (float) $this->amount,
            'due_date'         => $this->due_date?->format('Y-m-d'),
            'school_class'     => $this->whenLoaded('schoolClass', fn() => [
                'id'            => $this->schoolClass->id,
                'name'          => $this->schoolClass->name,
                'numeric_value' => $this->schoolClass->numeric_value,
            ]),
            'fee_type'         => $this->whenLoaded('feeType', fn() => [
                'id'          => $this->feeType->id,
                'name'        => $this->feeType->name,
                'description' => $this->feeType->description,
            ]),
            'academic_year'    => $this->whenLoaded('academicYear', fn() => [
                'id'         => $this->academicYear->id,
                'name'       => $this->academicYear->name,
                'is_current' => (bool) $this->academicYear->is_current,
            ]),
            'created_at'       => $this->created_at?->toIso8601String(),
            'updated_at'       => $this->updated_at?->toIso8601String(),
        ];
    }
}
