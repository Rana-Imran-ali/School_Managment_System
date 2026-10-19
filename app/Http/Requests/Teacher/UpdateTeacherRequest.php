<?php

namespace App\Http\Requests\Teacher;

use App\Models\TeacherProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $teacherParam = $this->route('teacher') ?? $this->route('id');
        $teacher = is_object($teacherParam) ? $teacherParam : TeacherProfile::find($teacherParam);
        $userId = $teacher ? $teacher->user_id : null;

        return [
            'name'           => ['sometimes', 'string', 'max:255'],
            'email'          => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'phone'          => ['nullable', 'string', 'max:25'],
            'qualification'  => ['nullable', 'string', 'max:255'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'salary'         => ['nullable', 'numeric', 'min:0'],
            'bio'            => ['nullable', 'string'],
            'status'         => ['sometimes', 'in:active,inactive,suspended'],
        ];
    }
}
