<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExamResultResource extends JsonResource
{
    /**
     * Transform the ExamResult model into a structured API response.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'exam_id'            => $this->exam_id,
            'subject_id'         => $this->subject_id,
            'student_profile_id' => $this->student_profile_id,
            'marks_obtained'     => (float) $this->marks_obtained,
            'total_marks'        => (float) $this->total_marks,
            'grade'              => $this->grade?->name ?? 'N/A',
            'remarks'            => $this->remarks,
            'percentage'         => $this->total_marks > 0
                ? round(($this->marks_obtained / $this->total_marks) * 100, 2)
                : 0,
            'exam'    => $this->whenLoaded('exam', fn() => [
                'id'   => $this->exam->id,
                'name' => $this->exam->name,
                'term' => $this->exam->term,
            ]),
            'subject' => $this->whenLoaded('subject', fn() => [
                'id'   => $this->subject->id,
                'name' => $this->subject->name,
                'code' => $this->subject->code,
            ]),
            'student' => $this->whenLoaded('student', fn() => [
                'id'               => $this->student->id,
                'name'             => $this->student->user?->name,
                'admission_number' => $this->student->admission_number,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
