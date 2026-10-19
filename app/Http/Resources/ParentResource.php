<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParentResource extends JsonResource
{
    /**
     * Transform the ParentProfile model into a structured API response.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'user_id'      => $this->user_id,
            'occupation'   => $this->occupation,
            'relationship' => $this->relationship,
            'user'         => [
                'id'      => $this->user?->id,
                'name'    => $this->user?->name,
                'email'   => $this->user?->email,
                'phone'   => $this->user?->phone,
                'address' => $this->user?->address,
                'avatar'  => $this->user?->avatar,
                'status'  => $this->user?->status,
            ],
            'children'    => $this->whenLoaded('students', fn() =>
                $this->students->map(fn($s) => [
                    'id'               => $s->id,
                    'name'             => $s->user?->name,
                    'admission_number' => $s->admission_number,
                    'class'            => $s->currentClass?->name,
                ])
            ),
            'created_at'  => $this->created_at?->toIso8601String(),
        ];
    }
}
