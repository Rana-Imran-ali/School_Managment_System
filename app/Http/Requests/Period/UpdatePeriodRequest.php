<?php

namespace App\Http\Requests\Period;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => 'sometimes|string|max:100',
            'start_time' => 'sometimes',
            'end_time'   => 'sometimes',
            'is_break'   => 'boolean',
        ];
    }
}
