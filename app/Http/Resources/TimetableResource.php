<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimetableResource extends JsonResource
{
    /**
     * Transform the Timetable model into a structured API response.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'day_of_week'     => $this->day_of_week,
            'room_number'     => $this->room_number,
            'school_class'    => $this->whenLoaded('schoolClass', fn() => [
                'id'   => $this->schoolClass->id,
                'name' => $this->schoolClass->name,
            ]),
            'section'         => $this->whenLoaded('section', fn() => [
                'id'   => $this->section->id,
                'name' => $this->section->name,
            ]),
            'subject'         => $this->whenLoaded('subject', fn() => [
                'id'   => $this->subject->id,
                'name' => $this->subject->name,
                'code' => $this->subject->code,
            ]),
            'teacher'         => $this->whenLoaded('teacher', fn() => [
                'id'   => $this->teacher->id,
                'name' => $this->teacher->user?->name,
            ]),
            'period'          => $this->whenLoaded('period', fn() => [
                'id'         => $this->period->id,
                'name'       => $this->period->name,
                'start_time' => $this->period->start_time,
                'end_time'   => $this->period->end_time,
            ]),
            'academic_year'   => $this->whenLoaded('academicYear'),
            'created_at'      => $this->created_at?->toIso8601String(),
        ];
    }
}
