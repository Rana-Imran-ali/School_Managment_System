<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'student_profile_id' => $this->student_profile_id,
            'student_name'       => $this->studentProfile?->user?->name,
            'roll_number'        => $this->studentProfile?->roll_number,
            'admission_number'   => $this->studentProfile?->admission_number,
            'school_class_id'    => $this->school_class_id,
            'section_id'         => $this->section_id,
            'date'               => $this->date?->format('Y-m-d') ?? $this->date,
            'status'             => $this->status,
            'remarks'            => $this->remarks,
        ];
    }
}
