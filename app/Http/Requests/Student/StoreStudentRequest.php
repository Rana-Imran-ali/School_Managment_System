<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'               => ['required', 'string', 'max:255'],
            'email'              => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password'           => ['nullable', 'string', 'min:6'],
            'phone'              => ['nullable', 'string', 'max:25'],
            'gender'             => ['nullable', 'string', 'in:male,female,other'],
            'date_of_birth'      => ['nullable', 'date'],
            'address'            => ['nullable', 'string'],
            'admission_number'   => ['required', 'string', 'max:100', 'unique:student_profiles,admission_number'],
            'roll_number'        => ['nullable', 'string', 'max:50'],
            'current_class_id'   => ['required', 'exists:school_classes,id'],
            'current_section_id' => ['required', 'exists:sections,id'],
            'parent_id'          => ['nullable', 'exists:parent_profiles,id'],
            'blood_group'        => ['nullable', 'string', 'max:10'],
            'religion'           => ['nullable', 'string', 'max:50'],
        ];
    }
}
