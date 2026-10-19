<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'teacher_profile_id' => 'required|exists:teacher_profiles,id',
            'school_class_id'    => 'required|exists:school_classes,id',
            'section_id'         => 'required|exists:sections,id',
            'subject_id'         => 'required|exists:subjects,id',
            'academic_year_id'   => 'nullable|exists:academic_years,id',
        ];
    }
}
