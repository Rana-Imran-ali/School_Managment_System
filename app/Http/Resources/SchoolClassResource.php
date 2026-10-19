<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SchoolClassResource extends JsonResource
{
    /**
     * Transform the SchoolClass model into a structured API response.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'numeric_value' => $this->numeric_value,
            'description'   => $this->description,
            'sections'      => $this->whenLoaded('sections', fn() =>
                $this->sections->map(fn($s) => [
                    'id'       => $s->id,
                    'name'     => $s->name,
                    'capacity' => $s->capacity,
                ])
            ),
            'students_count' => $this->whenCounted('students'),
            'created_at'     => $this->created_at?->toIso8601String(),
        ];
    }
}
