<?php

namespace App\Http\Requests\AcademicYear;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAcademicYearRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('academic_year');

        return [
            'name'       => ['sometimes', 'required', 'string', 'max:100', Rule::unique('academic_years', 'name')->ignore($id)],
            'start_date' => 'sometimes|required|date',
            'end_date'   => 'sometimes|required|date|after:start_date',
            'is_current' => 'boolean',
            'status'     => 'nullable|string|in:active,completed,upcoming',
        ];
    }
}
