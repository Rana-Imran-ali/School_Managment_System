<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'point'       => (float) $this->point,
            'grade_point' => (float) $this->point,
            'mark_from'   => (float) $this->mark_from,
            'min_mark'    => (float) $this->mark_from,
            'mark_to'     => (float) $this->mark_to,
            'max_mark'    => (float) $this->mark_to,
            'remarks'     => $this->remarks,
            'description' => $this->remarks,
            'created_at'  => $this->created_at?->toIso8601String(),
            'updated_at'  => $this->updated_at?->toIso8601String(),
        ];
    }
}
