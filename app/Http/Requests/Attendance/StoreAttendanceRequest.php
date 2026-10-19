<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_class_id'             => ['required', 'exists:school_classes,id'],
            'section_id'                  => ['required', 'exists:sections,id'],
            'date'                        => ['required', 'date'],
            'records'                     => ['required', 'array', 'min:1'],
            'records.*.student_profile_id'=> ['required', 'exists:student_profiles,id'],
            'records.*.status'            => ['required', 'in:present,absent,late,excused'],
            'records.*.remarks'           => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'records.*.status.in' => 'Attendance status must be present, absent, late, or excused.',
        ];
    }
}
