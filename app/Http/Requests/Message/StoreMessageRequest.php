<?php

namespace App\Http\Requests\Message;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'receiver_id' => ['required', 'exists:users,id'],
            'subject'     => ['nullable', 'string', 'max:255'],
            'message'     => ['required', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'receiver_id.exists' => 'The specified recipient does not exist.',
            'message.required'   => 'Message body cannot be empty.',
        ];
    }
}
