<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'school_class_id' => $this->school_class_id,
            'name'            => $this->name,
            'capacity'        => $this->capacity,
            'school_class'    => $this->whenLoaded('schoolClass', fn() => [
                'id'            => $this->schoolClass->id,
                'name'          => $this->schoolClass->name,
                'numeric_value' => $this->schoolClass->numeric_value,
            ]),
            'students_count'  => $this->whenCounted('students'),
            'created_at'      => $this->created_at?->toIso8601String(),
            'updated_at'      => $this->updated_at?->toIso8601String(),
        ];
    }
}
