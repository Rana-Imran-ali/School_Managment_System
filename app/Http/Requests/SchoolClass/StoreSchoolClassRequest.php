<?php

namespace App\Http\Requests\SchoolClass;

use Illuminate\Foundation\Http\FormRequest;

class StoreSchoolClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => 'required|string|max:100|unique:school_classes,name',
            'numeric_value' => 'nullable|integer',
            'description'   => 'nullable|string',
        ];
    }
}
