<?php

namespace App\Http\Requests\Fee;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeeStructureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fee_type_id'      => ['required', 'exists:fee_types,id'],
            'school_class_id'  => ['required', 'exists:school_classes,id'],
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'amount'           => ['required', 'numeric', 'min:0'],
            'due_date'         => ['required', 'date'],
        ];
    }
}
