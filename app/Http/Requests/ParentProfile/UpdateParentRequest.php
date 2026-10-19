<?php

namespace App\Http\Requests\ParentProfile;

use Illuminate\Foundation\Http\FormRequest;

class UpdateParentRequest extends FormRequest
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
            'name'         => ['sometimes', 'string', 'max:255'],
            'phone'        => ['nullable', 'string', 'max:25'],
            'occupation'   => ['nullable', 'string', 'max:255'],
            'relationship' => ['nullable', 'string', 'max:50'],
            'address'      => ['nullable', 'string'],
        ];
    }
}
