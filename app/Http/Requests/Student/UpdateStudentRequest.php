<?php

namespace App\Http\Requests\Student;

use App\Models\StudentProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $studentParam = $this->route('student') ?? $this->route('id');
        $student = is_object($studentParam) ? $studentParam : StudentProfile::find($studentParam);
        $userId = $student ? $student->user_id : null;

        return [
            'name'               => ['sometimes', 'string', 'max:255'],
            'email'              => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'phone'              => ['nullable', 'string', 'max:25'],
            'current_class_id'   => ['sometimes', 'exists:school_classes,id'],
            'current_section_id' => ['sometimes', 'exists:sections,id'],
            'roll_number'        => ['nullable', 'string', 'max:50'],
            'blood_group'        => ['nullable', 'string', 'max:10'],
            'status'             => ['sometimes', 'in:active,inactive,suspended'],
        ];
    }
}
