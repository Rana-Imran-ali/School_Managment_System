<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'email'         => $this->email,
            'role'          => $this->role,
            'phone'         => $this->phone,
            'gender'        => $this->gender,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'address'       => $this->address,
            'avatar'        => $this->avatar,
            'status'        => $this->status,
            'student_profile' => new StudentResource($this->whenLoaded('studentProfile')),
            'teacher_profile' => new TeacherResource($this->whenLoaded('teacherProfile')),
            'parent_profile'  => new ParentResource($this->whenLoaded('parentProfile')),
            'created_at'      => $this->created_at?->toIso8601String(),
        ];
    }
}
