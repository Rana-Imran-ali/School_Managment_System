<?php

namespace App\Http\Requests\SchoolClass;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSchoolClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('class') ?? $this->route('school_class');

        return [
            'name'          => ['sometimes', 'required', 'string', 'max:100', Rule::unique('school_classes', 'name')->ignore($id)],
            'numeric_value' => 'nullable|integer',
            'description'   => 'nullable|string',
        ];
    }
}
