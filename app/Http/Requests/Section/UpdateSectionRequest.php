<?php

namespace App\Http\Requests\Section;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_class_id' => 'sometimes|exists:school_classes,id',
            'name'            => 'sometimes|string|max:50',
            'capacity'        => 'nullable|integer|min:1',
        ];
    }
}
