<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // FLAW 12 fix: restrict name to letters, spaces, hyphens, apostrophes, dots
            'name'     => ['required', 'string', 'max:255', 'regex:/^[\pL\s\-\'\.\ ]+$/u'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            // FLAW 5 fix: strong password policy
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()   // must have upper + lower case
                    ->numbers()     // must have at least one digit
                    ->symbols()     // must have at least one special char
                    ->uncompromised(), // checks against HaveIBeenPwned
            ],
            // FLAW 1 fix: 'role' field is removed entirely — role is always assigned server-side
            'phone'    => ['nullable', 'string', 'max:25'],
            'gender'   => ['nullable', 'string', 'in:male,female,other'],
        ];
    }

    public function messages(): array
    {
        return [
            'password.uncompromised' => 'This password has appeared in a known data breach. Please choose a different password.',
        ];
    }
}
