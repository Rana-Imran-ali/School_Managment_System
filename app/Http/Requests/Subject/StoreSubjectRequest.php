<?php

namespace App\Http\Requests\Subject;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_class_id' => 'nullable|exists:school_classes,id',
            'name'            => 'required|string|max:100',
            'code'            => 'required|string|max:50|unique:subjects,code',
            'type'            => 'required|in:core,elective,practical',
            'credit_hours'    => 'nullable|numeric|min:0',
            'description'     => 'nullable|string',
        ];
    }
}
