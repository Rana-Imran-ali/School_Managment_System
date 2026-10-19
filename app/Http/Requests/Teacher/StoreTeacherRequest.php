<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'       => ['nullable', 'string', 'min:6'],
            'phone'          => ['nullable', 'string', 'max:25'],
            'employee_id'    => ['required', 'string', 'max:50', 'unique:teacher_profiles,employee_id'],
            'qualification'  => ['nullable', 'string', 'max:255'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'joining_date'   => ['nullable', 'date'],
            'salary'         => ['nullable', 'numeric', 'min:0'],
            'bio'            => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'employee_id.unique' => 'This Employee ID is already registered in the system.',
            'email.unique'       => 'An account with this email address already exists.',
        ];
    }
}
