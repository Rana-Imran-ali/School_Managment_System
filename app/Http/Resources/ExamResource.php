<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamResource extends JsonResource
{
    /**
     * Transform the Exam model into a structured API response.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'term'             => $this->term,
            'start_date'       => $this->start_date?->format('Y-m-d'),
            'end_date'         => $this->end_date?->format('Y-m-d'),
            'academic_year_id' => $this->academic_year_id,
            'academic_year'    => $this->whenLoaded('academicYear', fn() => [
                'id'   => $this->academicYear->id,
                'name' => $this->academicYear->name,
            ]),
            'results_count'    => $this->whenCounted('examResults'),
            'created_at'       => $this->created_at?->toIso8601String(),
        ];
    }
}
