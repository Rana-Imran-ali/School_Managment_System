<?php

namespace App\Http\Requests\Exam;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exam_id'                      => ['required', 'exists:exams,id'],
            'subject_id'                   => ['required', 'exists:subjects,id'],
            'results'                      => ['required', 'array', 'min:1'],
            'results.*.student_profile_id' => ['required', 'exists:student_profiles,id'],
            'results.*.marks_obtained'     => ['required', 'numeric', 'min:0'],
            'results.*.total_marks'        => ['nullable', 'numeric', 'min:1'],
            'results.*.remarks'            => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'results.*.marks_obtained.required' => 'Marks obtained is required for each student.',
            'results.*.student_profile_id.exists' => 'Invalid student record provided.',
        ];
    }
}
