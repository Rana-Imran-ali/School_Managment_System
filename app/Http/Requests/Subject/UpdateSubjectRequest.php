<?php

namespace App\Http\Requests\Subject;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('subject');

        return [
            'school_class_id' => 'nullable|exists:school_classes,id',
            'name'            => 'sometimes|string|max:100',
            'code'            => ['sometimes', 'string', 'max:50', Rule::unique('subjects', 'code')->ignore($id)],
            'type'            => 'sometimes|in:core,elective,practical',
            'credit_hours'    => 'nullable|numeric|min:0',
            'description'     => 'nullable|string',
        ];
    }
}
