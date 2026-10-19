<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherAssignmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'teacher_profile_id'  => $this->teacher_profile_id,
            'school_class_id'     => $this->school_class_id,
            'section_id'          => $this->section_id,
            'subject_id'          => $this->subject_id,
            'academic_year_id'    => $this->academic_year_id,
            'teacher'             => $this->whenLoaded('teacherProfile', fn() => [
                'id'             => $this->teacherProfile->id,
                'employee_id'    => $this->teacherProfile->employee_id,
                'designation'    => $this->teacherProfile->designation,
                'name'           => $this->teacherProfile->user?->name,
            ]),
            'school_class'        => $this->whenLoaded('schoolClass', fn() => [
                'id'            => $this->schoolClass->id,
                'name'          => $this->schoolClass->name,
                'numeric_value' => $this->schoolClass->numeric_value,
            ]),
            'section'             => $this->whenLoaded('section', fn() => [
                'id'       => $this->section->id,
                'name'     => $this->section->name,
            ]),
            'subject'             => $this->whenLoaded('subject', fn() => [
                'id'   => $this->subject->id,
                'name' => $this->subject->name,
                'code' => $this->subject->code,
            ]),
            'academic_year'       => $this->whenLoaded('academicYear', fn() => [
                'id'   => $this->academicYear->id,
                'name' => $this->academicYear->name,
            ]),
            'created_at'          => $this->created_at?->toIso8601String(),
            'updated_at'          => $this->updated_at?->toIso8601String(),
        ];
    }
}
