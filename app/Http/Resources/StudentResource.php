<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'user_id'            => $this->user_id,
            'admission_number'   => $this->admission_number,
            'roll_number'        => $this->roll_number,
            'admission_date'     => $this->admission_date?->format('Y-m-d'),
            'blood_group'        => $this->blood_group,
            'religion'           => $this->religion,
            'user'               => [
                'id'            => $this->user?->id,
                'name'          => $this->user?->name,
                'email'         => $this->user?->email,
                'phone'         => $this->user?->phone,
                'gender'        => $this->user?->gender,
                'date_of_birth' => $this->user?->date_of_birth?->format('Y-m-d'),
                'address'       => $this->user?->address,
                'avatar'        => $this->user?->avatar,
                'status'        => $this->user?->status,
            ],
            'class' => $this->whenLoaded('currentClass', fn() => [
                'id'   => $this->currentClass->id,
                'name' => $this->currentClass->name,
            ]),
            'section' => $this->whenLoaded('currentSection', fn() => [
                'id'   => $this->currentSection->id,
                'name' => $this->currentSection->name,
            ]),
            'parent' => $this->whenLoaded('parent', fn() => [
                'id'           => $this->parent->id,
                'occupation'   => $this->parent->occupation,
                'relationship' => $this->parent->relationship,
                'guardian_name'=> $this->parent->user?->name,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
