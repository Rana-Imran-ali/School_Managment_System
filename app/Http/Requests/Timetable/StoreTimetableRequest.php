<?php

namespace App\Http\Requests\Timetable;

use Illuminate\Foundation\Http\FormRequest;

class StoreTimetableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_class_id'    => ['required', 'exists:school_classes,id'],
            'section_id'         => ['required', 'exists:sections,id'],
            'subject_id'         => ['required', 'exists:subjects,id'],
            'teacher_profile_id' => ['required', 'exists:teacher_profiles,id'],
            'period_id'          => ['required', 'exists:periods,id'],
            'day_of_week'        => ['required', 'in:monday,tuesday,wednesday,thursday,friday,saturday'],
            'room_number'        => ['nullable', 'string', 'max:50'],
            'academic_year_id'   => ['nullable', 'exists:academic_years,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'day_of_week.in' => 'Day must be monday through saturday.',
        ];
    }
}
