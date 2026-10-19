<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'user_id'        => $this->user_id,
            'employee_id'    => $this->employee_id,
            'qualification'  => $this->qualification,
            'specialization' => $this->specialization,
            'joining_date'   => $this->joining_date?->format('Y-m-d'),
            'salary'         => (float) $this->salary,
            'bio'            => $this->bio,
            'user'           => [
                'id'     => $this->user?->id,
                'name'   => $this->user?->name,
                'email'  => $this->user?->email,
                'phone'  => $this->user?->phone,
                'avatar' => $this->user?->avatar,
                'status' => $this->user?->status,
            ],
            'assignments' => $this->whenLoaded('assignments'),
            'created_at'  => $this->created_at?->toIso8601String(),
        ];
    }
}
