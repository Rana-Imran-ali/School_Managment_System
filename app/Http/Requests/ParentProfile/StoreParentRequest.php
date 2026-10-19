<?php

namespace App\Http\Requests\ParentProfile;

use Illuminate\Foundation\Http\FormRequest;

class StoreParentRequest extends FormRequest
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
            'name'         => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'     => ['nullable', 'string', 'min:6'],
            'phone'        => ['nullable', 'string', 'max:25'],
            'occupation'   => ['nullable', 'string', 'max:255'],
            'relationship' => ['nullable', 'string', 'max:50'],
            'address'      => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'A parent account with this email address already exists.',
        ];
    }
}
